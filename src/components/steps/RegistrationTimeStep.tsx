import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import { RegistrationTimeStepSchema, type RegistrationTimeStepValues } from '@/lib/validators/poolCreationSchemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'

interface RegistrationTimeStepProps {
    initialData?: Partial<RegistrationTimeStepValues>
    onNext: (data: RegistrationTimeStepValues) => void
    onBack?: () => void
}

export function RegistrationTimeStep({ initialData, onNext, onBack }: RegistrationTimeStepProps) {
    const form = useForm<RegistrationTimeStepValues>({
        resolver: zodResolver(RegistrationTimeStepSchema),
        defaultValues: {
            registrationEnd: initialData?.registrationEnd ?? new Date(new Date().setDate(new Date().getDate() + 7)), // Default to 7 days from now
            poolVisibility: initialData?.poolVisibility ?? 'public',
        },
    })

    function onSubmit(data: RegistrationTimeStepValues) {
        onNext(data)
    }

    return (
        <Form {...form}>
            <form
                onSubmit={() => form.handleSubmit(onSubmit)}
                className='mx-auto flex w-full max-w-md flex-col items-center p-4 sm:p-8'>
                <h2 className='mb-1 text-center text-2xl font-semibold'>Registration Time & Visibility</h2>
                <p className='text-muted-foreground mb-6 text-center text-sm'>
                    When can participants register and who can see this pool?
                </p>

                <div className='mb-8 w-full space-y-6'>
                    <FormField
                        control={form.control}
                        name='registrationEnd'
                        render={({ field }) => (
                            <FormItem className='flex flex-col'>
                                <FormLabel>Registration End Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={'outline'}
                                                className={cn(
                                                    'w-full pl-3 text-left font-normal',
                                                    !field.value && 'text-muted-foreground',
                                                )}>
                                                {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                                <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0' align='start'>
                                        <Calendar
                                            mode='single'
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={
                                                date => date < new Date(new Date().setDate(new Date().getDate() - 1)) // Disable past dates, allow today
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormDescription>Participants can register until the end of this day.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='poolVisibility'
                        render={({ field }) => (
                            <FormItem className='space-y-3'>
                                <FormLabel>Pool Visibility</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className='flex flex-col space-y-1'>
                                        <FormItem className='flex items-center space-y-0 space-x-3'>
                                            <FormControl>
                                                <RadioGroupItem value='public' />
                                            </FormControl>
                                            <FormLabel className='font-normal'>
                                                Public (anyone can find and join)
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className='flex items-center space-y-0 space-x-3'>
                                            <FormControl>
                                                <RadioGroupItem value='private' />
                                            </FormControl>
                                            <FormLabel className='font-normal'>
                                                Private (only users with a direct link can join)
                                            </FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='mt-8 flex w-full flex-col gap-4 sm:flex-row'>
                    {onBack && (
                        <Button type='button' onClick={onBack} variant='outline' className='w-full'>
                            Back
                        </Button>
                    )}
                    <Button type='submit' className='w-full'>
                        Continue
                    </Button>
                </div>
            </form>
        </Form>
    )
}
