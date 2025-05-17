'use client'

import { Balance } from '@/components/Balance'
import { Button } from '@/components/ui/button'
import { useWallet } from '@/hooks/use-wallet'
import { useEffect, useState } from 'react'

export default function TestTogglesPage() {
    const { isWarpcast } = useWallet()
    const [isMiniAppValue, setIsMiniAppValue] = useState<boolean | null>(null)

    // Check isInMiniApp value directly
    useEffect(() => {
        async function checkMiniApp() {
            try {
                const { sdk } = await import('@farcaster/frame-sdk')
                const result = await sdk.isInMiniApp()
                setIsMiniAppValue(result)
            } catch (error) {
                console.error('Error checking MiniApp status:', error)
                setIsMiniAppValue(false)
            }
        }

        void checkMiniApp()
    }, [])

    return (
        <div className='p-8'>
            <h1 className='mb-6 text-2xl font-bold'>Wallet Providers Test Page</h1>

            <div className='mb-6 space-y-2 rounded-lg bg-gray-100 p-4'>
                <h2 className='text-lg font-medium'>Detection Results:</h2>
                <ul className='space-y-2'>
                    <li>
                        <span className='font-semibold'>isWarpcast (from hook):</span> <code>{String(isWarpcast)}</code>
                    </li>
                    <li>
                        <span className='font-semibold'>isInMiniApp (direct check):</span>{' '}
                        <code>{isMiniAppValue === null ? 'Checking...' : String(isMiniAppValue)}</code>
                    </li>
                    <li>
                        <span className='font-semibold'>User Agent:</span>{' '}
                        <code className='text-xs break-all'>
                            {typeof window !== 'undefined' ? window.navigator.userAgent : 'Server-side rendering'}
                        </code>
                    </li>
                </ul>
            </div>

            <div className='mb-6 space-y-2 rounded-lg bg-gray-100 p-4'>
                <h2 className='text-lg font-medium'>Active Provider:</h2>
                <p>
                    {isWarpcast ? (
                        <span className='rounded bg-green-100 px-2 py-1 text-green-800'>MiniKit (Farcaster)</span>
                    ) : (
                        <span className='rounded bg-blue-100 px-2 py-1 text-blue-800'>RainbowKit (Web)</span>
                    )}
                </p>
            </div>

            <div className='mb-8 border-b border-gray-200 pb-8'>
                <h2 className='mb-4 text-lg font-medium'>Wallet Connection:</h2>
                <Balance />
            </div>

            <div className='rounded-lg bg-gray-100 p-4'>
                <h2 className='mb-4 text-lg font-medium'>Other Actions:</h2>
                <div className='flex flex-wrap gap-2'>
                    <Button
                        variant='secondary'
                        onClick={() => {
                            window.location.reload()
                        }}>
                        Reload Page
                    </Button>
                    <Button
                        variant='outline'
                        onClick={() => {
                            if (typeof window !== 'undefined') {
                                localStorage.clear()
                                window.location.reload()
                            }
                        }}>
                        Clear localStorage & Reload
                    </Button>
                </div>
            </div>
        </div>
    )
}
