'use client'

import { useUserRole } from '@/components/providers'
import { useWallet } from '@/hooks/use-wallet'
import { clearAllPools } from '@/lib/poolStorage'
import { clearAllRegistrations } from '@/lib/registrationStorage'
import { Address, Avatar, EthBalance, Identity, Name } from '@coinbase/onchainkit/identity'
import { ConnectWallet, Wallet } from '@coinbase/onchainkit/wallet'
import { useState } from 'react'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from './ui/drawer'

export function Balance() {
    const { userRole, toggleUserRole } = useUserRole()
    const { isConnected, disconnect: disconnectWallet } = useWallet()
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)

    const localStorageKey = 'poolMiniUserManuallyDisconnected'

    // Function to clear all data and reset the app
    const clearAllData = () => {
        // Clear all pools and registrations
        clearAllPools()
        clearAllRegistrations()

        console.log('All pools and registrations have been cleared')
        // Reload the page to reflect changes
        window.location.reload()
    }

    const handleManualDisconnect = () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(localStorageKey, 'true')
        }
        disconnectWallet()
        setIsDrawerOpen(false)
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
                            <ConnectWallet />
                        ) : (
                            <DrawerTrigger onClick={() => setIsDrawerOpen(true)}>
                                <div className='h-10 w-10 rounded-full bg-gray-300' />
                            </DrawerTrigger>
                        )}

                        <DrawerContent className='flex gap-2 bg-white p-4'>
                            <DrawerHeader>
                                <DrawerTitle>Wallet</DrawerTitle>
                                <DrawerDescription />
                            </DrawerHeader>
                            {/* <WalletDropdown> */}
                            <Identity hasCopyAddressOnClick>
                                <Avatar />
                                <Name />
                                <Address />
                                <EthBalance />
                            </Identity>

                            {/* Developer toggle for admin/regular user role */}
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

                                {/* Clear All Pools & Registrations button (admin only) */}
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
                            {/* Replace WalletDropdownDisconnect with a custom button */}
                            <button
                                onClick={handleManualDisconnect}
                                className='flex w-full items-center justify-start rounded-md px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50'
                                type='button'>
                                Disconnect
                            </button>

                            {/* <Button variant='outline' asChild></Button> */}
                            {/* </WalletDropdown> */}
                        </DrawerContent>
                    </Drawer>
                </Wallet>
            </header>

            <div className='mb-8'>
                <p className='mb-1 text-sm opacity-80'>Total balance</p>
                <div className='flex items-baseline'>
                    <span className='text-6xl font-bold'>$0.0</span>
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
                <span>Drop Tokens: 1000</span>
            </div>
        </div>
    )
}
