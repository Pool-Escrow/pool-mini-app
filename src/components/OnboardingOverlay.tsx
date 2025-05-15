'use client'

import { useState, useEffect, ReactNode } from 'react'

interface OnboardingOverlayProps {
    isOpen: boolean
    onClose: () => void
    screens: ReactNode[]
    onComplete?: () => void
}

export function OnboardingOverlay({ isOpen, onClose, screens, onComplete }: OnboardingOverlayProps) {
    const [currentScreen, setCurrentScreen] = useState(0)

    // Reset to first screen when opened
    useEffect(() => {
        if (isOpen) {
            setCurrentScreen(0)
        }
    }, [isOpen])

    if (!isOpen) return null

    const isFirstScreen = currentScreen === 0
    const isLastScreen = currentScreen === screens.length - 1

    const handleNext = () => {
        if (isLastScreen) {
            if (onComplete) onComplete()
            onClose()
        } else {
            setCurrentScreen(prev => prev + 1)
        }
    }

    const handlePrevious = () => {
        if (!isFirstScreen) {
            setCurrentScreen(prev => prev - 1)
        }
    }

    // const handleSkip = () => {
    //     if (onComplete) onComplete()
    //     onClose()
    // }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4'>
            <div className='flex w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-lg'>
                {/* Header with close button */}
                <div className='flex items-center justify-between border-b border-gray-200 p-4'>
                    <div className='text-sm font-medium text-gray-500'>
                        {currentScreen + 1} / {screens.length}
                    </div>
                    <button
                        onClick={onClose}
                        className='text-gray-400 hover:text-gray-600'
                        aria-label='Close onboarding'>
                        <svg
                            className='h-6 w-6'
                            fill='none'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            viewBox='0 0 24 24'
                            stroke='currentColor'>
                            <path d='M6 18L18 6M6 6l12 12'></path>
                        </svg>
                    </button>
                </div>

                {/* Content area */}
                <div className='flex-grow overflow-y-auto p-6'>{screens[currentScreen]}</div>

                {/* Navigation buttons */}
                <div className='flex items-center justify-between border-t border-gray-200 p-4'>
                    <div>
                        {!isFirstScreen && (
                            <button
                                onClick={handlePrevious}
                                className='flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900'>
                                <svg
                                    className='mr-1 h-4 w-4'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                    xmlns='http://www.w3.org/2000/svg'>
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth='2'
                                        d='M15 19l-7-7 7-7'
                                    />
                                </svg>
                                Back
                            </button>
                        )}
                    </div>

                    <div className='flex items-center gap-2'>
                        {/* <button
                            onClick={handleSkip}
                            className='px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700'>
                            Skip
                        </button> */}
                        <button
                            onClick={handleNext}
                            className='flex items-center rounded-lg bg-blue-500 px-6 py-2 font-medium text-gray-700 hover:bg-blue-600'>
                            {isLastScreen ? 'Get Started' : 'Next'}
                            {!isLastScreen && (
                                <svg
                                    className='ml-1 h-4 w-4'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                    xmlns='http://www.w3.org/2000/svg'>
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth='2'
                                        d='M9 5l7 7-7 7'
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
