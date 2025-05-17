'use client'

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
import { useChain } from '@/contexts/ChainContext'
import { useIsMiniApp } from '@/contexts/IsMiniAppContext'
import { useUserRole } from '@/contexts/UserRoleContext'
import { env } from '@/env'
import { useWallet } from '@/hooks/use-wallet'
import { clearAllPools } from '@/lib/poolStorage'
import { clearAllRegistrations } from '@/lib/registrationStorage'
import { tokenAbi } from '@/types/contracts'
import { Address, Avatar, EthBalance, Identity, Name } from '@coinbase/onchainkit/identity'
import { Wallet } from '@coinbase/onchainkit/wallet'
import { sdk } from '@farcaster/frame-sdk'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Loader2, PinIcon, User } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { formatUnits } from 'viem'
import { useAccount, useConnect, useReadContract } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { Button } from './ui/button'
import { ChainSelector } from './ui/ChainSelector'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from './ui/drawer'

// Define FarcasterSDKError interface
interface FarcasterSDKError {
    id?: 'RejectedByUser' | 'InvalidDomainManifestJson'
    message?: string
}

// TODO: Replace with your actual contract addresses
const TOKEN_ADDRESSES: Record<string, Record<number, `0x${string}`>> = {
    USDC: {
        [base.id]: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        [baseSepolia.id]: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    },
    DROP: {
        [base.id]: env.NEXT_PUBLIC_TOKEN_CONTRACT_BASE,
        [baseSepolia.id]: env.NEXT_PUBLIC_TOKEN_CONTRACT_BASE_SEPOLIA,
    },
}

const YourAppName = env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || 'this app'
const appUrl = env.NEXT_PUBLIC_URL || ''
const launchInWarpcastUrl = appUrl ? `https://warpcast.com/?launchFrameUrl=${encodeURIComponent(appUrl)}` : ''

