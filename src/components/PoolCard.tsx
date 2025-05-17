'use client'

import type { Pool } from '@/types/pool'
import { formatAddress, formatTokenAmount, getExplorerLink } from '@/utils/formatting'
import Image from 'next/image'
import Link from 'next/link'

interface PoolCardProps {
    pool: Pool
    creatorName?: string
    creatorAvatar?: string
    showCreator?: boolean
}

// Function to get a color based on the template number
const getTemplateColor = (templateStr: string): string => {
    const templateColors = [
        'from-blue-100 to-blue-300', // template-1
        'from-green-100 to-green-300', // template-2
        'from-purple-100 to-purple-300', // template-3
        'from-red-100 to-red-300', // template-4
        'from-yellow-100 to-yellow-300', // template-5
        'from-pink-100 to-pink-300', // template-6
        'from-indigo-100 to-indigo-300', // template-7
        'from-gray-100 to-gray-300', // template-8
    ]

    // Extract number from template string (template-1 -> 1) or image path (/image/image1.png -> 1)
    let templateNum = 1

    if (templateStr.includes('template-')) {
        const templateMatch = /template-(\d+)/.exec(templateStr)
        if (templateMatch) {
            templateNum = parseInt(templateMatch[1], 10)
        }
    } else if (templateStr.includes('/images/image')) {
        const templateMatch = /\/images\/image(\d+)\.png/.exec(templateStr)
        if (templateMatch) {
            templateNum = parseInt(templateMatch[1], 10)
        }
    }

    // Use modulo to handle any template number
    return templateColors[(templateNum - 1) % templateColors.length]
}

