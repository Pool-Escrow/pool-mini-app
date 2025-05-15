'use client'

import Image from 'next/image'
import { useState } from 'react'

interface ChooseImageStepProps {
    onNext: (data: { selectedImage: string }) => void
}

const imageTemplates = Array.from({ length: 8 }, (_, i) => `template-${i + 1}`)

export function ChooseImageStep({ onNext }: ChooseImageStepProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null)

    const handleImageSelect = (imageName: string) => {
        setSelectedImage(imageName)
    }

    const handleSubmit = () => {
        if (selectedImage) {
            onNext({ selectedImage })
        }
    }

    return (
        <div className='flex flex-col items-center p-4 sm:p-8'>
            <h2 className='mb-2 text-center text-2xl font-semibold'>Choose Image*</h2>
            <p className='mb-8 text-center text-sm text-gray-500'>Choose from one of our 8 templates</p>

            <div className='mb-8 grid w-full max-w-md grid-cols-4 gap-4'>
                {imageTemplates.map((template, index) => {
                    const imageNumber = index + 1
                    return (
                        <button
                            key={template}
                            onClick={() => handleImageSelect(template)}
                            className={`aspect-video overflow-hidden rounded-lg bg-gray-200 transition-colors hover:bg-gray-300 ${selectedImage === template ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                            aria-label={`Select image ${template}`}>
                            <div className='relative h-full w-full'>
                                <Image
                                    src={`/images/image${imageNumber}.png`}
                                    alt={`Template ${imageNumber}`}
                                    className='h-full w-full object-cover'
                                    fill
                                />
                            </div>
                        </button>
                    )
                })}
            </div>

            <button
                onClick={handleSubmit}
                disabled={!selectedImage}
                className='w-full max-w-xs rounded-lg bg-blue-500 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300'>
                Continue
            </button>
        </div>
    )
}
