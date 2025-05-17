'use client'

import { BlockchainErrorMessage } from '@/components/BlockchainErrorMessage'
import { Button } from '@/components/DemoComponents'
import { ParticipantsList } from '@/components/ParticipantsList'
import { RegistrationModal } from '@/components/RegistrationModal'
import { TokenApprovalButton } from '@/components/token-approval/token-approval-button'
import { getChainConfig } from '@/config/chainConfig'
import { CONTRACT_CONFIG } from '@/config/contract-config'
import { useChain } from '@/contexts/ChainContext'
import { useUserRole } from '@/contexts/UserRoleContext'
import { useGetParticipants, useJoinPool } from '@/hooks/use-pool-contract'
import type { Pool } from '@/types/pool'
import { BlockchainErrorType } from '@/utils/error-handling'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { parseUnits, type Address } from 'viem'
import { useAccount, useChainId } from 'wagmi'

interface PoolDashboardProps {
    pool: Pool
}

export function PoolDashboard({ pool }: PoolDashboardProps) {
    const [activeTab, setActiveTab] = useState<'description' | 'participants'>('participants')
    const { isAdmin: isGlobalAdmin } = useUserRole()
    const [isPoolAdmin, setIsPoolAdmin] = useState(false)
    const [isRegistered, setIsRegistered] = useState(false)
    const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false)
    const { address } = useAccount()
    const { selectedChainId: appChainId } = useChain()
    const walletChainId = useChainId()

    const [showAdminMenu, setShowAdminMenu] = useState(false)
    const adminMenuRef = useRef<HTMLDivElement>(null)

    const depositTokenAddress = pool.tokenContractAddress
    const currentAppChainConfig = getChainConfig(appChainId)
    const poolContractAddress = CONTRACT_CONFIG.getPoolContractAddress(appChainId)

    const {
        data: participantsData,
        isLoading: isLoadingParticipants,
        error: participantsError,
        refetch: refetchParticipants,
    } = useGetParticipants(pool.id)

    const { joinPool, isJoiningPool, isJoinPoolSuccess, joinPoolError } = useJoinPool()

    const participantCount: number = participantsData?.length ?? 0

    useEffect(() => {
        setIsPoolAdmin(isGlobalAdmin)

        if (address && participantsData) {
            const registered = participantsData.some(pAddress => pAddress.toLowerCase() === address.toLowerCase())
            setIsRegistered(registered)
        } else {
            setIsRegistered(false)
        }
    }, [address, participantsData, isGlobalAdmin])

    useEffect(() => {
        if (pool.id) {
            void refetchParticipants()
        }
    }, [pool.id, refetchParticipants, isJoinPoolSuccess])

    const _handleOpenRegistrationModal = () => {
        if (!address) {
            alert('Please connect your wallet to register for this event')
            return
        }
        if (walletChainId !== appChainId) {
            alert(
                `Please switch your wallet to ${currentAppChainConfig?.name ?? `Chain ID ${appChainId}`} to register.`,
            )
            return
        }
        setIsRegistrationModalOpen(true)
    }

    const handleCloseRegistrationModal = () => {
        setIsRegistrationModalOpen(false)
    }

    const handleRegister = async () => {
        if (!address || !poolContractAddress || !depositTokenAddress) {
            alert('Required information missing. Cannot register.')
            return
        }
        if (walletChainId !== appChainId) {
            alert(
                `Please switch your wallet to ${currentAppChainConfig?.name ?? `Chain ID ${appChainId}`} to register.`,
            )
            return
        }

        try {
            if (typeof pool.depositAmountPerPerson !== 'number' || typeof pool.onChainTokenDecimals !== 'number') {
                alert('Pool data is incomplete for deposit (amount or decimals missing).')
                return
            }

            const depositAmountBigInt = parseUnits(pool.depositAmountPerPerson.toString(), pool.onChainTokenDecimals)

            await joinPool({
                poolContractAddress,
                poolId: pool.id,
                depositAmount: depositAmountBigInt,
            })
            handleCloseRegistrationModal()
        } catch (e) {
            console.error('Registration failed:', e)
        }
    }

    const handleCancelRegistration = () => {
        // Implementation needed if contract supports cancellation
    }

    const formatPoolTime = () => {
        if (!pool.startTime || !pool.endTime) {
            return 'Registration time not set'
        }

        try {
            const now = new Date()
            const regStartDate = new Date(pool.startTime * 1000)
            const regEndDate = new Date(pool.endTime * 1000)

            if (isNaN(regStartDate.getTime()) || isNaN(regEndDate.getTime())) {
                return 'Registration dates not properly set'
            }

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

            if (now < regStartDate) {
                return `Registration starts: ${formatDate(regStartDate)}`
            } else if (now >= regStartDate && now < regEndDate) {
                return `Registration ends: ${formatDate(regEndDate)}`
            } else {
                return `Registration period has ended`
            }
        } catch (error) {
            console.error('Error formatting pool times:', error)
            return 'Registration time available soon'
        }
    }

    const _getRegistrationButtonText = () => {
        if (pool.depositAmountPerPerson > 0) {
            return `Register for ${pool.depositAmountPerPerson} ${pool.onChainTokenSymbol ?? 'tokens'}`
        }
        return 'Register'
    }

    const getProgressPercentage = () => {
        const currentParticipants = participantsData?.length ?? 0
        const totalRaised = currentParticipants * (pool.depositAmountPerPerson ?? 0)
        const maxCapacityAmount = (pool.softCap ?? 0) * (pool.depositAmountPerPerson ?? 0)
        if (maxCapacityAmount === 0) return 0

        const percentage = (totalRaised / maxCapacityAmount) * 100
        return Math.min(percentage, 100)
    }

    const formatCurrency = (amount: number) => {
        return `$${amount.toLocaleString()}`
    }

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

    const displaySoftCap = pool.softCap ?? 0

    return (
        <div className='flex min-h-screen flex-col bg-white'>
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

            <div className='relative h-44 w-full bg-gray-400'>
                {pool.selectedImage ? (
                    <div className='relative h-full w-full'>
                        <Image
                            fill
                            src={pool.selectedImage}
                            alt={pool.name}
                            className='h-full w-full object-cover'
                            onError={e => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'

                                const parent = target.parentElement!
                                parent.classList.add('flex', 'items-center', 'justify-center')

                                let templateNum = '?'
                                let bgClass = 'bg-gradient-to-r from-blue-100 to-blue-300'

                                if (pool.selectedImage.includes('template-')) {
                                    const match = /template-(\d+)/.exec(pool.selectedImage)
                                    if (match) templateNum = match[1]
                                } else if (pool.selectedImage.includes('/images/image')) {
                                    const match = /\/images\/image(\d+)\.png/.exec(pool.selectedImage)
                                    if (match) {
                                        templateNum = match[1]

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

            <div className='grid grid-cols-2 gap-x-4 gap-y-2 bg-white px-4 pb-4 text-sm text-gray-700 sm:grid-cols-4'>
                <div>
                    <span className='font-medium text-gray-500'>Soft Cap:</span>{' '}
                    {pool.softCap && pool.depositAmountPerPerson > 0
                        ? formatCurrency(pool.softCap * pool.depositAmountPerPerson)
                        : 'N/A'}
                </div>
                <div>
                    <span className='font-medium text-gray-500'>Buy-in:</span>{' '}
                    {pool.depositAmountPerPerson > 0 ? formatCurrency(pool.depositAmountPerPerson) : 'Free'}
                </div>
                <div className='col-span-2 sm:col-span-1'>
                    <span className='font-medium text-gray-500'>Status:</span>{' '}
                    {pool.status ? pool.status.charAt(0).toUpperCase() + pool.status.slice(1) : 'Unknown'}
                </div>
                <div className='col-span-2 sm:col-span-1'>
                    <span className='font-medium text-gray-500'>Timing:</span> {formatPoolTime()}
                </div>
            </div>

            {displaySoftCap > 0 && pool.depositAmountPerPerson > 0 && (
                <div className='bg-white px-4 pb-2'>
                    <div className='text-sm text-gray-700'>
                        {participantCount} / {pool.softCap} spots filled
                    </div>
                    <div className='mt-2 h-2 w-full rounded-full bg-gray-200'>
                        <div
                            className='h-2 rounded-full bg-blue-500'
                            style={{ width: `${getProgressPercentage()}%` }}
                        />
                    </div>
                </div>
            )}

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
                            <p>${pool.depositAmountPerPerson} USD</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {isLoadingParticipants && <p>Loading participants...</p>}
                        {participantsData && (
                            <ParticipantsList
                                participants={participantsData}
                                isAdmin={isPoolAdmin}
                                poolAmount={pool.depositAmountPerPerson}
                            />
                        )}
                    </>
                )}
            </div>

            {!isPoolAdmin && (
                <div className='border-t border-gray-200 p-4'>
                    {isLoadingParticipants && <p>Loading registration status...</p>}
                    {participantsError && (
                        <BlockchainErrorMessage
                            error={{
                                message: (participantsError as Error)?.message || 'Error fetching participants',
                                type: BlockchainErrorType.UNKNOWN,
                                suggestion: 'Please refresh the page or check your connection.',
                            }}
                        />
                    )}
                    {!isLoadingParticipants &&
                        !participantsError &&
                        (isRegistered ? (
                            <div className='flex flex-col items-center justify-center text-center'>
                                <p className='mb-2 font-medium text-green-600'>You are registered for this event!</p>
                                <Button
                                    className='w-full rounded-lg bg-gray-200 py-3 font-medium text-gray-700 hover:bg-gray-300'
                                    variant='secondary'
                                    onClick={handleCancelRegistration}>
                                    Cancel Registration
                                </Button>
                            </div>
                        ) : pool.depositAmountPerPerson > 0 &&
                          depositTokenAddress &&
                          pool.onChainTokenDecimals !== undefined &&
                          poolContractAddress ? (
                            <TokenApprovalButton
                                tokenAddress={pool.tokenContractAddress as Address}
                                spenderAddress={poolContractAddress}
                                requiredAmount={pool.depositAmountPerPerson.toString()}
                                tokenDecimals={pool.onChainTokenDecimals}
                                tokenSymbol={pool.onChainTokenSymbol ?? 'tokens'}
                                onApprovalSuccess={() => void handleRegister()}
                                disabled={isJoiningPool}
                            />
                        ) : (
                            <Button
                                onClick={() => void handleRegister()}
                                disabled={isJoiningPool}
                                className='w-full rounded-lg bg-blue-500 py-3 font-medium text-white hover:bg-blue-600'>
                                {isJoiningPool ? 'Registering...' : 'Register (Free)'}
                            </Button>
                        ))}
                    {joinPoolError && <BlockchainErrorMessage error={joinPoolError} />}
                </div>
            )}

            <RegistrationModal
                isOpen={isRegistrationModalOpen}
                onCloseAction={handleCloseRegistrationModal}
                onRegisterAction={() => void handleRegister()}
                pool={pool}
            />
        </div>
    )
}
