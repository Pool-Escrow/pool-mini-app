import { Button } from '@/components/DemoComponents'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'

interface Participant {
    id: string
    name: string
    address: string
    status: 'registered' | 'checked_in'
    avatar?: string
    payoutAmount?: number
}

interface PayoutFormProps {
    participants: Participant[]
    totalAmount: number
    onSubmit: (participants: Participant[]) => void
    onCancel: () => void
}

export function PayoutForm({ participants, totalAmount, onSubmit, onCancel }: PayoutFormProps) {
    const [payoutParticipants, setPayoutParticipants] = useState<Participant[]>([])
    const [remainingAmount, setRemainingAmount] = useState(totalAmount)
    const [isEqualDistribution, setIsEqualDistribution] = useState(true)

    const handleEqualDistribution = useCallback(() => {
        const checkedInCount = payoutParticipants.length
        if (checkedInCount === 0) return

        const equalAmount = +(totalAmount / checkedInCount).toFixed(2)
        const newPayoutParticipants = payoutParticipants.map(p => ({
            ...p,
            payoutAmount: equalAmount,
        }))

        setPayoutParticipants(newPayoutParticipants)
        setIsEqualDistribution(true)
        setRemainingAmount(0)
    }, [payoutParticipants, totalAmount])

    // Only include checked-in participants for distribution
    useEffect(() => {
        const checkedInParticipants = participants
            .filter(p => p.status === 'checked_in')
            .map(p => ({
                ...p,
                payoutAmount: 0,
            }))

        setPayoutParticipants(checkedInParticipants)

        // If there are checked-in participants, distribute equally by default
        if (checkedInParticipants.length > 0 && isEqualDistribution) {
            handleEqualDistribution()
        }
    }, [handleEqualDistribution, isEqualDistribution, participants, totalAmount])

    const handlePayoutChange = (id: string, value: string) => {
        // Parse input and validate it's a number with up to 2 decimal places
        const amount = value === '' ? 0 : parseFloat(parseFloat(value).toFixed(2))

        const updatedParticipants = payoutParticipants.map(p => (p.id === id ? { ...p, payoutAmount: amount } : p))

        setPayoutParticipants(updatedParticipants)
        setIsEqualDistribution(false)

        // Calculate remaining amount
        const totalPayout = updatedParticipants.reduce((sum, p) => sum + (p.payoutAmount ?? 0), 0)
        setRemainingAmount(+(totalAmount - totalPayout).toFixed(2))
    }

    const handleSubmit = () => {
        onSubmit(payoutParticipants)
    }

    const getTotalPayoutAmount = () => {
        return payoutParticipants.reduce((sum, p) => sum + (p.payoutAmount ?? 0), 0)
    }

    const isFormValid = () => {
        const totalPayout = getTotalPayoutAmount()
        return totalPayout > 0 && Math.abs(totalPayout - totalAmount) < 0.01
    }

    return (
        <div className='mx-auto w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg'>
            <h2 className='mb-4 text-xl font-bold text-gray-900'>Distribute Prize</h2>
            <p className='mb-4 text-sm text-gray-500'>Total amount to distribute: ${totalAmount.toFixed(2)}</p>

            {payoutParticipants.length === 0 ? (
                <div className='mb-4 rounded-md border border-yellow-200 bg-yellow-50 p-4 text-center'>
                    <p className='font-medium text-yellow-700'>
                        No checked-in participants available for prize distribution.
                    </p>
                </div>
            ) : (
                <>
                    <div className='mb-4 flex items-center justify-between'>
                        <span className='text-sm font-medium text-gray-700'>
                            {payoutParticipants.length} participant{payoutParticipants.length !== 1 ? 's' : ''} eligible
                            for payout
                        </span>
                        <Button
                            size='sm'
                            variant='outline'
                            onClick={handleEqualDistribution}
                            className='border-blue-500 text-blue-500'>
                            Distribute Equally
                        </Button>
                    </div>

                    <div className='mb-6 overflow-hidden rounded-md border'>
                        <table className='min-w-full divide-y divide-gray-200'>
                            <thead className='bg-gray-50'>
                                <tr>
                                    <th
                                        scope='col'
                                        className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
                                        Participant
                                    </th>
                                    <th
                                        scope='col'
                                        className='px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase'>
                                        Amount ($)
                                    </th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-200 bg-white'>
                                {payoutParticipants.map(participant => (
                                    <tr key={participant.id}>
                                        <td className='px-6 py-4 whitespace-nowrap'>
                                            <div className='flex items-center'>
                                                <div className='relative mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-gray-500'>
                                                    {participant.avatar ? (
                                                        <Image
                                                            fill
                                                            src={participant.avatar}
                                                            alt={participant.name || participant.address}
                                                            className='h-full w-full rounded-full object-cover'
                                                        />
                                                    ) : (
                                                        <svg
                                                            className='h-4 w-4'
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
                                                <div>
                                                    <div className='text-sm font-medium text-gray-900'>
                                                        {participant.name || participant.address}
                                                    </div>
                                                    {participant.name && (
                                                        <div className='text-xs text-gray-500'>
                                                            {participant.address}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className='px-6 py-4 text-right whitespace-nowrap'>
                                            <div className='relative'>
                                                <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                                                    <span className='text-gray-500'>$</span>
                                                </div>
                                                <input
                                                    type='text'
                                                    value={participant.payoutAmount?.toString() ?? ''}
                                                    onChange={e => handlePayoutChange(participant.id, e.target.value)}
                                                    className='block w-32 rounded-md border border-gray-300 py-2 pr-3 pl-8 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
                                                    placeholder='0.00'
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className='mb-6 flex items-center justify-between rounded-md bg-gray-50 p-4'>
                        <span className='font-medium text-gray-700'>Remaining:</span>
                        <span className={`font-medium ${remainingAmount === 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ${remainingAmount.toFixed(2)}
                        </span>
                    </div>
                </>
            )}

            <div className='flex justify-end space-x-4'>
                <Button variant='outline' onClick={onCancel}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={!isFormValid() || payoutParticipants.length === 0}
                    className='bg-green-500 text-white hover:bg-green-600'>
                    Confirm Distribution
                </Button>
            </div>
        </div>
    )
}
