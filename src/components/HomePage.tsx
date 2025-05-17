'use client'

import { Balance } from '@/components/Balance'
import { CreatePoolWizard, TOTAL_STEPS_WIZARD, type StepData } from '@/components/CreatePoolWizard'
import type { Giveaway } from '@/components/GiveawayWizard'
import {
    TOTAL_STEPS_WIZARD as GIVEAWAY_TOTAL_STEPS,
    GiveawayWizard,
    type GiveawayStepData,
} from '@/components/GiveawayWizard'
import { PoolList } from '@/components/PoolList'
import { ProgressBar } from '@/components/ProgressBar'
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer'
import { WelcomeScreen } from '@/components/WelcomeScreen'
import { useUserRole } from '@/contexts/UserRoleContext'
import { getGiveaways, createGiveaway as saveGiveaway } from '@/lib/giveawayStorage'
import { getPools, createPool as savePool, updatePool } from '@/lib/poolStorage'
import type { Pool } from '@/types/pool'
import { formatISO, isDate, isValid } from 'date-fns'
import { useCallback, useEffect, useState } from 'react'

// Define types for API responses
interface ApiSuccessResponse {
    message: string
    txHash?: string // Optional, as it might not always be returned or needed by client
    tempPoolId?: string // Response from notify-creation endpoint
}

interface ApiErrorResponse {
    message: string
    error?: string
}

