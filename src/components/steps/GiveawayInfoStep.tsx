'use client'

import type { ChangeEvent } from 'react'
import { useState } from 'react'

interface GiveawayInfoStepProps {
    initialData?: {
        amount?: number
        participantLimit?: number
        description?: string
    }
    onNext: (data: { amount: number; participantLimit: number; description: string }) => void
}

const MAX_DESC_LENGTH = 200

export function GiveawayInfoStep({ initialData, onNext }: GiveawayInfoStepProps) {
    const [amount, setAmount] = useState<number | ''>(initialData?.amount ?? '')
    const [participantLimit, setParticipantLimit] = useState<number | ''>(initialData?.participantLimit ?? '')
    const [description, setDescription] = useState(initialData?.description ?? '')

    const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
            setAmount(value === '' ? '' : parseFloat(value))
        }
    }

    const handleParticipantLimitChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        if (value === '' || /^\d+$/.test(value)) {
            setParticipantLimit(value === '' ? '' : parseInt(value, 10))
        }
    }

    const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        if (e.target.value.length <= MAX_DESC_LENGTH) {
            setDescription(e.target.value)
        }
    }

    const isFormValid = () => {
        return (
            amount !== '' && amount > 0 && participantLimit !== '' && participantLimit > 0 && description.trim() !== ''
        )
    }

    const handleSubmit = () => {
        if (isFormValid()) {
            onNext({
                amount: amount as number,
                participantLimit: participantLimit as number,
                description,
            })
        }
    }

    return (
        <div className='mx-auto flex w-full max-w-md flex-col items-center p-4 sm:p-8'>
            <h2 className='mb-1 text-center text-2xl font-semibold text-gray-900'>Giveaway Amount*</h2>
            <p className='mb-6 text-center text-sm text-gray-500'>Enter the amount for your giveaway</p>
            <div className='relative mb-8 w-full'>
                <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                    <span className='text-gray-500'>$</span>
                </div>
                <input
                    type='text'
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder='0.00'
                    className='w-full rounded-lg border border-gray-300 p-3 pl-8 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500'
                />
            </div>

            <h2 className='mb-1 text-center text-2xl font-semibold text-gray-900'>Participant Limit*</h2>
            <p className='mb-6 text-center text-sm text-gray-500'>Maximum number of participants allowed</p>
            <input
                type='text'
                value={participantLimit}
                onChange={handleParticipantLimitChange}
                placeholder='Number of participants'
                className='mb-8 w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500'
            />

            <h2 className='mb-1 text-center text-2xl font-semibold text-gray-900'>Description*</h2>
            <p className='mb-4 text-center text-sm text-gray-500'>Enter a description for your giveaway</p>
            <div className='relative w-full'>
                <textarea
                    value={description}
                    onChange={handleDescriptionChange}
                    placeholder='Giveaway Description'
                    rows={5}
                    className='w-full resize-none rounded-lg border border-gray-300 p-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500'
                />
                <p className='absolute right-2 bottom-2 text-xs text-gray-400'>
                    {description.length}/{MAX_DESC_LENGTH}
                </p>
            </div>

            <div className='mt-8 flex w-full flex-col gap-4 sm:flex-row'>
                <button
                    onClick={handleSubmit}
                    disabled={!isFormValid()}
                    className='w-full rounded-lg bg-blue-500 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300'>
                    Continue
                </button>
            </div>
        </div>
    )
}
