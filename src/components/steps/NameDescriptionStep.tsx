import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea' // Assuming Shadcn UI textarea
import { NameDescriptionStepSchema, type NameDescriptionStepValues } from '@/lib/validators/poolCreationSchemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

interface NameDescriptionStepProps {
    initialData?: Partial<NameDescriptionStepValues>
    onNext: (data: NameDescriptionStepValues) => void
    onBack?: () => void
}

// Max length for description from schema or can be defined here if needed for UI counter
const MAX_DESC_LENGTH_SCHEMA =
    NameDescriptionStepSchema.shape.description._def.checks.find(check => check.kind === 'max')?.value ?? 500

export function NameDescriptionStep({ initialData, onNext, onBack }: NameDescriptionStepProps) {
    const form = useForm<NameDescriptionStepValues>({
        resolver: zodResolver(NameDescriptionStepSchema),
        defaultValues: {
            name: initialData?.name ?? '',
            description: initialData?.description ?? '',
        },
    })

    const onSubmit = (data: NameDescriptionStepValues) => {
        onNext(data)
    }

    // Watch description field for character count
    const descriptionValue = form.watch('description')

    return (
        <Form {...form}>
            <form
                onSubmit={e => {
                    void form.handleSubmit(onSubmit)(e)
                }}
                className='mx-auto flex w-full max-w-md flex-col items-center p-4 sm:p-8'>
                <h2 className='mb-1 text-center text-2xl font-semibold text-gray-900'>Name of Pool*</h2>
                <p className='mb-6 text-center text-sm text-gray-500'>Enter a name for your Pool</p>

                <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                        <FormItem className='mb-8 w-full'>
                            <FormLabel className='sr-only'>Pool Name</FormLabel>
                            <FormControl>
                                <Input placeholder='Pool Name' {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <h2 className='mb-1 text-center text-2xl font-semibold text-gray-900'>Description*</h2>
                <p className='mb-4 text-center text-sm text-gray-500'>Enter a description for your Pool</p>

                <FormField
                    control={form.control}
                    name='description'
                    render={({ field }) => (
                        <FormItem className='w-full'>
                            <FormLabel className='sr-only'>Pool Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder='Pool Description' rows={5} {...field} />
                            </FormControl>
                            <FormDescription className='mt-1 flex justify-end text-xs'>
                                {descriptionValue?.length ?? 0}/{MAX_DESC_LENGTH_SCHEMA}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className='mt-8 flex w-full flex-col gap-4 sm:flex-row'>
                    {onBack && (
                        <Button type='button' variant='outline' onClick={onBack} className='w-full'>
                            Back
                        </Button>
                    )}
                    <Button type='submit' className='w-full' disabled={form.formState.isSubmitting}>
                        Continue
                    </Button>
                </div>
            </form>
        </Form>
    )
}