export function HomePage() {
    // Get user role
    const { isAdmin } = useUserRole()

    // State for pools and giveaways
    const [pools, setPools] = useState<Pool[]>([])
    const [giveaways, setGiveaways] = useState<Giveaway[]>([])
    const [isSubmittingPool, setIsSubmittingPool] = useState(false)
    const [processedTxHashes, setProcessedTxHashes] = useState<Set<string>>(new Set())

    // Pool Wizard States
    const [isPoolDrawerOpen, setIsPoolDrawerOpen] = useState(false)
    const [currentPoolWizardStep, setCurrentPoolWizardStep] = useState(1)
    const [wizardPoolData, setWizardPoolData] = useState<Partial<Pool>>({})

    // Giveaway Wizard States
    const [isGiveawayDrawerOpen, setIsGiveawayDrawerOpen] = useState(false)
    const [currentGiveawayWizardStep, setCurrentGiveawayWizardStep] = useState(1)
    const [wizardGiveawayData, setWizardGiveawayData] = useState<Partial<Giveaway>>({})

    // Load pools on component mount
    useEffect(() => {
        // Initialize pools storage to create empty storage if none exists
        void import('@/lib/poolStorage').then(({ initializePoolsStorage }) => {
            initializePoolsStorage()
            const storedPools = getPools()
            setPools(storedPools)

            // Initialize processed transaction hashes from existing pools
            const txHashes = new Set<string>()
            storedPools.forEach(pool => {
                if (pool.txHash) {
                    txHashes.add(pool.txHash)
                }
            })
            setProcessedTxHashes(txHashes)
        })

        // Load giveaways
        const storedGiveaways = getGiveaways()
        setGiveaways(storedGiveaways)
    }, [])

    // Pool Wizard Handlers
    const handlePoolWizardStepChange = (step: number, data?: StepData) => {
        setCurrentPoolWizardStep(step)
        if (data) {
            setWizardPoolData(prevData => {
                const stepSpecificUpdate = { ...data } as Partial<Pool>

                // Convert Date objects to ISO strings for specific fields using date-fns
                if (
                    stepSpecificUpdate.startTime &&
                    isDate(stepSpecificUpdate.startTime) &&
                    isValid(stepSpecificUpdate.startTime)
                ) {
                    stepSpecificUpdate.startTime = Number(
                        new Date(formatISO(stepSpecificUpdate.startTime as Date)).getTime(),
                    )
                }
                if (
                    stepSpecificUpdate.endTime &&
                    isDate(stepSpecificUpdate.endTime) &&
                    isValid(stepSpecificUpdate.endTime)
                ) {
                    stepSpecificUpdate.endTime = Number(
                        new Date(formatISO(stepSpecificUpdate.endTime as Date)).getTime(),
                    )
                }

                // Other fields from StepData (like name, description, depositAmount, tokenAddress, tokenDecimals etc.)
                // are assumed to be in the correct format (string, number) by this point or are handled by their respective steps.
                // The PoolConfigStep was updated to provide tokenAddress and tokenDecimals directly.

                return { ...prevData, ...stepSpecificUpdate }
            })
        }
    }

    const handlePoolWizardComplete = useCallback(
        async (completedPoolData: Omit<Pool, 'id' | 'createdAt'> & { txHash: string }) => {
            if (isSubmittingPool) {
                console.warn('[HomePage] Pool submission already in progress. Ignoring duplicate call.')
                return
            }

            // Check if we've already processed this transaction
            if (processedTxHashes.has(completedPoolData.txHash)) {
                console.warn('[HomePage] Pool with this transaction hash already exists. Ignoring duplicate.')
                setIsPoolDrawerOpen(false)
                return
            }

            setIsSubmittingPool(true)

            console.log('[HomePage] Pool creation on-chain successful, txHash:', completedPoolData.txHash)
            console.log('[HomePage] Full completed pool data from wizard:', completedPoolData)

            try {
                const response = await fetch('/api/pools/notify-creation', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        txHash: completedPoolData.txHash,
                        poolData: completedPoolData,
                    }),
                })

                if (!response.ok) {
                    const errorResult = (await response.json()) as ApiErrorResponse
                    console.error(
                        '[HomePage] API Error notifying pool creation:',
                        errorResult.message,
                        errorResult.error,
                    )
                } else {
                    const successResult = (await response.json()) as ApiSuccessResponse
                    console.log('[HomePage] API Success notifying pool creation:', successResult.message)

                    // Store the tempPoolId if it exists
                    if (successResult.tempPoolId) {
                        completedPoolData.tempPoolId = successResult.tempPoolId
                    }
                }
            } catch (error) {
                console.error('[HomePage] Network or other error notifying pool creation:', error)
            }

            // Update processed transaction hashes
            setProcessedTxHashes(prev => {
                const newSet = new Set(prev)
                newSet.add(completedPoolData.txHash)
                return newSet
            })

            // Create or update the pool in local storage
            let newPool: Pool
            const existingPool = pools.find(p => p.txHash === completedPoolData.txHash)

            if (existingPool) {
                // If pool exists, update it
                console.log('[HomePage] Updating existing pool with txHash:', completedPoolData.txHash)
                newPool =
                    updatePool(existingPool.id, completedPoolData as Partial<Omit<Pool, 'id' | 'createdAt'>>) ??
                    existingPool
            } else {
                // Create new pool
                console.log('[HomePage] Creating new pool with txHash:', completedPoolData.txHash)
                newPool = savePool({
                    ...completedPoolData,
                    txHash: completedPoolData.txHash, // Ensure txHash is saved
                } as Omit<Pool, 'id' | 'createdAt'>)
            }

            console.log('[HomePage] New/updated pool saved locally:', newPool)

            setPools(prevPools => {
                // Remove any existing pool with the same txHash (should not happen now with our checks)
                const filteredPools = prevPools.filter(p => p.txHash !== completedPoolData.txHash)
                return [...filteredPools, newPool]
            })

            setIsPoolDrawerOpen(false)
            setIsSubmittingPool(false)
        },
        [isSubmittingPool, setIsPoolDrawerOpen, pools, processedTxHashes],
    )

    const openPoolDrawerAndResetState = () => {
        setCurrentPoolWizardStep(1)
        setWizardPoolData({})
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur()
        }
        requestAnimationFrame(() => {
            setIsPoolDrawerOpen(true)
        })
    }

    // Giveaway Wizard Handlers
    const handleGiveawayWizardStepChange = (step: number, data?: GiveawayStepData) => {
        setCurrentGiveawayWizardStep(step)
        if (data) {
            setWizardGiveawayData(prevData => ({ ...prevData, ...data }))
        }
    }

    const handleGiveawayWizardComplete = useCallback(
        (completedGiveawayData: Omit<Giveaway, 'id' | 'createdAt'>) => {
            const newGiveaway = saveGiveaway(completedGiveawayData)
            console.log('New giveaway created:', newGiveaway)
            setIsGiveawayDrawerOpen(false)

            // Refresh giveaways list
            setGiveaways(getGiveaways())
        },
        [setIsGiveawayDrawerOpen, setGiveaways],
    )

    const openGiveawayDrawerAndResetState = () => {
        setCurrentGiveawayWizardStep(1)
        setWizardGiveawayData({})
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur()
        }
        requestAnimationFrame(() => {
            setIsGiveawayDrawerOpen(true)
        })
    }

    return (
        <div className='flex min-h-screen flex-col bg-gray-50'>
            {/* Balance Section - Blue Background */}
            <div className='bg-[#4C6FFF]'>
                <Balance />
            </div>

            {/* Content Area - Either Pool List (admin) or Welcome Screen (regular user) */}
            <div className='flex-1'>
                {isAdmin ? (
                    pools.length > 0 || giveaways.length > 0 ? (
                        <PoolList pools={pools} giveaways={giveaways} />
                    ) : (
                        <div className='py-8 text-center text-gray-500'>
                            <p className='mb-2'>No pools created yet</p>
                            <p className='text-sm'>Use the buttons below to create your first pool event or giveaway</p>
                        </div>
                    )
                ) : (
                    <WelcomeScreen />
                )}
            </div>

            {/* Admin Action Buttons or Empty Space for Regular Users */}
            <div className='flex flex-col gap-4 p-4'>
                {isAdmin && (
                    <>
                        {/* Pool Creation Button & Drawer */}
                        <Drawer open={isPoolDrawerOpen} onOpenChange={setIsPoolDrawerOpen}>
                            <DrawerTrigger
                                className='w-full rounded-xl bg-[#4C6FFF] py-4 text-base font-medium text-white hover:bg-[#4C6FFF]/90'
                                onClick={openPoolDrawerAndResetState}>
                                Create an Event
                            </DrawerTrigger>
                            <DrawerContent className='min-h-11/12'>
                                <DrawerHeader>
                                    <DrawerTitle>Create Event Pool</DrawerTitle>
                                    <DrawerDescription />
                                </DrawerHeader>
                                <ProgressBar currentStep={currentPoolWizardStep} totalSteps={TOTAL_STEPS_WIZARD} />
                                <CreatePoolWizard
                                    currentStep={currentPoolWizardStep}
                                    poolData={wizardPoolData}
                                    onStepChange={handlePoolWizardStepChange}
                                    onComplete={data => void handlePoolWizardComplete(data)}
                                />
                            </DrawerContent>
                        </Drawer>

                        {/* Giveaway Creation Button & Drawer */}
                        <Drawer open={isGiveawayDrawerOpen} onOpenChange={setIsGiveawayDrawerOpen}>
                            <DrawerTrigger
                                className='w-full rounded-xl bg-[#4C6FFF] py-4 text-base font-medium text-white hover:bg-[#4C6FFF]/90'
                                onClick={openGiveawayDrawerAndResetState}>
                                Create a Giveaway
                            </DrawerTrigger>
                            <DrawerContent className='min-h-11/12'>
                                <DrawerHeader>
                                    <DrawerTitle>Create Giveaway</DrawerTitle>
                                    <DrawerDescription />
                                </DrawerHeader>
                                <ProgressBar
                                    currentStep={currentGiveawayWizardStep}
                                    totalSteps={GIVEAWAY_TOTAL_STEPS}
                                />
                                <GiveawayWizard
                                    currentStep={currentGiveawayWizardStep}
                                    giveawayData={wizardGiveawayData}
                                    onStepChange={handleGiveawayWizardStepChange}
                                    onComplete={handleGiveawayWizardComplete}
                                />
                            </DrawerContent>
                        </Drawer>
                    </>
                )}
            </div>
        </div>
    )
}
