'use client'

import type { Giveaway } from '@/components/GiveawayWizard'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { deletePool } from '@/lib/poolStorage'
import type { Pool } from '@/types/pool'
import { TrashIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useAccount } from 'wagmi'

interface PoolListProps {
    pools: Pool[]
    giveaways?: Giveaway[]
    onPoolDeleted?: (poolId: string) => void
}

interface PoolItem {
    id: string
    name: string
    registeredCount: number
    maxParticipants: number
    startTime: number
    image: string | null | undefined
    isGiveaway: boolean
    data: Giveaway | Pool
    amount: number
}

export function PoolList({ pools, giveaways = [], onPoolDeleted }: PoolListProps) {
    const { address: currentUserAddress } = useAccount()
    const [poolToDelete, setPoolToDelete] = useState<string | null>(null)

    const formattedPools = pools.map(pool => {
        let poolStartTimeNumber = 0
        try {
            if (typeof pool.startTime === 'number') {
                poolStartTimeNumber = pool.startTime
            } else if (typeof pool.startTime === 'string') {
                const parsedNum = Number(pool.startTime)
                if (!isNaN(parsedNum)) {
                    poolStartTimeNumber = parsedNum
                } else {
                    console.warn(
                        'Pool has invalid string startTime, cannot convert to number:',
                        pool.id,
                        pool.startTime,
                    )
                    poolStartTimeNumber = Math.floor(Date.now() / 1000)
                }
            } else {
                console.warn('Pool has invalid startTime type:', pool.id, pool.startTime)
                poolStartTimeNumber = Math.floor(Date.now() / 1000)
            }
        } catch (error) {
            poolStartTimeNumber = Math.floor(Date.now() / 1000)
            console.error('Error processing pool startTime:', error)
        }

        return {
            id: pool.id,
            name: pool.name ?? 'Unnamed Pool',
            registeredCount: pool.participants?.length ?? 0,
            maxParticipants: pool.totalWinners ?? pool.softCap ?? 0,
            startTime: poolStartTimeNumber,
            image: pool.selectedImage,
            isGiveaway: false,
            data: pool,
            amount: pool.depositAmountPerPerson ?? 0,
        } as PoolItem
    })

    const formattedGiveaways: PoolItem[] = giveaways.map(giveaway => ({
        id: giveaway.id ?? '',
        name: 'Giveaway',
        registeredCount: 0,
        maxParticipants: giveaway.participantLimit,
        startTime: giveaway.registrationStart
            ? Math.floor(new Date(giveaway.registrationStart).getTime() / 1000)
            : Math.floor(Date.now() / 1000),
        image: null,
        isGiveaway: true,
        data: giveaway,
        amount: giveaway.amount,
    }))

    const allEvents = [...formattedPools, ...formattedGiveaways]

    allEvents.sort((a, b) => {
        const dateAVal = a.isGiveaway ? (a.data as Giveaway).createdAt : (a.data as Pool).createdAt
        const dateBVal = b.isGiveaway ? (b.data as Giveaway).createdAt : (b.data as Pool).createdAt

        const timeA = dateAVal ? new Date(dateAVal).getTime() : 0
        const timeB = dateBVal ? new Date(dateBVal).getTime() : 0

        return timeB - timeA
    })

    const getTimeRemaining = (startTimeTimestamp: number) => {
        try {
            if (typeof startTimeTimestamp !== 'number' || isNaN(startTimeTimestamp)) {
                console.warn('Invalid startTimeTimestamp input to getTimeRemaining:', startTimeTimestamp)
                return 'Invalid time'
            }

            const nowSeconds = Math.floor(Date.now() / 1000)
            const totalSecondsRemaining = startTimeTimestamp - nowSeconds

            if (totalSecondsRemaining <= 0) return 'Started'

            const hours = Math.floor(totalSecondsRemaining / 3600)
            const minutes = Math.floor((totalSecondsRemaining % 3600) / 60)

            if (hours > 0) {
                return `Starts in ${hours}h ${minutes}m`
            } else if (minutes > 0) {
                return `Starts in ${minutes}m`
            } else {
                return 'Starting soon'
            }
        } catch (error) {
            console.error('Error in getTimeRemaining:', error)
            return 'Error'
        }
    }

    const handleDeletePool = (poolId: string) => {
        const success = deletePool(poolId)
        if (success) {
            console.log(`Successfully deleted pool: ${poolId}`)
            onPoolDeleted?.(poolId)
        } else {
            console.error(`Failed to delete pool: ${poolId}`)
        }
        setPoolToDelete(null)
    }

    const renderPoolItem = (poolItem: PoolItem, _isYourPool: boolean) => (
        <div
            key={`list-${poolItem.id}`}
            className='flex items-center rounded-2xl border border-gray-100 p-3.5 transition-colors hover:bg-gray-50'>
            <div className='relative mr-4 h-16 w-16 overflow-hidden rounded-xl bg-gray-200'>
                {poolItem.isGiveaway ? (
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
                ) : poolItem.image ? (
                    <Image
                        src={poolItem.image}
                        alt={poolItem.name}
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

            <Link href={poolItem.isGiveaway ? `/giveaway/${poolItem.id}` : `/pool/${poolItem.id}`} className='flex-1'>
                <div className='text-lg font-semibold text-gray-900'>{poolItem.name}</div>
                <div className='text-sm text-gray-500'>
                    {poolItem.registeredCount}/{poolItem.maxParticipants} Registered
                </div>
                <div className='text-sm text-gray-500'>{getTimeRemaining(poolItem.startTime)}</div>
            </Link>

            <div className='flex flex-col items-end gap-2'>
                {poolItem.amount > 0 && (
                    <div className='rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-gray-900 shadow-sm backdrop-blur-sm'>
                        ${poolItem.amount} {poolItem.isGiveaway ? 'Prize' : 'Entry'}
                    </div>
                )}

                <div className='flex items-center gap-2'>
                    {!poolItem.isGiveaway &&
                        currentUserAddress &&
                        (poolItem.data as Pool).createdBy &&
                        (poolItem.data as Pool).createdBy?.toLowerCase() === currentUserAddress.toLowerCase() && (
                            <AlertDialog
                                open={poolToDelete === poolItem.id}
                                onOpenChange={open => !open && setPoolToDelete(null)}>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant='ghost'
                                        size='icon'
                                        className='h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600'
                                        onClick={e => {
                                            e.preventDefault()
                                            setPoolToDelete(poolItem.id)
                                        }}>
                                        <TrashIcon className='h-4 w-4' />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Pool</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to delete this pool? This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            className='bg-red-500 hover:bg-red-600'
                                            onClick={() => handleDeletePool(poolItem.id)}>
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}

                    <Link href={poolItem.isGiveaway ? `/giveaway/${poolItem.id}` : `/pool/${poolItem.id}`}>
                        <div className='text-blue-500'>
                            <svg
                                className='h-5 w-5'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                                xmlns='http://www.w3.org/2000/svg'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                            </svg>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )

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

    const yourPools = allEvents
        .filter(
            event =>
                !event.isGiveaway &&
                currentUserAddress &&
                (event.data as Pool).createdBy?.toLowerCase() === currentUserAddress.toLowerCase(),
        )
        .slice(0, 3)

    const upcomingPools = allEvents.filter(event => yourPools.findIndex(yp => yp.id === event.id) === -1)

    return (
        <>
            {yourPools.length > 0 && (
                <div className='mb-4 rounded-3xl bg-white p-4 shadow-sm'>
                    <h2 className='mb-4 text-2xl font-bold text-gray-900'>Your Pools</h2>
                    <div className='space-y-3'>{yourPools.map(event => renderPoolItem(event, true))}</div>
                </div>
            )}

            {upcomingPools.length > 0 && (
                <div className='mb-4 rounded-3xl bg-white p-4 shadow-sm'>
                    <h2 className='mb-4 text-2xl font-bold text-gray-900'>Upcoming Pools</h2>
                    <div className='space-y-3'>{upcomingPools.map(event => renderPoolItem(event, false))}</div>
                </div>
            )}
        </>
    )
}
