'use client'

import { useState } from 'react'

interface RegistrationTimeStepProps {
    initialData?: {
        registrationStart?: string
        registrationEnd?: string
        registrationEnabled?: boolean
    }
    onNext: (data: { registrationStart: string; registrationEnd: string; registrationEnabled: boolean }) => void
    onBack?: () => void
}

export function RegistrationTimeStep({ initialData, onNext, onBack }: RegistrationTimeStepProps) {
    const [registrationEnabled, setRegistrationEnabled] = useState(
        initialData?.registrationEnabled !== undefined ? initialData.registrationEnabled : true,
    )

    const [startDate, setStartDate] = useState(
        initialData?.registrationStart
            ? new Date(initialData.registrationStart).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
    )

    const [startTime, setStartTime] = useState(
        initialData?.registrationStart ? formatTime(new Date(initialData.registrationStart)) : '4:45PM',
    )

    const [endDate, setEndDate] = useState(
        initialData?.registrationEnd
            ? new Date(initialData.registrationEnd).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
    )

    const [endTime, setEndTime] = useState(
        initialData?.registrationEnd ? formatTime(new Date(initialData.registrationEnd)) : '5:45PM',
    )

    function formatTime(date: Date): string {
        return date
            .toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            })
            .replace(' ', '')
    }

    const handleSubmit = () => {
        // Create date objects from the inputs
        const startDateTime = new Date(`${startDate}T12:00:00`)
        const [startHours, startMinutes] = parseTimeString(startTime)
        startDateTime.setHours(startHours)
        startDateTime.setMinutes(startMinutes)

        const endDateTime = new Date(`${endDate}T12:00:00`)
        const [endHours, endMinutes] = parseTimeString(endTime)
        endDateTime.setHours(endHours)
        endDateTime.setMinutes(endMinutes)

        onNext({
            registrationStart: startDateTime.toISOString(),
            registrationEnd: endDateTime.toISOString(),
            registrationEnabled,
        })
    }

    // Parse a time string like "4:45PM" into hours and minutes
    function parseTimeString(timeStr: string): [number, number] {
        const isPM = timeStr.toLowerCase().includes('pm')
        const isAM = timeStr.toLowerCase().includes('am')

        // Remove the AM/PM and split by colon
        const timePart = timeStr.toLowerCase().replace('am', '').replace('pm', '').trim()

        const [initialHours, minutes] = timePart.split(':').map(n => parseInt(n, 10))

        let adjustedHours = initialHours
        if (isPM && initialHours !== 12) {
            adjustedHours = initialHours + 12
        } else if (isAM && initialHours === 12) {
            // Midnight case
            adjustedHours = 0
        }

        return [adjustedHours, minutes]
    }

    return (
        <div className='mx-auto flex w-full max-w-md flex-col items-center p-4 sm:p-8'>
            <h2 className='mb-1 text-center text-2xl font-semibold text-gray-900'>Registration Time</h2>
            <p className='mb-6 text-center text-sm text-gray-500'>Participants need to register during this window</p>

            <div className='mb-8 w-full'>
                <div className='mb-6 flex items-center justify-between'>
                    <label htmlFor='registration-toggle' className='font-medium text-gray-800'>
                        Registration Time
                    </label>
                    <label className='inline-flex cursor-pointer items-center'>
                        <input
                            type='checkbox'
                            id='registration-toggle'
                            className='hidden'
                            checked={registrationEnabled}
                            onChange={() => setRegistrationEnabled(!registrationEnabled)}
                        />
                        <div
                            className={`relative h-6 w-12 rounded-full transition-colors ${registrationEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}>
                            <div
                                className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${registrationEnabled ? 'translate-x-6 transform' : ''}`}></div>
                        </div>
                    </label>
                </div>

                {registrationEnabled && (
                    <>
                        {/* Registration Start */}
                        <div className='mb-6'>
                            <h3 className='mb-2 font-medium text-gray-800'>Registration Start</h3>
                            <div className='flex items-center gap-3'>
                                <div className='flex-1'>
                                    <input
                                        type='date'
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                        className='w-full rounded-lg border border-gray-300 p-3 text-gray-800 focus:border-blue-500 focus:ring-blue-500'
                                    />
                                </div>
                                <div className='flex-1'>
                                    <select
                                        className='w-full appearance-none rounded-lg bg-blue-500 px-4 py-3 text-center text-white'
                                        value={startTime}
                                        onChange={e => setStartTime(e.target.value)}>
                                        <option value='8:00AM'>8:00AM</option>
                                        <option value='8:30AM'>8:30AM</option>
                                        <option value='9:00AM'>9:00AM</option>
                                        <option value='9:30AM'>9:30AM</option>
                                        <option value='10:00AM'>10:00AM</option>
                                        <option value='10:30AM'>10:30AM</option>
                                        <option value='11:00AM'>11:00AM</option>
                                        <option value='11:30AM'>11:30AM</option>
                                        <option value='12:00PM'>12:00PM</option>
                                        <option value='12:30PM'>12:30PM</option>
                                        <option value='1:00PM'>1:00PM</option>
                                        <option value='1:30PM'>1:30PM</option>
                                        <option value='2:00PM'>2:00PM</option>
                                        <option value='2:30PM'>2:30PM</option>
                                        <option value='3:00PM'>3:00PM</option>
                                        <option value='3:30PM'>3:30PM</option>
                                        <option value='4:00PM'>4:00PM</option>
                                        <option value='4:30PM'>4:30PM</option>
                                        <option value='4:45PM'>4:45PM</option>
                                        <option value='5:00PM'>5:00PM</option>
                                        <option value='5:30PM'>5:30PM</option>
                                        <option value='6:00PM'>6:00PM</option>
                                        <option value='6:30PM'>6:30PM</option>
                                        <option value='7:00PM'>7:00PM</option>
                                        <option value='7:30PM'>7:30PM</option>
                                        <option value='8:00PM'>8:00PM</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Registration End */}
                        <div className='mb-6'>
                            <h3 className='mb-2 font-medium text-gray-800'>Registration End</h3>
                            <div className='flex items-center gap-3'>
                                <div className='flex-1'>
                                    <input
                                        type='date'
                                        value={endDate}
                                        onChange={e => setEndDate(e.target.value)}
                                        className='w-full rounded-lg border border-gray-300 p-3 text-gray-800 focus:border-blue-500 focus:ring-blue-500'
                                    />
                                </div>
                                <div className='flex-1'>
                                    <select
                                        className='w-full appearance-none rounded-lg bg-blue-500 px-4 py-3 text-center text-white'
                                        value={endTime}
                                        onChange={e => setEndTime(e.target.value)}>
                                        <option value='8:00AM'>8:00AM</option>
                                        <option value='8:30AM'>8:30AM</option>
                                        <option value='9:00AM'>9:00AM</option>
                                        <option value='9:30AM'>9:30AM</option>
                                        <option value='10:00AM'>10:00AM</option>
                                        <option value='10:30AM'>10:30AM</option>
                                        <option value='11:00AM'>11:00AM</option>
                                        <option value='11:30AM'>11:30AM</option>
                                        <option value='12:00PM'>12:00PM</option>
                                        <option value='12:30PM'>12:30PM</option>
                                        <option value='1:00PM'>1:00PM</option>
                                        <option value='1:30PM'>1:30PM</option>
                                        <option value='2:00PM'>2:00PM</option>
                                        <option value='2:30PM'>2:30PM</option>
                                        <option value='3:00PM'>3:00PM</option>
                                        <option value='3:30PM'>3:30PM</option>
                                        <option value='4:00PM'>4:00PM</option>
                                        <option value='4:30PM'>4:30PM</option>
                                        <option value='5:00PM'>5:00PM</option>
                                        <option value='5:30PM'>5:30PM</option>
                                        <option value='5:45PM'>5:45PM</option>
                                        <option value='6:00PM'>6:00PM</option>
                                        <option value='6:30PM'>6:30PM</option>
                                        <option value='7:00PM'>7:00PM</option>
                                        <option value='7:30PM'>7:30PM</option>
                                        <option value='8:00PM'>8:00PM</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className='mt-8 flex w-full flex-col gap-4 sm:flex-row'>
                {onBack && (
                    <button
                        onClick={onBack}
                        className='w-full rounded-lg bg-gray-200 px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-300'>
                        Back
                    </button>
                )}
                <button
                    onClick={handleSubmit}
                    className='w-full rounded-lg bg-blue-500 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-600'>
                    Continue
                </button>
            </div>
        </div>
    )
}
