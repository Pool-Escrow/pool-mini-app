'use client'

import { RegistrationTimeStep } from '@/components/steps/RegistrationTimeStep'
import { useState } from 'react'

export default function TestRegistrationPage() {
    const [registrationData, setRegistrationData] = useState<{
        registrationStart: Date
        registrationEnd: Date
        registrationEnabled: boolean
    } | null>(null)

    const handleNext = (data: { registrationStart: Date; registrationEnd: Date; registrationEnabled: boolean }) => {
        setRegistrationData(data)
    }

    return (
        <div className='min-h-screen bg-gray-50 py-12'>
            <div className='mx-auto max-w-4xl overflow-hidden rounded-xl bg-white shadow-md'>
                <div className='p-6'>
                    <h1 className='mb-6 text-center text-2xl font-bold'>Registration Time Component Test</h1>

                    <RegistrationTimeStep
                        initialData={{
                            registrationStart: new Date('2024-11-25T16:45:00Z'),
                            registrationEnd: new Date('2024-11-25T17:45:00Z'),
                        }}
                        onNext={data => handleNext({ ...data, registrationEnabled: true })}
                    />

                    {registrationData && (
                        <div className='mt-8 rounded-lg border border-gray-200 p-4'>
                            <h2 className='mb-4 text-xl font-semibold'>Submitted Data:</h2>
                            <pre className='overflow-auto rounded bg-gray-100 p-4'>
                                {JSON.stringify(registrationData, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
