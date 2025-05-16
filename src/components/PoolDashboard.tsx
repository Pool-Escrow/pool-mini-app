'use client'

import { Button } from '@/components/DemoComponents'
import { ParticipantsList } from '@/components/ParticipantsList'
import { useUserRole } from '@/components/providers'
import { RegistrationModal } from '@/components/RegistrationModal'
import {
    cancelUserRegistration,
    initializeRegistrationsStorage,
    isUserRegisteredForPool,
    registerUserForPool,
} from '@/lib/registrationStorage'
import type { Pool } from '@/types/pool'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useAccount } from 'wagmi'

interface PoolDashboardProps {
    pool: Pool
}

export function PoolDashboard({ pool }: PoolDashboardProps) {
    const [activeTab, setActiveTab] = useState<'description' | 'participants'>('participants')
    const { isAdmin: isGlobalAdmin } = useUserRole()
    // Track if user is an admin (creator of the pool)
    const [isPoolAdmin, setIsPoolAdmin] = useState(false)
    // Tracks if the current user is registered for the pool
    const [isRegistered, setIsRegistered] = useState(false)
    // Track if registration modal is open
    const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false)
    // Get user wallet address from wagmi
    const { address } = useAccount()
    const [showAdminMenu, setShowAdminMenu] = useState(false)
    const adminMenuRef = useRef<HTMLDivElement>(null)
    const [refreshKey, setRefreshKey] = useState(0)

    // Calculate participant count
    const participantCount: number = pool.registrations ?? pool.participants?.length ?? 0

    // Initialize registrations storage and check user status
    useEffect(() => {
        // Initialize registration storage
        initializeRegistrationsStorage()

        // Set admin status based on global admin role
        setIsPoolAdmin(isGlobalAdmin)

        // If user has wallet connected, check if they're registered
        if (address) {
            const registered = isUserRegisteredForPool(pool.id, address)
            setIsRegistered(registered)
        } else {
            setIsRegistered(false)
        }
    }, [address, isGlobalAdmin, pool.id])

    const handleOpenRegistrationModal = () => {
        // If no wallet is connected, we can't register
        if (!address) {
            alert('Please connect your wallet to register for this event')
            return
        }
        setIsRegistrationModalOpen(true)
    }

    const handleCloseRegistrationModal = () => {
        setIsRegistrationModalOpen(false)
    }

    const handleRegister = () => {
        if (!address) {
            alert('Please connect your wallet to register for this event')
            return
        }

        // Register the user for the pool
        const success = registerUserForPool(pool.id, address)
        if (success) {
            setIsRegistered(true)

            // Force a component refresh by using a key update or state change
            // This will cause the ParticipantsList to re-render with the new participant
            setRefreshKey(prev => prev + 1)

            console.log('User registered for pool:', pool.id)
        } else {
            console.log('User already registered for pool:', pool.id)
        }
    }

    const handleCancelRegistration = () => {
        if (!address) return

        // Cancel the user's registration
        const success = cancelUserRegistration(pool.id, address)
        if (success) {
            setIsRegistered(false)

            // Force a component refresh by using a key update or state change
            // This will cause the ParticipantsList to re-render without the cancelled participant
            setRefreshKey(prev => prev + 1)

            console.log('User cancelled registration for pool:', pool.id)
        } else {
            console.log('Failed to cancel registration - user may not be registered')
        }
    }

    // Format pool time for display
    const formatPoolTime = () => {
        if (!pool.registrationStart || !pool.registrationEnd) {
            return 'Registration time not set'
        }

        try {
            const now = new Date()
            const regStartDate = new Date(pool.registrationStart)
            const regEndDate = new Date(pool.registrationEnd)

            // Check if dates are valid
            if (isNaN(regStartDate.getTime()) || isNaN(regEndDate.getTime())) {
                return 'Registration dates not properly set'
            }

            // Format the date for display
            const formatDate = (date: Date) => {
                return (
                    date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                    }) +
                    ' at ' +
                    date.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                    })
                )
            }

            // If current time is before start date, show registration starts
            if (now < regStartDate) {
                return `Registration starts: ${formatDate(regStartDate)}`
            }
            // If current time is between start and end, show registration ends
            else if (now >= regStartDate && now < regEndDate) {
                return `Registration ends: ${formatDate(regEndDate)}`
            }
            // If registration period has passed
            else {
                return `Registration period has ended`
            }
        } catch (error) {
            console.error('Error formatting pool times:', error)
            return 'Registration time available soon'
        }
    }

    const getRegistrationButtonText = () => {
        if (pool.depositAmount > 0) {
            return `Register for $${pool.depositAmount} USDC`
        }
        return 'Register'
    }

    // Calculate progress percentage for the progress bar
    const getProgressPercentage = () => {
        // if (pool.softCap === 0) return 0
        // Calculate total amount raised based on registrations and buy-in
        const totalRaised = pool.registrations * (pool.depositAmount ?? 0)
        const percentage = (totalRaised / (pool.maxEntries * pool.depositAmount)) * 100
        return Math.min(percentage, 100) // Cap at 100%
    }

    // Format currency for display
    const formatCurrency = (amount: number) => {
        return `$${amount.toLocaleString()}`
    }

    // Close admin menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (adminMenuRef.current && !adminMenuRef.current.contains(event.target as Node)) {
                setShowAdminMenu(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    // Calculate softCap for progress bar logic
    const softCap = pool.maxEntries * pool.depositAmount

    return (
        <div className='flex min-h-screen flex-col bg-white'>
            {/* Header with back button */}
            <header className='bg-white p-4'>
                <Link href='/' className='flex items-center text-blue-500'>
                    <svg
                        className='mr-2 h-5 w-5'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                        xmlns='http://www.w3.org/2000/svg'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 19l-7-7 7-7' />
                    </svg>
                    Back
                </Link>
            </header>

            {/* Event Cover Image */}
            <div className='relative h-44 w-full bg-gray-400'>
                {pool.selectedImage ? (
                    <div className='relative h-full w-full'>
                        <Image
                            fill
                            src={pool.selectedImage}
                            alt={pool.name}
                            className='h-full w-full object-cover'
                            onError={e => {
                                // On error, extract template number for fallback
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'

                                // Get parent element
                                const parent = target.parentElement!
                                parent.classList.add('flex', 'items-center', 'justify-center')

                                // Determine template number and color
                                let templateNum = '?'
                                let bgClass = 'bg-gradient-to-r from-blue-100 to-blue-300'

                                if (pool.selectedImage.includes('template-')) {
                                    const match = /template-(\d+)/.exec(pool.selectedImage)
                                    if (match) templateNum = match[1]
                                } else if (pool.selectedImage.includes('/images/image')) {
                                    const match = /\/images\/image(\d+)\.png/.exec(pool.selectedImage)
                                    if (match) {
                                        templateNum = match[1]

                                        // Set background color based on template number
                                        const colors = [
                                            'bg-gradient-to-r from-blue-100 to-blue-300',
                                            'bg-gradient-to-r from-green-100 to-green-300',
                                            'bg-gradient-to-r from-purple-100 to-purple-300',
                                            'bg-gradient-to-r from-red-100 to-red-300',
                                            'bg-gradient-to-r from-yellow-100 to-yellow-300',
                                            'bg-gradient-to-r from-pink-100 to-pink-300',
                                            'bg-gradient-to-r from-indigo-100 to-indigo-300',
                                            'bg-gradient-to-r from-gray-100 to-gray-300',
                                        ]

                                        const index = parseInt(templateNum, 10) - 1
                                        if (index >= 0 && index < colors.length) {
                                            bgClass = colors[index]
                                        }
                                    }
                                }

                                parent.className = `w-full h-full flex items-center justify-center ${bgClass}`

                                // Add title with template number and pool name
                                const content = document.createElement('div')
                                content.className = 'text-center'

                                const templateIndicator = document.createElement('div')
                                templateIndicator.className = 'text-3xl font-bold mb-2 text-white/80'
                                templateIndicator.textContent = `#${templateNum}`
                                content.appendChild(templateIndicator)

                                const poolName = document.createElement('div')
                                poolName.className = 'text-xl font-medium text-white/90 px-4'
                                poolName.textContent = pool.name
                                content.appendChild(poolName)

                                parent.appendChild(content)
                            }}
                        />
                    </div>
                ) : (
                    <div className='flex h-full w-full items-center justify-center bg-gray-400'>
                        <span className='text-gray-600'>No Image</span>
                    </div>
                )}
            </div>

            {/* Pool Title and Admin Menu */}
            <div className='flex items-center justify-between bg-white p-4'>
                <h1 className='truncate text-2xl font-bold text-gray-900'>{pool.name}</h1>
                {isPoolAdmin && (
                    <div className='relative' ref={adminMenuRef}>
                        <button
                            onClick={() => setShowAdminMenu(!showAdminMenu)}
                            className='rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700'>
                            <svg
                                className='h-6 w-6'
                                fill='currentColor'
                                viewBox='0 0 24 24'
                                xmlns='http://www.w3.org/2000/svg'>
                                <circle cx='5' cy='12' r='2' />
                                <circle cx='12' cy='12' r='2' />
                                <circle cx='19' cy='12' r='2' />
                            </svg>
                        </button>

                        {/* Dropdown menu */}
                        {showAdminMenu && (
                            <div className='absolute right-0 z-10 mt-2 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg'>
                                <button
                                    className='w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100'
                                    onClick={() => {
                                        alert('Prize distribution feature will be enabled when there are participants')
                                        setShowAdminMenu(false)
                                    }}>
                                    Distribute Prize Equally
                                </button>
                                <button
                                    className='w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100'
                                    onClick={() => {
                                        if (window.confirm('Are you sure you want to cancel this event?')) {
                                            alert('Event cancelled')
                                            setShowAdminMenu(false)
                                        }
                                    }}>
                                    Cancel Event
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Pool Details: Soft Cap, Buy-in, Timing, Status */}
            <div className='grid grid-cols-2 gap-x-4 gap-y-2 bg-white px-4 pb-4 text-sm text-gray-700 sm:grid-cols-4'>
                <div>
                    <span className='font-medium text-gray-500'>Soft Cap:</span>{' '}
                    {pool.maxEntries > 0 ? formatCurrency(pool.maxEntries * pool.depositAmount) : 'N/A'}
                </div>
                <div>
                    <span className='font-medium text-gray-500'>Buy-in:</span>{' '}
                    {pool.depositAmount > 0 ? formatCurrency(pool.depositAmount) : 'Free'}
                </div>
                <div className='col-span-2 sm:col-span-1'>
                    <span className='font-medium text-gray-500'>Status:</span>{' '}
                    {pool.status ? pool.status.charAt(0).toUpperCase() + pool.status.slice(1) : 'Unknown'}
                </div>
                <div className='col-span-2 sm:col-span-1'>
                    <span className='font-medium text-gray-500'>Timing:</span> {formatPoolTime()}
                </div>
            </div>

            {/* Progress Bar Section */}
            {softCap > 0 && (
                <div className='mt-2 h-2 w-full rounded-full bg-gray-200'>
                    <div className='h-full rounded-full bg-blue-500' style={{ width: `${getProgressPercentage()}%` }} />
                </div>
            )}

            {/* Tabs: Description and Participants */}
            <div className='border-b border-gray-200 bg-white px-4'>
                <nav className='-mb-px flex space-x-6' aria-label='Tabs'>
                    <button
                        onClick={() => setActiveTab('participants')}
                        className={`border-b-2 px-1 py-3 text-sm font-medium whitespace-nowrap ${
                            activeTab === 'participants'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        }`}>
                        Participants ({participantCount})
                    </button>
                    <button
                        onClick={() => setActiveTab('description')}
                        className={`border-b-2 px-1 py-3 text-sm font-medium whitespace-nowrap ${
                            activeTab === 'description'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        }`}>
                        Description & Rules
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            <div className='flex-1 p-4'>
                {activeTab === 'description' ? (
                    <div className='space-y-4 text-gray-800'>
                        <h2 className='text-lg font-bold'>Description</h2>
                        <p>{pool.description}</p>

                        {pool.rulesLink && (
                            <div className='mt-4'>
                                <h3 className='text-md font-bold'>Terms</h3>
                                <a
                                    href={pool.rulesLink}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-blue-500 hover:underline'>
                                    View full rules
                                </a>
                            </div>
                        )}

                        <div className='mt-6'>
                            <h3 className='text-md mb-2 font-bold'>Buy-In</h3>
                            <p>${pool.depositAmount} USD</p>
                        </div>
                    </div>
                ) : (
                    <ParticipantsList key={refreshKey} poolId={pool.id} poolAmount={pool.depositAmount} />
                )}
            </div>

            {/* Action Button - Only show for non-admins */}
            {!isPoolAdmin && (
                <div className='border-t border-gray-200 p-4'>
                    {!isRegistered ? (
                        <Button
                            className='w-full rounded-lg bg-blue-500 py-3 font-medium text-white hover:bg-blue-600'
                            onClick={handleOpenRegistrationModal}>
                            {getRegistrationButtonText()}
                        </Button>
                    ) : (
                        <div className='flex flex-col items-center justify-center text-center'>
                            <p className='mb-2 font-medium text-green-600'>You are registered for this event!</p>
                            <Button
                                className='w-full rounded-lg bg-gray-200 py-3 font-medium text-gray-700 hover:bg-gray-300'
                                variant='secondary'
                                onClick={handleCancelRegistration}>
                                Cancel Registration
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Registration Modal */}
            <RegistrationModal
                isOpen={isRegistrationModalOpen}
                onCloseAction={handleCloseRegistrationModal}
                pool={pool}
                onRegisterAction={handleRegister}
            />
        </div>
    )
}
