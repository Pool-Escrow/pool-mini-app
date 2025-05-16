import { ChevronLeftIcon, ChevronRightIcon, PinIcon, XIcon } from 'lucide-react' // For icons
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { AddToWarpcastModal } from './modals/AddToWarpcastModal' // Import the modal
import { Button } from './ui/button' // Assuming Button component is used or for consistency

interface OnboardingOverlayProps {
    isOpen: boolean
    onClose: () => void
    screens: ReactNode[]
    onComplete?: () => void
}

export function OnboardingOverlay({ isOpen, onClose, screens, onComplete }: OnboardingOverlayProps) {
    const [currentScreen, setCurrentScreen] = useState(0)
    const [isAddToWarpcastModalOpen, setIsAddToWarpcastModalOpen] = useState(false)

    // Reset to first screen when opened
    useEffect(() => {
        if (isOpen) {
            setCurrentScreen(0)
            setIsAddToWarpcastModalOpen(false) // Ensure modal is closed on reopen
        }
    }, [isOpen])

    if (!isOpen) return null

    const isFirstScreen = currentScreen === 0
    const isLastScreen = currentScreen === screens.length - 1

    const handleNextOrOpenModal = () => {
        if (isLastScreen) {
            setIsAddToWarpcastModalOpen(true) // Open the "Add to Warpcast" modal
        } else {
            setCurrentScreen(prev => prev + 1)
        }
    }

    const handlePrevious = () => {
        if (!isFirstScreen) {
            setCurrentScreen(prev => prev - 1)
        }
    }

    const handleModalCloseAndComplete = () => {
        setIsAddToWarpcastModalOpen(false)
        if (onComplete) onComplete()
        onClose() // Close the main onboarding overlay
    }

    const finalButtonText = isLastScreen ? 'Finish & Add to Warpcast' : 'Next'

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4'>
            <div className='flex w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-lg'>
                {/* Header with close button */}
                <div className='flex items-center justify-between border-b border-gray-200 p-4'>
                    <div className='text-sm font-medium text-gray-500'>
                        {currentScreen + 1} / {screens.length}
                    </div>
                    <button
                        onClick={onClose} // Main close button still works independently
                        className='text-gray-400 hover:text-gray-600'
                        aria-label='Close onboarding'>
                        <XIcon className='h-6 w-6' />
                    </button>
                </div>

                {/* Content area */}
                <div className='flex-grow overflow-y-auto p-6'>{screens[currentScreen]}</div>

                {/* Navigation buttons */}
                <div className='flex items-center justify-between border-t border-gray-200 p-4'>
                    <div>
                        {!isFirstScreen && (
                            <Button
                                variant='ghost'
                                onClick={handlePrevious}
                                className='text-gray-700 hover:text-gray-900'>
                                <ChevronLeftIcon className='mr-1 h-4 w-4' />
                                Back
                            </Button>
                        )}
                    </div>

                    <div className='flex items-center gap-2'>
                        <Button onClick={handleNextOrOpenModal} className='bg-blue-500 text-white hover:bg-blue-600'>
                            {isLastScreen && <PinIcon className='mr-2 h-4 w-4' />}
                            {finalButtonText}
                            {!isLastScreen && <ChevronRightIcon className='ml-1 h-4 w-4' />}
                        </Button>
                    </div>
                </div>
            </div>

            <AddToWarpcastModal isOpen={isAddToWarpcastModalOpen} onClose={handleModalCloseAndComplete} />
        </div>
    )
}
