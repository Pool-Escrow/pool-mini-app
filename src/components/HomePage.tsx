'use client'

import { Balance } from '@/components/Balance'
import { CreatePoolWizard, TOTAL_STEPS_WIZARD, type StepData } from '@/components/CreatePoolWizard'
import {
    Giveaway,
    TOTAL_STEPS_WIZARD as GIVEAWAY_TOTAL_STEPS,
    GiveawayWizard,
    type GiveawayStepData,
} from '@/components/GiveawayWizard'
import { PoolList } from '@/components/PoolList'
import { ProgressBar } from '@/components/ProgressBar'
import { WelcomeScreen } from '@/components/WelcomeScreen'
import { useUserRole } from '@/components/providers'
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { getGiveaways, createGiveaway as saveGiveaway } from '@/lib/giveawayStorage'
import { getPools, createPool as savePool } from '@/lib/poolStorage'
import { Pool } from '@/types/pool'
import { useEffect, useState } from 'react'
import { Button } from './ui/button'

export function HomePage() {
    // Get user role
    const { isAdmin } = useUserRole()

    // State for pools and giveaways
    const [pools, setPools] = useState<Pool[]>([])
    const [giveaways, setGiveaways] = useState<Giveaway[]>([])

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
        import('@/lib/poolStorage').then(({ initializePoolsStorage }) => {
            initializePoolsStorage()
            const storedPools = getPools()
            setPools(storedPools)
        })

        // Load giveaways
        const storedGiveaways = getGiveaways()
        setGiveaways(storedGiveaways)
    }, [])

    // Pool Wizard Handlers
    const handlePoolWizardStepChange = (step: number, data?: StepData) => {
        setCurrentPoolWizardStep(step)
        if (data) {
            setWizardPoolData(prevData => ({ ...prevData, ...data }))
        }
    }

    const handlePoolWizardComplete = (completedPoolData: Omit<Pool, 'id' | 'createdAt'>) => {
        const newPool = savePool(completedPoolData)
        console.log('New pool created:', newPool)
        setIsPoolDrawerOpen(false)
        // Refresh pools list
        setPools(getPools())
    }

    const openPoolDrawerAndResetState = () => {
        setCurrentPoolWizardStep(1)
        setWizardPoolData({})
        setIsPoolDrawerOpen(true)
    }

    // Giveaway Wizard Handlers
    const handleGiveawayWizardStepChange = (step: number, data?: GiveawayStepData) => {
        setCurrentGiveawayWizardStep(step)
        if (data) {
            setWizardGiveawayData(prevData => ({ ...prevData, ...data }))
        }
    }

    const handleGiveawayWizardComplete = (completedGiveawayData: Omit<Giveaway, 'id' | 'createdAt'>) => {
        const newGiveaway = saveGiveaway(completedGiveawayData)
        console.log('New giveaway created:', newGiveaway)
        setIsGiveawayDrawerOpen(false)

        // Refresh giveaways list
        setGiveaways(getGiveaways())
    }

    const openGiveawayDrawerAndResetState = () => {
        setCurrentGiveawayWizardStep(1)
        setWizardGiveawayData({})
        setIsGiveawayDrawerOpen(true)
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
            <div className='space-y-4 px-4 py-4'>
                {isAdmin && (
                    <>
                        {/* Pool Creation Button & Drawer */}
                        <Drawer open={isPoolDrawerOpen} onOpenChange={setIsPoolDrawerOpen}>
                            <DrawerTrigger asChild>
                                <Button
                                    variant='default'
                                    className='w-full rounded-xl bg-[#4C6FFF] py-4 font-medium text-white hover:bg-[#4C6FFF]/90'
                                    onClick={openPoolDrawerAndResetState}>
                                    Create an Event
                                </Button>
                            </DrawerTrigger>
                            <DrawerContent className='flex h-full flex-col bg-white'>
                                <DrawerHeader className='flex items-center justify-between border-b border-gray-200 p-4 text-black'>
                                    <DrawerTitle className='text-sm font-medium text-gray-500'>
                                        Create Event Pool
                                    </DrawerTitle>
                                    <DrawerClose asChild>
                                        <button className='text-gray-400 hover:text-gray-600' aria-label='Close wizard'>
                                            <svg
                                                className='h-6 w-6'
                                                fill='none'
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth='2'
                                                viewBox='0 0 24 24'
                                                stroke='currentColor'>
                                                <path d='M6 18L18 6M6 6l12 12'></path>
                                            </svg>
                                        </button>
                                    </DrawerClose>
                                </DrawerHeader>
                                <ProgressBar currentStep={currentPoolWizardStep} totalSteps={TOTAL_STEPS_WIZARD} />
                                <CreatePoolWizard
                                    currentStep={currentPoolWizardStep}
                                    poolData={wizardPoolData}
                                    onStepChange={handlePoolWizardStepChange}
                                    onComplete={handlePoolWizardComplete}
                                />
                            </DrawerContent>
                        </Drawer>

                        {/* Giveaway Creation Button & Drawer */}
                        <Drawer open={isGiveawayDrawerOpen} onOpenChange={setIsGiveawayDrawerOpen}>
                            <DrawerTrigger asChild>
                                <button
                                    className='w-full rounded-xl bg-[#4C6FFF] py-4 font-medium text-white hover:bg-[#4C6FFF]/90'
                                    onClick={openGiveawayDrawerAndResetState}>
                                    Create a Giveaway
                                </button>
                            </DrawerTrigger>
                            <DrawerContent className='flex h-full flex-col bg-white'>
                                <DrawerHeader className='flex items-center justify-between border-b border-gray-200 p-4 text-black'>
                                    <DrawerTitle className='text-sm font-medium text-gray-500'>
                                        Create Giveaway
                                    </DrawerTitle>
                                    <DrawerClose asChild>
                                        <button className='text-gray-400 hover:text-gray-600' aria-label='Close wizard'>
                                            <svg
                                                className='h-6 w-6'
                                                fill='none'
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth='2'
                                                viewBox='0 0 24 24'
                                                stroke='currentColor'>
                                                <path d='M6 18L18 6M6 6l12 12'></path>
                                            </svg>
                                        </button>
                                    </DrawerClose>
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
