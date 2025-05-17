import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { env } from '@/env'
import { sdk } from '@farcaster/frame-sdk'
import { ChevronLeftIcon, ChevronRightIcon, Loader2, PinIcon, XIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from './ui/button'

interface FarcasterSDKError {
    id?: 'RejectedByUser' | 'InvalidDomainManifestJson'
    message?: string
}

interface OnboardingOverlayProps {
    isOpen: boolean
    onClose: () => void
    screens: ReactNode[]
    onComplete?: () => void
}

const YourAppName = env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || 'this app'
const appUrl = env.NEXT_PUBLIC_URL || ''
const launchInWarpcastUrl = appUrl ? `https://warpcast.com/?launchFrameUrl=${encodeURIComponent(appUrl)}` : ''

export function OnboardingOverlay({ isOpen, onClose, screens, onComplete }: OnboardingOverlayProps) {
    const [currentScreen, setCurrentScreen] = useState(0)
    const [isAddingToWarpcast, setIsAddingToWarpcast] = useState(false)
    const [isProcessingGetStarted, setIsProcessingGetStarted] = useState(false)
    const [showWarpcastRedirectAlert, setShowWarpcastRedirectAlert] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setCurrentScreen(0)
            setIsAddingToWarpcast(false)
            setIsProcessingGetStarted(false)
            setShowWarpcastRedirectAlert(false)
        }
    }, [isOpen])

    if (!isOpen) return null

    const isFirstScreen = currentScreen === 0
    const isLastScreen = currentScreen === screens.length - 1
    const globalLoading = isAddingToWarpcast || isProcessingGetStarted

    const handleAddToWarpcast = async () => {
        setIsAddingToWarpcast(true)
        try {
            await sdk.actions.addFrame()
            toast.success(`${YourAppName} has been added to your Farcaster apps!`)
        } catch (err) {
            const error = err as FarcasterSDKError
            console.warn('Failed to add frame via sdk.actions.addFrame():', error)
            if (error.id === 'RejectedByUser') {
                toast.info('Request to add app was cancelled.')
            } else {
                if (launchInWarpcastUrl) {
                    setShowWarpcastRedirectAlert(true)
                } else {
                    toast.error('Could not add app automatically and App URL is not configured for Warpcast.')
                }
            }
        }
        setIsAddingToWarpcast(false)
    }

    const handleGetStarted = async () => {
        setIsProcessingGetStarted(true)
        await new Promise(resolve => setTimeout(resolve, 500))

        if (onComplete) {
            onComplete()
        }
        setIsProcessingGetStarted(false)
    }

    const handleNextScreen = () => {
        if (!isLastScreen) {
            setCurrentScreen(prev => prev + 1)
        }
    }

    const handlePreviousScreen = () => {
        if (!isFirstScreen) {
            setCurrentScreen(prev => prev - 1)
        }
    }

    const footerButtonText = isProcessingGetStarted ? 'Processing...' : 'Get Started'

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4'>
            <div className='flex w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-lg'>
                <div className='flex items-center justify-between border-b border-gray-200 p-4'>
                    <div className='text-sm font-medium text-gray-500'>
                        {screens.length > 0 ? `${currentScreen + 1} / ${screens.length}` : ''}
                    </div>
                    <button
                        onClick={onClose}
                        disabled={globalLoading}
                        className='text-gray-400 hover:text-gray-600 disabled:opacity-50'
                        aria-label='Close onboarding'>
                        <XIcon className='h-6 w-6' />
                    </button>
                </div>

                <div className='flex-grow overflow-y-auto p-6'>
                    {screens.length > 0 && screens[currentScreen]}
                    {isLastScreen && (
                        <div className='mt-6 flex flex-col items-center justify-center border-t pt-6'>
                            <p className='text-muted-foreground mb-3 text-center text-sm'>
                                Add {YourAppName} to your Farcaster client for easy access.
                            </p>
                            <Button
                                onClick={() => void handleAddToWarpcast()}
                                disabled={globalLoading}
                                className='w-full max-w-xs'>
                                {isAddingToWarpcast ? (
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                ) : (
                                    <PinIcon className='mr-2 h-4 w-4' />
                                )}
                                {isAddingToWarpcast ? 'Adding...' : `Add ${YourAppName} to Warpcast`}
                            </Button>
                        </div>
                    )}
                </div>

                <div className='flex items-center justify-between border-t border-gray-200 p-4'>
                    <div>
                        {!isFirstScreen && (
                            <Button
                                variant='ghost'
                                onClick={handlePreviousScreen}
                                disabled={globalLoading}
                                className='text-gray-700 hover:text-gray-900'>
                                <ChevronLeftIcon className='mr-1 h-4 w-4' />
                                Back
                            </Button>
                        )}
                    </div>

                    <div className='flex items-center gap-2'>
                        {isLastScreen ? (
                            <Button
                                onClick={() => void handleGetStarted()}
                                disabled={globalLoading}
                                className='bg-blue-500 text-white hover:bg-blue-600'>
                                {isProcessingGetStarted && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                                {footerButtonText}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleNextScreen}
                                disabled={globalLoading}
                                className='bg-blue-500 text-white hover:bg-blue-600'>
                                Next
                                <ChevronRightIcon className='ml-1 h-4 w-4' />
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <AlertDialog open={showWarpcastRedirectAlert} onOpenChange={setShowWarpcastRedirectAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Open in Warpcast?</AlertDialogTitle>
                        <AlertDialogDescription>
                            To add {YourAppName}, we need to open Warpcast in your browser. Would you like to continue?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isAddingToWarpcast}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isAddingToWarpcast}
                            onClick={() => {
                                if (launchInWarpcastUrl) {
                                    window.open(launchInWarpcastUrl, '_blank')
                                }
                                setShowWarpcastRedirectAlert(false)
                            }}>
                            Continue to Warpcast
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
