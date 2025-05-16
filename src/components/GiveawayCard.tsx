'use client'

import type { Giveaway } from '@/components/GiveawayWizard'
import Image from 'next/image'
import Link from 'next/link'

interface GiveawayCardProps {
    giveaway: Giveaway
    creatorName?: string
    creatorAvatar?: string
    showCreator?: boolean
}

// Function to get a color based on giveaway id
const getGiveawayColor = (giveawayId: string): string => {
    const giveawayColors = [
        'from-purple-100 to-purple-300',
        'from-pink-100 to-pink-300',
        'from-indigo-100 to-indigo-300',
        'from-blue-100 to-blue-300',
        'from-green-100 to-green-300',
        'from-yellow-100 to-yellow-300',
        'from-red-100 to-red-300',
        'from-orange-100 to-orange-300',
    ]

    // Use giveaway ID to select a color deterministically
    const charSum = [...giveawayId].reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const colorIndex = charSum % giveawayColors.length

    return giveawayColors[colorIndex]
}

export function GiveawayCard({
    giveaway,
    creatorName = 'Anonymous',
    creatorAvatar = '',
    showCreator = true,
}: GiveawayCardProps) {
    // Function to safely render the giveaway image with fallback
    const renderGiveawayImage = () => {
        // Get gradient colors based on giveaway ID
        const gradientClass = getGiveawayColor(giveaway.id ?? '0')

        return (
            <div className={`h-full w-full bg-gradient-to-r ${gradientClass} flex items-center justify-center`}>
                {/* Giveaway Icon */}
                <div className='text-center text-white'>
                    <svg
                        className='mx-auto mb-2 h-12 w-12 text-white/80'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                        xmlns='http://www.w3.org/2000/svg'>
                        <path
                            fillRule='evenodd'
                            d='M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17A3 3 0 015 5zm4 1V5a1 1 0 10-2 0v1H5a1 1 0 100 2h2v1a2 2 0 104 0V8h2a1 1 0 100-2h-2V5a1 1 0 10-2 0v1H7z'
                            clipRule='evenodd'
                        />
                    </svg>
                    <div className='px-4 text-lg font-medium text-white/90'>
                        {giveaway.description.length > 20
                            ? giveaway.description.substring(0, 20) + '...'
                            : giveaway.description}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <Link href={`/giveaway/${giveaway.id}`}>
            <div className='overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md'>
                {/* Giveaway Image */}
                <div className='relative h-40 bg-gray-200'>
                    {renderGiveawayImage()}

                    {/* Giveaway Type Badge */}
                    <div className='absolute top-3 left-3 rounded-full bg-purple-500 px-2 py-1 text-xs font-medium text-white shadow-sm'>
                        Giveaway
                    </div>

                    {/* Amount Badge */}
                    <div className='absolute top-3 right-3 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-gray-900 shadow-sm backdrop-blur-sm'>
                        ${giveaway.amount} Prize
                    </div>
                </div>

                {/* Giveaway Info */}
                <div className='p-4'>
                    <div className='mb-2 flex items-start justify-between'>
                        <h3 className='mr-2 truncate font-bold text-gray-900'>Giveaway</h3>
                        {giveaway.participantLimit > 0 && (
                            <span className='rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-600'>
                                Limit: {giveaway.participantLimit}
                            </span>
                        )}
                    </div>

                    <p className='mb-3 line-clamp-2 text-sm text-gray-600'>
                        {giveaway.description || 'No description provided.'}
                    </p>

                    {/* Creator Info (if provided) */}
                    {showCreator && (
                        <div className='mt-2 flex items-center border-t border-gray-100 pt-2'>
                            <div className='relative mr-2 h-6 w-6 overflow-hidden rounded-full bg-gray-200'>
                                {creatorAvatar ? (
                                    <Image
                                        fill
                                        src={creatorAvatar}
                                        alt={creatorName}
                                        className='h-full w-full object-cover'
                                    />
                                ) : (
                                    <div className='flex h-full w-full items-center justify-center bg-purple-100 text-purple-500'>
                                        <span className='text-xs'>{creatorName.charAt(0)}</span>
                                    </div>
                                )}
                            </div>
                            <span className='text-xs text-gray-600'>{creatorName}</span>
                            <span className='ml-auto text-xs text-gray-400'>
                                {giveaway.createdAt ? new Date(giveaway.createdAt).toLocaleDateString() : 'Recent'}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    )
}
