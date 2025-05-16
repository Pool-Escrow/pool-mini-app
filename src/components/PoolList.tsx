'use client'

import type { Giveaway } from '@/components/GiveawayWizard'
import type { Pool } from '@/types/pool'
import Image from 'next/image'
import Link from 'next/link'

interface PoolListProps {
    pools: Pool[]
    giveaways?: Giveaway[]
}

export function PoolList({ pools, giveaways = [] }: PoolListProps) {
    // Format pools for display
    const formattedPools = pools.map(pool => {
        return {
            id: pool.id,
            name: pool.name,
            registeredCount: pool.registrations ?? 0,
            maxParticipants: pool.maxEntries,
            startTime: new Date(pool.startTime),
            image: pool.selectedImage,
            isGiveaway: false,
            data: pool,
            amount: pool.depositAmount,
        }
    })

    // Format giveaways for display
    const formattedGiveaways = giveaways.map(giveaway => ({
        id: giveaway.id ?? '',
        name: 'Giveaway',
        registeredCount: 0, // This could be updated if giveaways track registrations
        maxParticipants: giveaway.participantLimit,
        startTime: giveaway.registrationStart ? new Date(giveaway.registrationStart) : new Date(),
        image: null, // Giveaways use gradient backgrounds instead
        isGiveaway: true,
        data: giveaway,
        amount: giveaway.amount,
    }))

    // Combine pools and giveaways
    const allEvents = [...formattedPools, ...formattedGiveaways]

    // Sort by most recent creation date
    allEvents.sort((a, b) => {
        const dateA = a.isGiveaway
            ? new Date((a.data as Giveaway).createdAt ?? '')
            : new Date((a.data as Pool).createdAt)

        const dateB = b.isGiveaway
            ? new Date((b.data as Giveaway).createdAt ?? '')
            : new Date((b.data as Pool).createdAt)

        return dateB.getTime() - dateA.getTime()
    })

    const getTimeRemaining = (startTime: Date) => {
        const totalSeconds = Math.floor((startTime.getTime() - Date.now()) / 1000)

        if (totalSeconds <= 0) return 'Started'

        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)

        if (hours > 0) {
            return `Starts in ${hours}h ${minutes}m`
        } else {
            return `Starts in ${minutes}m`
        }
    }

    if (allEvents.length === 0) {
        return (
            <div className='mb-4 rounded-3xl bg-white p-4 shadow-sm'>
                <h2 className='mb-4 text-2xl font-bold text-gray-900'>Your Pools</h2>
                <div className='rounded-lg bg-gray-50 p-6 text-center'>
                    <p className='text-gray-500'>No pools yet. Create your first one!</p>
                </div>
            </div>
        )
    }

    // We'll create two sections - Your Pools and Upcoming Pools
    const yourPools = allEvents.slice(0, Math.min(3, allEvents.length))
    const upcomingPools = allEvents.length > 3 ? allEvents.slice(3) : []

    return (
        <>
            {/* Your Pools Section */}
            <div className='mb-4 rounded-3xl bg-white p-4 shadow-sm'>
                <h2 className='mb-4 text-2xl font-bold text-gray-900'>Your Pools</h2>

                <div className='space-y-3'>
                    {yourPools.map(event => (
                        <Link
                            href={event.isGiveaway ? `/giveaway/${event.id}` : `/pool/${event.id}`}
                            key={`list-${event.id}`}>
                            <div className='flex items-center rounded-2xl border border-gray-100 p-3.5 transition-colors hover:bg-gray-50'>
                                <div className='relative mr-4 h-16 w-16 overflow-hidden rounded-xl bg-gray-200'>
                                    {event.isGiveaway ? (
                                        <div className='flex h-full w-full items-center justify-center bg-gradient-to-r from-purple-100 to-purple-300'>
                                            <svg
                                                className='h-8 w-8 text-white'
                                                fill='currentColor'
                                                viewBox='0 0 20 20'
                                                xmlns='http://www.w3.org/2000/svg'>
                                                <path
                                                    fillRule='evenodd'
                                                    d='M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17A3 3 0 015 5zm4 1V5a1 1 0 10-2 0v1H5a1 1 0 100 2h2v1a2 2 0 104 0V8h2a1 1 0 100-2h-2V5a1 1 0 10-2 0v1H7z'
                                                    clipRule='evenodd'
                                                />
                                            </svg>
                                        </div>
                                    ) : event.image ? (
                                        <Image
                                            src={event.image}
                                            alt={event.name}
                                            fill
                                            sizes='(max-width: 64px) 100vw, 64px'
                                            style={{ objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div className='flex h-full w-full items-center justify-center'>
                                            <span className='text-xs text-white'>No Image</span>
                                        </div>
                                    )}
                                </div>
                                <div className='flex-1'>
                                    <div className='text-lg font-semibold text-gray-900'>{event.name}</div>
                                    <div className='text-sm text-gray-500'>
                                        {event.registeredCount}/{event.maxParticipants} Registered
                                    </div>
                                    <div className='text-sm text-gray-500'>{getTimeRemaining(event.startTime)}</div>
                                </div>
                                <div className='flex flex-col items-end'>
                                    {event.amount > 0 && (
                                        <div className='mb-2 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-gray-900 shadow-sm backdrop-blur-sm'>
                                            ${event.amount} {event.isGiveaway ? 'Prize' : 'Buy-in'}
                                        </div>
                                    )}
                                    <div className='text-blue-500'>
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
                                                d='M9 5l7 7-7 7'
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Upcoming Pools Section - Only show if we have more pools */}
            {upcomingPools.length > 0 && (
                <div className='mb-4 rounded-3xl bg-white p-4 shadow-sm'>
                    <h2 className='mb-4 text-2xl font-bold text-gray-900'>Upcoming Pools</h2>

                    <div className='space-y-3'>
                        {upcomingPools.map(event => (
                            <Link
                                href={event.isGiveaway ? `/giveaway/${event.id}` : `/pool/${event.id}`}
                                key={`list-${event.id}`}>
                                <div className='flex items-center rounded-2xl border border-gray-100 p-3.5 transition-colors hover:bg-gray-50'>
                                    <div className='relative mr-4 h-16 w-16 overflow-hidden rounded-xl bg-gray-200'>
                                        {event.isGiveaway ? (
                                            <div className='flex h-full w-full items-center justify-center bg-gradient-to-r from-purple-100 to-purple-300'>
                                                <svg
                                                    className='h-8 w-8 text-white'
                                                    fill='currentColor'
                                                    viewBox='0 0 20 20'
                                                    xmlns='http://www.w3.org/2000/svg'>
                                                    <path
                                                        fillRule='evenodd'
                                                        d='M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17A3 3 0 015 5zm4 1V5a1 1 0 10-2 0v1H5a1 1 0 100 2h2v1a2 2 0 104 0V8h2a1 1 0 100-2h-2V5a1 1 0 10-2 0v1H7z'
                                                        clipRule='evenodd'
                                                    />
                                                </svg>
                                            </div>
                                        ) : event.image ? (
                                            <Image
                                                src={event.image}
                                                alt={event.name}
                                                fill
                                                sizes='(max-width: 64px) 100vw, 64px'
                                                style={{ objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div className='flex h-full w-full items-center justify-center'>
                                                <span className='text-xs text-white'>No Image</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className='flex-1'>
                                        <div className='text-lg font-semibold text-gray-900'>{event.name}</div>
                                        <div className='text-sm text-gray-500'>
                                            {event.registeredCount}/{event.maxParticipants} Registered
                                        </div>
                                        <div className='text-sm text-gray-500'>{getTimeRemaining(event.startTime)}</div>
                                    </div>
                                    <div className='flex flex-col items-end'>
                                        {event.amount > 0 && (
                                            <div className='mb-2 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-gray-900 shadow-sm backdrop-blur-sm'>
                                                ${event.amount} {event.isGiveaway ? 'Prize' : 'Buy-in'}
                                            </div>
                                        )}
                                        <div className='text-blue-500'>
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
                                                    d='M9 5l7 7-7 7'
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </>
    )
}
