'use client'

import Image from 'next/image'
import { useState } from 'react'
interface NumericKeypadPaymentProps {
    participant: {
        id: string
        name: string
        address: string
        avatar?: string
    }
    onBack: () => void
    onSubmit: (amount: number) => void
}

export function NumericKeypadPayment({ participant, onBack, onSubmit }: NumericKeypadPaymentProps) {
    const [amount, setAmount] = useState<string>('0')

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        // Allow only numbers and decimals
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setAmount(value === '' ? '0' : value)
        }
    }

    const handleSubmit = () => {
        onSubmit(parseFloat(amount))
    }

    return (
        <div className='flex min-h-screen flex-col bg-[#F5F8FF]'>
            {/* Header */}
            <header className='bg-white p-4 shadow-sm'>
                <div className='flex items-center'>
                    <button onClick={onBack} className='text-gray-600'>
                        <svg
                            className='h-5 w-5'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                            xmlns='http://www.w3.org/2000/svg'>
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth='2'
                                d='M15 19l-7-7 7-7'></path>
                        </svg>
                    </button>
                    <h1 className='mr-5 flex-1 text-center text-xl font-semibold'>User Profile</h1>
                </div>
            </header>

            {/* Profile */}
            <div className='flex flex-col items-center pt-8 pb-4'>
                <div className='relative mb-4 h-24 w-24 overflow-hidden rounded-full bg-gray-300'>
                    {participant.avatar ? (
                        <Image
                            fill
                            src={participant.avatar}
                            alt={participant.name}
                            className='h-full w-full object-cover'
                        />
                    ) : (
                        <div className='flex h-full w-full items-center justify-center bg-blue-100 text-blue-500'>
                            <svg
                                className='h-12 w-12'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                                xmlns='http://www.w3.org/2000/svg'>
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth='2'
                                    d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'></path>
                            </svg>
                        </div>
                    )}
                </div>
                <h2 className='text-2xl font-bold text-gray-900'>{participant.name || 'Anonymous'}</h2>
                <p className='mt-1 text-blue-500'>{participant.address}</p>
            </div>

            {/* Amount Input */}
            <div className='px-6 py-8'>
                <div className='relative text-center'>
                    <input
                        type='text'
                        value={amount}
                        onChange={handleAmountChange}
                        className='w-full border-none bg-transparent text-center text-5xl font-bold focus:outline-none'
                        inputMode='decimal'
                    />
                    <div className='pointer-events-none absolute top-0 right-0 left-0 flex items-center justify-center'>
                        <span className='mr-2 text-5xl font-bold text-gray-500'>$</span>
                    </div>
                </div>
            </div>

            {/* Pay Button */}
            <div className='mb-8 flex flex-grow items-end justify-center px-6'>
                <button
                    onClick={handleSubmit}
                    className='w-full rounded-full bg-blue-500 py-4 text-xl font-bold text-white transition-colors hover:bg-blue-600'>
                    Pay
                </button>
            </div>

            {/* Home Indicator for iOS-style UI */}
            <div className='flex items-center justify-center py-8'>
                <div className='h-1 w-1/3 rounded-full bg-gray-300'></div>
            </div>
        </div>
    )
}
