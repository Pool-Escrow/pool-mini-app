'use client'

import { Button } from '@/components/DemoComponents'
import type { Giveaway } from '@/components/GiveawayWizard'
import { ParticipantsList } from '@/components/ParticipantsList'
import { useUserRole } from '@/components/providers'
import { getGiveawayById } from '@/lib/giveawayStorage'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { use, useEffect, useRef, useState } from 'react'

type Params = Promise<{ id: string }>

export default function GiveawayPage({ params }: { params: Params }) {
    const [giveaway, setGiveaway] = useState<Giveaway | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const { isAdmin } = useUserRole()
    const [isRegistered, setIsRegistered] = useState(false)
    const [showAdminMenu, setShowAdminMenu] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)
    const [activeTab, setActiveTab] = useState<'participants' | 'description'>('participants')
    const adminMenuRef = useRef<HTMLDivElement>(null)
    const { id } = use(params)

    useEffect(() => {
        // Get the giveaway by ID
        const foundGiveaway = getGiveawayById(id)

        if (foundGiveaway) {
            setGiveaway(foundGiveaway)
        } else {
            // Redirect to home if giveaway not found
            router.push('/')
        }

        setLoading(false)
    }, [id, router])

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

    // Format time display for registration
    const formatRegistrationTime = () => {
        if (!giveaway?.registrationStart || !giveaway.registrationEnd) {
            return 'Registration time not set'
        }

        try {
            const now = new Date()
            const regStartDate = new Date(giveaway.registrationStart)
            const regEndDate = new Date(giveaway.registrationEnd)

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
            console.error('Error formatting giveaway times:', error)
            return 'Registration time available soon'
        }
    }

    const handleRegister = () => {
        // In a real app, you would implement registration logic here
        alert('Registration for giveaway implemented in future update')
        setIsRegistered(true)
        setRefreshKey(prev => prev + 1)
    }

    const handleCancelRegistration = () => {
        // In a real app, you would implement cancellation logic here
        alert('Registration cancellation implemented in future update')
        setIsRegistered(false)
        setRefreshKey(prev => prev + 1)
    }

    // Determine giveaway background color
    const getGiveawayColor = (giveawayId: string): string => {
        const giveawayColors = [
            'from-purple-100 to-purple-300',
            'from-pink-100 to-pink-300',
            'from-indigo-100 to-indigo-300',
            'from-blue-100 to-blue-300',
        ]

        const charSum = [...giveawayId].reduce((acc, char) => acc + char.charCodeAt(0), 0)
        const colorIndex = charSum % giveawayColors.length

        return giveawayColors[colorIndex]
    }

    // Calculate progress percentage
    const getProgressPercentage = () => {
        if (!giveaway?.participantLimit) return 0
        // This would normally be based on actual registrations
        // For now we'll show a small amount of progress (10%)
        return 10
    }

    if (loading) {
        return (
            <div className='flex min-h-screen items-center justify-center bg-white'>
                <div className='h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-purple-500' />
            </div>
        )
    }

    if (!giveaway) {
        return (
            <div className='flex min-h-screen items-center justify-center bg-white text-gray-800'>
                <div className='text-center'>
                    <h1 className='mb-2 text-2xl font-bold'>Giveaway Not Found</h1>
                    <p className='mb-4'>The giveaway you are looking for does not exist.</p>
                    <button onClick={() => router.push('/')} className='rounded-lg bg-purple-500 px-4 py-2 text-white'>
                        Return Home
                    </button>
                </div>
            </div>
        )
    }

    // Get color for background gradient
    const gradientClass = getGiveawayColor(giveaway.id ?? '0')

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

            {/* Giveaway Cover Image/Banner */}
            <div className='relative h-44 w-full'>
                <div className={`h-full w-full bg-gradient-to-r ${gradientClass} flex items-center justify-center`}>
                    {/* Giveaway Icon */}
                    <div className='text-center text-white'>
                        <svg
                            className='mx-auto mb-2 h-16 w-16 text-white/80'
                            fill='currentColor'
                            viewBox='0 0 20 20'
                            xmlns='http://www.w3.org/2000/svg'>
                            <path
                                fillRule='evenodd'
                                d='M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17A3 3 0 015 5zm4 1V5a1 1 0 10-2 0v1H5a1 1 0 100 2h2v1a2 2 0 104 0V8h2a1 1 0 100-2h-2V5a1 1 0 10-2 0v1H7z'
                                clipRule='evenodd'
                            />
                        </svg>
                        <h1 className='text-3xl font-bold text-white/90'>Giveaway</h1>
                    </div>
                </div>
            </div>

            {/* Giveaway Details */}
            <div className='p-4'>
                <div className='flex items-start justify-between'>
                    <h1 className='text-2xl font-bold text-gray-900'>Giveaway</h1>

                    {/* Admin menu (3 dots) for giveaway organizers - Horizontal dots */}
                    {isAdmin && (
                        <div className='relative' ref={adminMenuRef}>
                            <button
                                onClick={() => setShowAdminMenu(!showAdminMenu)}
                                className='p-2 text-gray-600 hover:text-gray-900'
                                aria-label='Giveaway management options'>
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
                                            alert(
                                                'Prize distribution feature will be enabled when there are participants',
                                            )
                                            setShowAdminMenu(false)
                                        }}>
                                        Distribute Prize Equally
                                    </button>
                                    <button
                                        className='w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100'
                                        onClick={() => {
                                            if (window.confirm('Are you sure you want to cancel this giveaway?')) {
                                                alert('Giveaway cancelled')
                                                setShowAdminMenu(false)
                                            }
                                        }}>
                                        Cancel Giveaway
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <p className='mb-4 text-gray-600'>{formatRegistrationTime()}</p>

                {/* Prize Amount and Participant Limit */}
                <div className='mb-2 flex items-center justify-between'>
                    <div>
                        <span className='font-bold text-gray-900'>${giveaway.amount} Giveaway</span>
                    </div>
                    <div>
                        <span className='text-gray-600'>Limit: {giveaway.participantLimit} Participants</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className='mb-4 h-2 w-full rounded-full bg-gray-200'>
                    <div className='h-full rounded-full bg-blue-500' style={{ width: `${getProgressPercentage()}%` }} />
                </div>
            </div>

            {/* Admin Badge (if user is admin) */}
            {isAdmin && (
                <div className='mx-4 mb-2'>
                    <span className='inline-block rounded-md bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800'>
                        You are the organizer
                    </span>
                </div>
            )}

            {/* Tabs */}
            <div className='border-b border-gray-200'>
                <nav className='flex'>
                    <button
                        className={`px-4 py-3 text-sm font-medium ${
                            activeTab === 'participants'
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setActiveTab('participants')}>
                        Participants
                    </button>
                    <button
                        className={`px-4 py-3 text-sm font-medium ${
                            activeTab === 'description'
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setActiveTab('description')}>
                        Description
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            <div className='flex-1 p-4'>
                {activeTab === 'participants' ? (
                    <ParticipantsList
                        poolId={giveaway.id ?? ''}
                        isAdmin={isAdmin}
                        poolAmount={giveaway.amount}
                        key={refreshKey}
                    />
                ) : (
                    <div className='space-y-4 text-gray-800'>
                        <h2 className='text-lg font-bold'>Description</h2>
                        <p>{giveaway.description}</p>

                        {/* Requirements Section (moved inside description tab) */}
                        <div className='mt-6'>
                            <h3 className='mb-2 font-medium text-gray-900'>Requirements:</h3>
                            <ul className='space-y-2 text-sm text-gray-700'>
                                {giveaway.pageFollowRequired && (
                                    <li className='flex items-center'>
                                        <svg
                                            className='mr-2 h-5 w-5 text-green-500'
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                            xmlns='http://www.w3.org/2000/svg'>
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth='2'
                                                d='M5 13l4 4L19 7'
                                            />
                                        </svg>
                                        <span>Follow @partywithpool required</span>
                                    </li>
                                )}
                                {giveaway.requiresApproval && (
                                    <li className='flex items-center'>
                                        <svg
                                            className='mr-2 h-5 w-5 text-green-500'
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                            xmlns='http://www.w3.org/2000/svg'>
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth='2'
                                                d='M5 13l4 4L19 7'
                                            />
                                        </svg>
                                        <span>Requires approval to join</span>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Button - Only show for non-admins */}
            {!isAdmin && (
                <div className='border-t border-gray-200 p-4'>
                    {!isRegistered ? (
                        <Button
                            className='w-full rounded-lg bg-purple-500 py-3 font-medium text-white hover:bg-purple-600'
                            onClick={handleRegister}>
                            Register for Giveaway
                        </Button>
                    ) : (
                        <div className='flex flex-col items-center justify-center text-center'>
                            <p className='mb-2 font-medium text-green-600'>You are registered for this giveaway!</p>
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
        </div>
    )
}
