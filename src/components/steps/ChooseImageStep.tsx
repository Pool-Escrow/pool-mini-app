'use client'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { ChooseImageStepSchema, type ChooseImageStepValues } from '@/lib/validators/poolCreationSchemas'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { useForm } from 'react-hook-form'

interface ChooseImageStepProps {
    onNext: (data: ChooseImageStepValues) => void
}

const imageTemplates = Array.from({ length: 8 }, (_, i) => ({
    name: `template-${i + 1}`,
    path: `/images/image${i + 1}.png`,
}))

export function ChooseImageStep({ onNext }: ChooseImageStepProps) {
    const form = useForm<ChooseImageStepValues>({
        resolver: zodResolver(ChooseImageStepSchema),
        defaultValues: {
            selectedImage: '',
        },
    })

    const onSubmit = (data: ChooseImageStepValues) => {
        onNext(data)
    }

    return (
        <Form {...form}>
            <form
                onSubmit={e => {
                    void form.handleSubmit(onSubmit)(e)
                }}
                className='flex flex-col items-center p-4 sm:p-8'>
                <h2 className='mb-2 text-center text-2xl font-semibold'>Choose Image*</h2>
                <p className='mb-8 text-center text-sm text-gray-500'>Choose from one of our 8 templates</p>

                <FormField
                    control={form.control}
                    name='selectedImage'
                    render={({ field }) => (
                        <FormItem className='w-full max-w-md'>
                            <FormControl>
                                <div className='mb-4 grid grid-cols-4 gap-4'>
                                    {imageTemplates.map(template => (
                                        <button
                                            key={template.name}
                                            type='button'
                                            onClick={() => {
                                                field.onChange(template.path)
                                                void form.trigger('selectedImage')
                                            }}
                                            className={`aspect-video overflow-hidden rounded-lg bg-gray-200 transition-colors hover:bg-gray-300 ${field.value === template.path ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                                            aria-label={`Select image ${template.name}`}>
                                            <div className='relative h-full w-full'>
                                                <Image
                                                    src={template.path}
                                                    alt={`Template ${template.name.split('-')[1]}`}
                                                    className='h-full w-full object-cover'
                                                    fill
                                                    sizes='100px'
                                                />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </FormControl>
                            <FormMessage className='mt-2 text-center' />
                        </FormItem>
                    )}
                />

                <Button type='submit' className='mt-4 w-full max-w-xs' disabled={form.formState.isSubmitting}>
                    Continue
                </Button>
            </form>
        </Form>
    )
}
