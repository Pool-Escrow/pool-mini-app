'use client'

import { PoolDashboard } from '@/components/PoolDashboard'
import { useChain } from '@/contexts/ChainContext'
import { getPoolWithContractFallback } from '@/lib/poolDataService'
import { getPoolById, initializePoolsStorage } from '@/lib/poolStorage'
import type { Pool } from '@/types/pool'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface PoolPageClientProps {
    id: string
}

export default function PoolPageClient({ id }: PoolPageClientProps) {
    const [pool, setPool] = useState<Pool | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const { selectedChainId } = useChain()

    useEffect(() => {
        // Initialize pools if needed (primarily for client-side fallback)
        initializePoolsStorage()

        const fetchPoolData = async () => {
            setLoading(true)
            try {
                const foundPool: Pool | null = await getPoolWithContractFallback(id, selectedChainId)

                if (foundPool) {
                    // getPoolWithContractFallback should return data conforming to Pool type,
                    // including correct date/time formats (createdAt: string ISO, startTime: number Unix timestamp)
                    setPool(foundPool)
                } else {
                    // Type assertion for localPoolData to allow accessing potentially old/different fields
                    const localPoolData = getPoolById(id)
                    if (localPoolData) {
                        console.warn(
                            `Pool with id ${id} not found on chain ${selectedChainId}. Falling back to potentially stale local data.`,
                        )
                        // Mapping from potentially old/different names in localPoolData
                        const processedLocalPool: Pool = {
                            id: localPoolData.id,
                            name: localPoolData.name ?? 'Unnamed Pool',
                            description: localPoolData.description ?? '',
                            selectedImage: localPoolData.selectedImage ?? '/images/image1.png',
                            startTime:
                                typeof localPoolData.startTime === 'number'
                                    ? localPoolData.startTime
                                    : localPoolData.startTime
                                      ? new Date(localPoolData.startTime).getTime() / 1000
                                      : Date.now() / 1000,
                            endTime:
                                typeof localPoolData.endTime === 'number'
                                    ? localPoolData.endTime
                                    : localPoolData.endTime
                                      ? new Date(localPoolData.endTime).getTime() / 1000
                                      : Date.now() / 1000 + 3600,
                            createdAt:
                                typeof localPoolData.createdAt === 'string'
                                    ? localPoolData.createdAt
                                    : localPoolData.createdAt
                                      ? new Date(localPoolData.createdAt).toISOString()
                                      : new Date().toISOString(),
                            // Mapping from potentially old/different names in localPoolData
                            tokenContractAddress: localPoolData.tokenContractAddress,
                            depositAmountPerPerson: localPoolData.depositAmountPerPerson ?? 0,
                            totalWinners: localPoolData.totalWinners ?? 0,
                            amountPerWinner: localPoolData.amountPerWinner ?? 0,
                            rulesLink: localPoolData.rulesLink ?? undefined,
                            participants: localPoolData.participants ?? [],
                            status:
                                localPoolData.status &&
                                ['draft', 'active', 'completed', 'cancelled'].includes(localPoolData.status)
                                    ? (localPoolData.status as Pool['status'])
                                    : 'draft',
                            chainId: localPoolData.chainId ?? selectedChainId,
                            softCap: localPoolData.softCap ?? undefined,
                            createdBy: localPoolData.createdBy ?? undefined,
                            // Fields that are primarily on-chain; less likely in old local storage but included for completeness
                            onChainPoolAdmin: localPoolData.onChainPoolAdmin ?? undefined,
                            onChainTokenSymbol: localPoolData.onChainTokenSymbol ?? undefined,
                            onChainTokenDecimals: localPoolData.onChainTokenDecimals ?? undefined,
                            totalDeposited: localPoolData.totalDeposited ?? undefined,
                            currentBalance: localPoolData.currentBalance ?? undefined,
                            onChainWinners: localPoolData.onChainWinners ?? [],
                            winnerDetails: localPoolData.winnerDetails ?? [],
                            txHash: localPoolData.txHash ?? undefined,
                        }
                        setPool(processedLocalPool)
                    } else {
                        console.error(
                            `Pool with id ${id} not found on chain ${selectedChainId} or in local storage. Redirecting. `,
                        )
                        router.push('/')
                    }
                }
            } catch (error) {
                console.error(`Error fetching pool data for id ${id} on chain ${selectedChainId}:`, error)
                router.push('/') // Redirect on error
            }
            setLoading(false)
        }

        if (id && selectedChainId) {
            void fetchPoolData() // Explicitly ignore promise for useEffect
        }
    }, [id, router, selectedChainId])

    if (loading) {
        return (
            <div className='flex min-h-screen items-center justify-center bg-white'>
                <div className='h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500' />
            </div>
        )
    }

    if (!pool) {
        return (
            <div className='flex min-h-screen items-center justify-center bg-white text-gray-800'>
                <div className='text-center'>
                    <h1 className='mb-2 text-2xl font-bold'>Pool Not Found</h1>
                    <p className='mb-4'>The pool you are looking for does not exist.</p>
                    <button onClick={() => router.push('/')} className='rounded-lg bg-blue-500 px-4 py-2 text-white'>
                        Return Home
                    </button>
                </div>
            </div>
        )
    }

    return <PoolDashboard pool={pool} />
}
