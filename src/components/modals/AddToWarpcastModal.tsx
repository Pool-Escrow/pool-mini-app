import { Button } from '@/components/ui/button'
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer'
import { env } from '@/env'
import { sdk } from '@farcaster/frame-sdk'
import { AlertTriangle, CheckCircle2, Copy, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface AddToWarpcastModalProps {
    isOpen: boolean
    onClose: () => void
}

// Define a more specific error type based on Farcaster SDK potential errors
interface FarcasterSDKError {
    id?: 'RejectedByUser' | 'InvalidDomainManifestJson' // Specific error IDs from SDK
    message?: string
}

const YourAppName = env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || 'this app'
const appUrl = env.NEXT_PUBLIC_URL || ''
const launchInWarpcastUrl = appUrl ? `https://warpcast.com/?launchFrameUrl=${encodeURIComponent(appUrl)}` : ''

export function AddToWarpcastModal({ isOpen, onClose }: AddToWarpcastModalProps) {
    const [isAddingFrame, setIsAddingFrame] = useState(false)

    const handleAddFrame = async () => {
        setIsAddingFrame(true)
        try {
            await sdk.actions.addFrame()
            toast.success(`${YourAppName} has been added to your Farcaster apps!`)
            // onClose() // Optionally close modal on success
        } catch (err) {
            const error = err as FarcasterSDKError // Type assertion
            console.error('Error adding frame:', error)
            let toastMessage = 'Could not add app. Please try again.'
            if (error.id === 'RejectedByUser') {
                toastMessage = 'Request to add app was cancelled.'
            } else if (error.id === 'InvalidDomainManifestJson') {
                toastMessage = 'This app has an invalid configuration for Farcaster.'
            } else if (error.message) {
                toastMessage = error.message // Use error.message if ID is not one of the known specific IDs
            }
            toast.error(toastMessage, { icon: <AlertTriangle className='h-4 w-4' /> })
        } finally {
            setIsAddingFrame(false)
        }
    }

    const handleLaunchInWarpcast = () => {
        if (launchInWarpcastUrl) {
            window.open(launchInWarpcastUrl, '_blank')
        }
    }

    const copyAppUrl = () => {
        if (appUrl) {
            navigator.clipboard
                .writeText(appUrl)
                .then(() => toast.success('App URL copied to clipboard!'))
                .catch(() => toast.error('Failed to copy URL.'))
        }
    }

    return (
        <Drawer open={isOpen} onOpenChange={onClose}>
            <DrawerContent className='mx-auto sm:max-w-md'>
                <DrawerHeader>
                    <DrawerTitle className='flex items-center'>
                        <CheckCircle2 className='mr-2 h-5 w-5 text-green-500' />
                        Add {YourAppName} to Farcaster
                    </DrawerTitle>
                    <DrawerDescription>
                        Add this app to your Farcaster client (like Warpcast) for easy access and notifications.
                    </DrawerDescription>
                </DrawerHeader>
                <div className='grid gap-4 p-4'>
                    <div className='space-y-2'>
                        <p className='text-sm font-medium'>If you are using Warpcast (or another Farcaster client):</p>
                        <Button
                            onClick={() => {
                                void handleAddFrame()
                            }}
                            className='w-full'
                            disabled={isAddingFrame}>
                            {isAddingFrame ? 'Adding...' : `Add ${YourAppName} to My Apps`}
                        </Button>
                    </div>

                    <div className='space-y-2'>
                        <p className='text-sm font-medium'>If you are in a regular web browser:</p>
                        <Button onClick={handleLaunchInWarpcast} variant='outline' className='w-full'>
                            <ExternalLink className='mr-2 h-4 w-4' /> Launch in Warpcast Browser
                        </Button>
                        <p className='text-muted-foreground text-xs'>
                            After launching in Warpcast, you can then add the app using the button above or its info
                            (ℹ️) icon.
                        </p>
                    </div>

                    <div className='space-y-2 border-t pt-2'>
                        <p className='text-sm font-medium'>Manual Method / Alternative:</p>
                        <ol className='text-muted-foreground list-decimal space-y-1 pl-5 text-xs'>
                            <li>Ensure {YourAppName} is open in your Farcaster client.</li>
                            <li>Find any Frame from {YourAppName}.</li>
                            <li>Tap the &apos;ℹ️&apos; (info) icon on the Frame.</li>
                            <li>Select &apos;Add App&apos; or a similar option.</li>
                        </ol>
                        {appUrl && (
                            <div className='text-muted-foreground mt-2 text-xs'>
                                <p className='mb-1'>App URL (for manual opening in Warpcast):</p>
                                <div className='flex items-center gap-2'>
                                    <input
                                        type='text'
                                        readOnly
                                        value={appUrl}
                                        className='bg-muted w-full flex-grow rounded-md border p-2 text-xs'
                                        onFocus={e => e.target.select()}
                                    />
                                    <Button variant='ghost' size='icon' onClick={copyAppUrl} title='Copy URL'>
                                        <Copy className='h-4 w-4' />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <DrawerFooter>
                    <Button variant='outline' onClick={onClose}>
                        Close
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}