export function Balance() {
    const { userRole, toggleUserRole } = useUserRole()
    const { isConnected, disconnect: disconnectWallet } = useWallet()
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [isAddingToWarpcastInBalance, setIsAddingToWarpcastInBalance] = useState(false)
    const [showWarpcastRedirectAlertInBalance, setShowWarpcastRedirectAlertInBalance] = useState(false)
    const { isLoadingChainSwitch, selectedChainId } = useChain()
    const { address: accountAddress, chain: connectedChain } = useAccount()
    const [avatarError, setAvatarError] = useState(false)

    const isMiniApp = useIsMiniApp()
    const { connect, connectors } = useConnect()

    useEffect(() => {
        if (isDrawerOpen) {
            setIsAddingToWarpcastInBalance(false)
            setShowWarpcastRedirectAlertInBalance(false)
        }
    }, [isDrawerOpen])

    const handleAvatarError = useCallback(() => {
        setAvatarError(true)
    }, [])

    useEffect(() => {
        if (accountAddress) {
            setAvatarError(false)
        }
    }, [accountAddress])

    const currentChainId = connectedChain?.id ?? selectedChainId
    const usdcContractAddress = TOKEN_ADDRESSES.USDC[currentChainId]
    const dropContractAddress = TOKEN_ADDRESSES.DROP[currentChainId]

    const { data: usdcBalanceData, isLoading: isLoadingUsdcBalance } = useReadContract({
        abi: tokenAbi,
        address: usdcContractAddress,
        functionName: 'balanceOf',
        args: accountAddress ? [accountAddress] : undefined,
        query: { enabled: !!accountAddress && !!usdcContractAddress },
    })

    const { data: usdcDecimalsData, isLoading: isLoadingUsdcDecimals } = useReadContract({
        abi: tokenAbi,
        address: usdcContractAddress,
        functionName: 'decimals',
        query: { enabled: !!usdcContractAddress },
    })

    const { data: dropBalanceData, isLoading: isLoadingDropBalance } = useReadContract({
        abi: tokenAbi,
        address: dropContractAddress,
        functionName: 'balanceOf',
        args: accountAddress ? [accountAddress] : undefined,
        query: { enabled: !!accountAddress && !!dropContractAddress },
    })

    const { data: dropDecimalsData, isLoading: isLoadingDropDecimals } = useReadContract({
        abi: tokenAbi,
        address: dropContractAddress,
        functionName: 'decimals',
        query: { enabled: !!dropContractAddress },
    })

    const formattedUsdcBalance =
        typeof usdcBalanceData === 'bigint' && typeof usdcDecimalsData === 'number'
            ? parseFloat(formatUnits(usdcBalanceData, usdcDecimalsData)).toFixed(2)
            : '0.00'

    const formattedDropBalance =
        typeof dropBalanceData === 'bigint' && typeof dropDecimalsData === 'number'
            ? parseFloat(formatUnits(dropBalanceData, dropDecimalsData)).toFixed(dropDecimalsData === 0 ? 0 : 2)
            : '0'

    const localStorageKey = 'poolMiniUserManuallyDisconnected'

    const clearAllData = () => {
        clearAllPools()
        clearAllRegistrations()
        console.log('All pools and registrations have been cleared')
        window.location.reload()
    }

    const handleManualDisconnect = () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(localStorageKey, 'true')
        }
        disconnectWallet()
        setIsDrawerOpen(false)
    }

    const handleAddToWarpcastInBalance = () => {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur()
        }
        requestAnimationFrame(() => {
            void (async () => {
                setIsAddingToWarpcastInBalance(true)
                try {
                    await sdk.actions.addFrame()
                    toast.success(`${YourAppName} has been added to your Farcaster apps!`)
                    setIsDrawerOpen(false)
                } catch (err) {
                    const error = err as FarcasterSDKError
                    console.warn('Failed to add frame via sdk.actions.addFrame():', error)

                    if (error.id === 'RejectedByUser') {
                        toast.info('Request to add app was cancelled.')
                    } else if (isMiniApp) {
                        if (error.id === 'InvalidDomainManifestJson') {
                            toast.error('Could not save app: App manifest is invalid. Please contact support.')
                        } else {
                            toast.error('Could not save app at this time. Please try again later.')
                        }
                    } else {
                        if (launchInWarpcastUrl) {
                            setShowWarpcastRedirectAlertInBalance(true)
                        } else {
                            toast.error('Could not add app automatically and App URL is not configured for Warpcast.')
                        }
                    }
                }
                setIsAddingToWarpcastInBalance(false)
            })()
        })
    }

    const renderConnectButton = () => {
        if (isMiniApp) {
            if (isConnected) {
                return <div className='text-xs text-gray-500'>{(accountAddress ?? '').slice(0, 6)}...</div>
            }
            const farcasterConnector = connectors.find(
                c => c.id.toLowerCase().includes('farcaster') || c.id.toLowerCase().includes('frame'),
            )
            if (farcasterConnector) {
                return (
                    <button
                        onClick={() => connect({ connector: farcasterConnector })}
                        className='rounded-md bg-blue-500 px-3 py-1.5 text-sm text-white shadow-sm hover:bg-blue-600'>
                        Connect Wallet
                    </button>
                )
            }
            return <div className='text-xs text-gray-500'>Connecting...</div>
        } else {
            return <ConnectButton />
        }
    }

    const renderAvatar = () => {
        if (!accountAddress) {
            return (
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 text-gray-600'>
                    <User className='h-6 w-6' />
                </div>
            )
        }
        if (avatarError) {
            return (
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 text-gray-600'>
                    <User className='h-6 w-6' />
                </div>
            )
        }
        return <Avatar address={accountAddress} className='h-10 w-10' onError={handleAvatarError} />
    }

    return (
        <div className='bg-[#4C6FFF] p-6 text-white'>
            <header className='mb-4 flex items-center justify-between'>
                <button className='rounded-full p-2 hover:bg-white/10'>
                    <svg className='h-6 w-6' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                        <path
                            d='M4 4V9H4.58152M19.9381 11C19.446 7.05369 16.0796 4 12 4C8.64262 4 5.76829 6.06817 4.58152 9M4.58152 9H9M20 20V15H19.4185M19.4185 15C18.2317 17.9318 15.3574 20 12 20C7.92038 20 4.55399 16.9463 4.06189 13M19.4185 15H15'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                        />
                    </svg>
                </button>
                <Wallet>
                    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                        {!isConnected ? (
                            renderConnectButton()
                        ) : (
                            <DrawerTrigger onClick={() => setIsDrawerOpen(true)} className='rounded-full'>
                                {renderAvatar()}
                            </DrawerTrigger>
                        )}

                        <DrawerContent className='flex flex-col gap-2 bg-white p-4 text-black'>
                            <DrawerHeader>
                                <DrawerTitle>Wallet</DrawerTitle>
                                <DrawerDescription />
                            </DrawerHeader>
                            {isConnected && accountAddress && (
                                <Identity address={accountAddress} hasCopyAddressOnClick>
                                    {renderAvatar()}
                                    <Name />
                                    <Address />
                                    <EthBalance />
                                </Identity>
                            )}

                            <div className='border-t border-gray-200 px-4 py-2'>
                                <p className='mb-1 text-xs font-medium text-gray-500'>Network</p>
                                <ChainSelector />
                                {isLoadingChainSwitch && (
                                    <p className='mt-1 text-xs text-gray-500'>Switching network...</p>
                                )}
                            </div>

                            <div className='border-t border-gray-200 px-4 py-2'>
                                <Button
                                    variant='outline'
                                    className='w-full justify-start text-sm text-gray-900 hover:bg-gray-100'
                                    onClick={() => void handleAddToWarpcastInBalance()}
                                    disabled={isAddingToWarpcastInBalance}>
                                    {isAddingToWarpcastInBalance ? (
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    ) : (
                                        <PinIcon className='mr-2 h-4 w-4' />
                                    )}
                                    {isAddingToWarpcastInBalance ? 'Adding...' : 'Add to Warpcast'}
                                </Button>
                            </div>

                            <div className='border-t border-gray-200 px-4 py-2'>
                                <button
                                    onClick={toggleUserRole}
                                    className='flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-gray-900 transition-colors hover:bg-gray-100'>
                                    <span className='flex items-center'>
                                        <span className='mr-2'>{userRole === 'admin' ? '👑' : '👤'}</span>
                                        <span>Role: {userRole}</span>
                                    </span>
                                    <span className='rounded-full bg-gray-100 px-2 py-1 text-xs'>Switch</span>
                                </button>

                                {userRole === 'admin' && (
                                    <button
                                        onClick={clearAllData}
                                        className='mt-2 flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50'>
                                        <span className='flex items-center'>
                                            <span className='mr-2'>🗑️</span>
                                            <span>Clear All Pools & Registrations</span>
                                        </span>
                                    </button>
                                )}
                            </div>
                            {isConnected && (
                                <button
                                    onClick={handleManualDisconnect}
                                    className='flex w-full items-center justify-start rounded-md px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50'
                                    type='button'>
                                    Disconnect
                                </button>
                            )}
                        </DrawerContent>
                    </Drawer>
                </Wallet>
            </header>

            <div className='mb-8'>
                <p className='mb-1 text-sm opacity-80'>Total balance</p>
                <div className='flex items-baseline'>
                    <span className='text-6xl font-bold'>
                        {isLoadingUsdcBalance || isLoadingUsdcDecimals ? 'Loading...' : `$${formattedUsdcBalance}`}
                    </span>
                    <span className='ml-1 text-xl'>USDC</span>
                </div>
            </div>

            <div className='mb-4 flex items-center'>
                <svg className='mr-2 h-5 w-5' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path
                        d='M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z'
                        stroke='white'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                    />
                    <path
                        d='M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14'
                        stroke='white'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                    />
                    <path d='M9 9H9.01' stroke='white' strokeWidth='3' strokeLinecap='round' strokeLinejoin='round' />
                    <path d='M15 9H15.01' stroke='white' strokeWidth='3' strokeLinecap='round' strokeLinejoin='round' />
                </svg>
                <span>
                    Drop Tokens: {isLoadingDropBalance || isLoadingDropDecimals ? 'Loading...' : formattedDropBalance}
                </span>
            </div>

            <AlertDialog open={showWarpcastRedirectAlertInBalance} onOpenChange={setShowWarpcastRedirectAlertInBalance}>
                <AlertDialogContent className='text-black'>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Open in Warpcast?</AlertDialogTitle>
                        <AlertDialogDescription>
                            To add {YourAppName}, we need to open Warpcast in your browser. Would you like to continue?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => setShowWarpcastRedirectAlertInBalance(false)}
                            disabled={isAddingToWarpcastInBalance}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isAddingToWarpcastInBalance}
                            onClick={() => {
                                if (launchInWarpcastUrl) {
                                    window.open(launchInWarpcastUrl, '_blank')
                                }
                                setShowWarpcastRedirectAlertInBalance(false)
                                setIsDrawerOpen(false)
                            }}>
                            Continue to Warpcast
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
