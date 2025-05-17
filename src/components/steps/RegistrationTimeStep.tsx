import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { RegistrationTimeStepSchema, type RegistrationTimeStepValues } from '@/lib/validators/poolCreationSchemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useForm, type SubmitHandler } from 'react-hook-form'

interface RegistrationTimeStepProps {
    initialData?: Partial<RegistrationTimeStepValues>
    onNext: (data: RegistrationTimeStepValues) => void
    onBack?: () => void
}

export function RegistrationTimeStep({ initialData, onNext, onBack }: RegistrationTimeStepProps) {
    const form = useForm<RegistrationTimeStepValues>({
        resolver: zodResolver(RegistrationTimeStepSchema),
        defaultValues: {
            registrationStart: initialData?.registrationStart ?? new Date(),
            registrationEnd: initialData?.registrationEnd ?? new Date(new Date().setDate(new Date().getDate() + 7)),
        },
        mode: 'onChange',
    })

    const onSubmit: SubmitHandler<RegistrationTimeStepValues> = data => {
        onNext(data)
    }

    return (
        <Form {...form}>
            <form
                onSubmit={e => void form.handleSubmit(onSubmit)(e)}
                className='mx-auto flex w-full max-w-md flex-col items-center p-4 sm:p-8'>
                <h2 className='mb-1 text-center text-2xl font-semibold'>Registration Time</h2>
                <p className='text-muted-foreground mb-6 text-center text-sm'>
                    When can participants register for this pool?
                </p>

                <div className='mb-8 w-full space-y-6'>
                    <FormField
                        control={form.control}
                        name='registrationStart'
                        render={({ field }) => (
                            <FormItem className='flex flex-col'>
                                <FormLabel>Registration Start Date</FormLabel>
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
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormDescription>Participants can start registering from this day.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

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
                                            disabled={date =>
                                                date < new Date(new Date().setDate(new Date().getDate() - 1))
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
                </div>

                <div className='mt-8 flex w-full flex-col gap-4 sm:flex-row'>
                    {onBack && (
                        <Button type='button' onClick={onBack} variant='outline' className='w-full'>
                            Back
                        </Button>
                    )}
                    <Button
                        type='submit'
                        className='w-full'
                        disabled={form.formState.isSubmitting || !form.formState.isValid}>
                        Continue
                    </Button>
                </div>
            </form>
        </Form>
    )
}