export function PoolCard({ pool, creatorName = 'Anonymous', creatorAvatar = '', showCreator = true }: PoolCardProps) {
    // Function to safely render the image with fallback
    const renderPoolImage = () => {
        if (!pool.selectedImage) {
            return (
                <div className='flex h-full w-full items-center justify-center bg-blue-50 text-blue-300'>
                    <svg
                        className='h-16 w-16'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                        xmlns='http://www.w3.org/2000/svg'>
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='1'
                            d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                        />
                    </svg>
                </div>
            )
        }

        // Get gradient colors based on template number
        const gradientClass = getTemplateColor(pool.selectedImage)

        // Extract template number for the fallback
        let templateNum = '?'
        if (pool.selectedImage.includes('template-')) {
            const match = /template-(\d+)/.exec(pool.selectedImage)
            if (match) templateNum = match[1]
        } else if (pool.selectedImage.includes('/images/image')) {
            const match = /\/images\/image(\d+)\.png/.exec(pool.selectedImage)
            if (match) templateNum = match[1]
        }

        return (
            <div className={`relative h-full w-full bg-gradient-to-r ${gradientClass}`}>
                <Image
                    fill
                    src={pool.selectedImage}
                    alt={pool.name}
                    className='h-full w-full object-cover'
                    onError={e => {
                        // On error, replace with a styled gradient background with text
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'

                        // Get parent element
                        const parent = target.parentElement!
                        parent.classList.add('flex', 'items-center', 'justify-center')

                        // Create visually pleasing label with pool name
                        const label = document.createElement('div')
                        label.className = 'text-center'

                        // Add pool icon/number
                        const iconSpan = document.createElement('div')
                        iconSpan.className = 'text-3xl font-bold mb-2 text-white/80'
                        iconSpan.textContent = `#${templateNum}`
                        label.appendChild(iconSpan)

                        // Add pool name
                        const nameSpan = document.createElement('div')
                        nameSpan.className = 'text-lg font-medium text-white/90 px-4'
                        nameSpan.textContent = pool.name
                        label.appendChild(nameSpan)

                        parent.appendChild(label)
                    }}
                />
            </div>
        )
    }

    return (
        <Link href={`/pool/${pool.id}`}>
            <div className='overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md'>
                {/* Pool Image */}
                <div className='relative h-40 bg-gray-200'>
                    {renderPoolImage()}

                    {/* Buy-in badge */}
                    {pool.depositAmountPerPerson > 0 && (
                        <div className='absolute top-3 right-3 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-gray-900 shadow-sm backdrop-blur-sm'>
                            Buy-in: {pool.depositAmountPerPerson} {pool.onChainTokenSymbol ?? 'Tokens'}
                        </div>
                    )}
                </div>

                {/* Pool Info */}
                <div className='p-4'>
                    <div className='mb-2 flex items-start justify-between'>
                        <h3 className='mr-2 truncate font-bold text-gray-900'>{pool.name}</h3>
                        {pool?.softCap != null && pool.softCap > 0 && (
                            <span className='rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-600'>
                                Cap: {pool.softCap}
                            </span>
                        )}
                    </div>

                    <p className='mb-3 line-clamp-2 text-sm text-gray-600'>
                        {pool.description ?? 'No description provided.'}
                    </p>

                    {/* Token Info Section */}
                    {(pool.onChainTokenSymbol != null || pool.tokenContractAddress != null) && (
                        <div className='mb-3 border-t border-gray-100 pt-3 text-xs text-gray-500'>
                            <div className='flex items-center'>
                                <span className='font-medium'>Token:</span>
                                <span className='ml-1 text-gray-700'>{pool.onChainTokenSymbol ?? 'Unnamed Token'}</span>
                            </div>
                            {pool.tokenContractAddress && (
                                <div className='flex items-center'>
                                    <span className='font-medium'>Address:</span>
                                    <span className='ml-1 truncate text-gray-700' title={pool.tokenContractAddress}>
                                        {formatAddress(pool.tokenContractAddress)}
                                    </span>
                                    <button
                                        onClick={e => {
                                            e.preventDefault() // Prevent Link navigation
                                            e.stopPropagation() // Stop event bubbling
                                            if (pool.tokenContractAddress) {
                                                navigator.clipboard
                                                    .writeText(pool.tokenContractAddress)
                                                    .then(() => {
                                                        // Optional: Add feedback like a temporary message or icon change
                                                        console.log('Address copied to clipboard')
                                                    })
                                                    .catch(err => {
                                                        console.error('Failed to copy address: ', err)
                                                    })
                                            }
                                        }}
                                        title='Copy address'
                                        className='ml-2 rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:ring-1 focus:ring-gray-300 focus:outline-none'>
                                        <svg
                                            xmlns='http://www.w3.org/2000/svg'
                                            className='h-3.5 w-3.5' // Adjusted size
                                            fill='none'
                                            viewBox='0 0 24 24'
                                            stroke='currentColor'
                                            strokeWidth='2'>
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'
                                            />
                                        </svg>
                                    </button>
                                </div>
                            )}
                            {/* TODO: Display current price if available in Pool type and add tooltip for metadata */}
                        </div>
                    )}

                    {/* Pool Stats Section */}
                    {(pool.participants != null || pool.totalDeposited != null) && (
                        <div className='mb-3 border-t border-gray-100 pt-3 text-xs text-gray-500'>
                            {pool.participants && (
                                <div className='flex items-center'>
                                    <span className='font-medium'>Participants:</span>
                                    <span className='ml-1 text-gray-700'>{pool.participants.length}</span>
                                </div>
                            )}
                            {pool.totalDeposited && (
                                <div className='flex items-center'>
                                    <span className='font-medium'>Total Value Locked:</span>
                                    {/* TODO: Properly format totalDeposited with token decimals and symbol (Subtask 9.5) */}
                                    <span className='ml-1 text-gray-700'>
                                        {formatTokenAmount(
                                            pool.totalDeposited,
                                            pool.onChainTokenDecimals,
                                            pool.onChainTokenSymbol,
                                        )}
                                    </span>
                                </div>
                            )}
                            {/* TODO: Add Average Stake if calculation is straightforward here or data is provided */}
                        </div>
                    )}

                    {/* Blockchain Explorer Links */}
                    {(pool.tokenContractAddress != null || pool.tokenContractAddress != null) && (
                        <div className='mt-2 border-t border-gray-100 pt-2 text-xs'>
                            {pool.tokenContractAddress &&
                                (() => {
                                    const explorer = getExplorerLink(pool.chainId, pool.tokenContractAddress, 'address')
                                    return explorer ? (
                                        <div className='mb-1'>
                                            <a
                                                href={explorer.url}
                                                target='_blank'
                                                rel='noopener noreferrer'
                                                className='text-blue-600 hover:text-blue-800 hover:underline'>
                                                View Pool Contract on {explorer.name}
                                            </a>
                                        </div>
                                    ) : null
                                })()}
                            {pool.tokenContractAddress &&
                                (() => {
                                    const explorer = getExplorerLink(pool.chainId, pool.tokenContractAddress, 'token')
                                    return explorer ? (
                                        <a
                                            href={explorer.url}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-600 hover:text-blue-800 hover:underline'>
                                            View Token on {explorer.name}
                                        </a>
                                    ) : null
                                })()}
                        </div>
                    )}

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
                                    <div className='flex h-full w-full items-center justify-center bg-blue-100 text-blue-500'>
                                        <span className='text-xs'>{creatorName.charAt(0)}</span>
                                    </div>
                                )}
                            </div>
                            <span className='text-xs text-gray-600'>{creatorName}</span>
                            <span className='ml-auto text-xs text-gray-400'>
                                {new Date(pool.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    )
}
