'use client'

import type { Giveaway} from '@/components/GiveawayWizard';
import { GiveawayWizard } from '@/components/GiveawayWizard'
import { useState } from 'react'

export default function TestGiveawayPage() {
    const [currentStep, setCurrentStep] = useState(1)
    const [giveawayData, setGiveawayData] = useState<Partial<Giveaway>>({})
    const [completedData, setCompletedData] = useState<Omit<Giveaway, 'id' | 'createdAt'> | null>(null)

    const handleStepChange = (step: number, data?: Partial<Giveaway>) => {
        setCurrentStep(step)
        if (data) {
            setGiveawayData(prev => ({ ...prev, ...data }))
        }
    }

    const handleComplete = (data: Omit<Giveaway, 'id' | 'createdAt'>) => {
        setCompletedData(data)
        // Here you would normally save the giveaway
    }

    return (
        <div className='min-h-screen bg-gray-50 py-12'>
            <div className='mx-auto max-w-4xl overflow-hidden rounded-xl bg-white shadow-md'>
                <div className='p-6'>
                    <h1 className='mb-6 text-center text-2xl font-bold'>Test Giveaway Flow</h1>

                    <div className='mb-4'>
                        <div className='h-2.5 w-full rounded-full bg-gray-200'>
                            <div
                                className='h-2.5 rounded-full bg-blue-600'
                                style={{ width: `${(currentStep / 2) * 100}%` }} />
                        </div>
                        <p className='mt-2 text-center text-sm text-gray-500'>Step {currentStep} of 2</p>
                    </div>

                    <GiveawayWizard
                        currentStep={currentStep}
                        giveawayData={giveawayData}
                        onStepChange={handleStepChange}
                        onComplete={handleComplete}
                    />

                    {completedData && (
                        <div className='mt-8 rounded-lg border border-gray-200 p-4'>
                            <h2 className='mb-4 text-xl font-semibold'>Completed Giveaway Data:</h2>
                            <pre className='overflow-auto rounded bg-gray-100 p-4'>
                                {JSON.stringify(completedData, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
