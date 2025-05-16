'use client'

import type { ChangeEvent } from 'react'
import { useState } from 'react'

interface NameDescriptionStepProps {
    initialData?: {
        name?: string
        description?: string
    }
    onNext: (data: { name: string; description: string }) => void
    onBack?: () => void // Optional: if you want a back button on this step
}

const MAX_DESC_LENGTH = 200

export function NameDescriptionStep({ initialData, onNext, onBack }: NameDescriptionStepProps) {
    const [name, setName] = useState(initialData?.name ?? '')
    const [description, setDescription] = useState(initialData?.description ?? '')

    const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        if (e.target.value.length <= MAX_DESC_LENGTH) {
            setDescription(e.target.value)
        }
    }

    const handleSubmit = () => {
        // Basic validation, can be expanded
        if (name.trim() && description.trim()) {
            onNext({ name, description })
        }
    }

    return (
        <div className='mx-auto flex w-full max-w-md flex-col items-center p-4 sm:p-8'>
            <h2 className='mb-1 text-center text-2xl font-semibold text-gray-900'>Name of Pool*</h2>
            <p className='mb-6 text-center text-sm text-gray-500'>Enter a name for your Pool</p>
            <input
                type='text'
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder='Pool Name'
                className='mb-8 w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500'
            />

            <h2 className='mb-1 text-center text-2xl font-semibold text-gray-900'>Description*</h2>
            <p className='mb-4 text-center text-sm text-gray-500'>Enter a description for your Pool</p>
            <div className='relative w-full'>
                <textarea
                    value={description}
                    onChange={handleDescriptionChange}
                    placeholder='Pool Description'
                    rows={5}
                    className='w-full resize-none rounded-lg border border-gray-300 p-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500'
                />
                <p className='absolute right-2 bottom-2 text-xs text-gray-400'>
                    {description.length}/{MAX_DESC_LENGTH}
                </p>
            </div>

            <div className='mt-8 flex w-full flex-col gap-4 sm:flex-row'>
                {onBack && (
                    <button
                        onClick={onBack}
                        className='w-full rounded-lg bg-gray-200 px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-300'>
                        Back
                    </button>
                )}
                <button
                    onClick={handleSubmit}
                    disabled={!name.trim() || !description.trim()}
                    className='w-full rounded-lg bg-blue-500 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300'>
                    Continue
                </button>
            </div>
        </div>
    )
}
