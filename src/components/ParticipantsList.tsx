'use client'

import { getPoolRegistrations } from '@/lib/registrationStorage'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface Participant {
    id: string
    name: string
    avatar?: string
    status: 'joined' | 'paid' | 'attending'
    isPlaceholder?: boolean // Added to identify placeholder entries
}

interface ParticipantsListProps {
    poolId: string // Used to fetch participants for a specific pool
    isAdmin?: boolean
    poolAmount?: number
}

export function ParticipantsList({ poolId, isAdmin = false, poolAmount = 100 }: ParticipantsListProps) {
    // State for storing participants
    const [participants, setParticipants] = useState<Participant[]>([])

    // Load participants from registration storage
    useEffect(() => {
        // For a real app, this would fetch actual participant details
        // For our demo, we'll just load registration data and display simple info
        const registrations = getPoolRegistrations(poolId)

        // Convert registrations to participants
        // In a real app, we would fetch user profiles using the userAddress
        const loadedParticipants = registrations.map((reg, index) => {
            // Create a deterministic avatar based on address
            const addressLastChar = reg.userAddress.slice(-1)
            const avatarId = (parseInt(addressLastChar, 16) % 10) + 1 // 1-10 range
            const gender = avatarId % 2 === 0 ? 'men' : 'women'

            return {
                id: reg.userAddress,
                name: `Participant ${index + 1}`, // In a real app, we would fetch the user's name
                avatar: `https://randomuser.me/api/portraits/${gender}/${avatarId}.jpg`,
                status: 'joined' as const,
            }
        })

        // If no participants, show some placeholders
        if (loadedParticipants.length === 0) {
            setParticipants([
                {
                    id: '1',
                    name: 'No participants yet!',
                    status: 'joined' as const,
                    isPlaceholder: true,
                },
            ])
        } else {
            setParticipants(loadedParticipants)
        }
    }, [poolId])

    const handleParticipantClick = (participant: Participant) => {
        // Only admins can click on participants to pay them
        if (!isAdmin) return

        // Show browser confirm dialog instead of custom modal
        const confirmPay = window.confirm(`Send payment of $${poolAmount} to ${participant.name}?`)
        if (confirmPay) {
            console.log(`Payment sent to: ${participant.name}`)
        }
    }

    return (
        <div className='space-y-4'>
            <div className='flex items-center justify-between'>
                <h2 className='text-lg font-bold text-black'>Participants</h2>
                <span className='text-sm text-gray-500'>
                    {participants.length} {participants.length === 1 ? 'person' : 'people'}
                </span>
            </div>

            <div className='space-y-3'>
                {participants.map(participant => (
                    <div
                        key={participant.id}
                        className={`flex items-center rounded-lg p-3 ${
                            isAdmin && !participant.isPlaceholder ? 'cursor-pointer hover:bg-gray-50' : ''
                        }`}
                        onClick={() => {
                            if (isAdmin && !participant.isPlaceholder) {
                                handleParticipantClick(participant)
                            }
                        }}>
                        <div className='relative mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-500'>
                            {participant.avatar ? (
                                <Image
                                    src={participant.avatar}
                                    alt={participant.name}
                                    fill
                                    sizes='(max-width: 40px) 100vw, 40px'
                                    style={{ objectFit: 'cover' }}
                                    className='rounded-full'
                                />
                            ) : (
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
                                        d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                                    />
                                </svg>
                            )}
                        </div>

                        <div className='flex-1'>
                            <span className='font-medium text-gray-900'>{participant.name}</span>
                            {participant.isPlaceholder ? (
                                <span className='block text-xs text-gray-500'>
                                    Users will populate here when they join
                                </span>
                            ) : (
                                isAdmin && (
                                    <span className='block text-xs text-gray-500'>Click to pay this participant</span>
                                )
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
