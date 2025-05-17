'use client'

import { Button } from '@/components/DemoComponents'
import { Modal } from '@/components/Modal'
import type { Pool } from '@/types/pool'

interface RegistrationModalProps {
    isOpen: boolean
    onCloseAction: () => void
    pool: Pool
    onRegisterAction: () => void
}

export function RegistrationModal({ isOpen, onCloseAction, pool, onRegisterAction }: RegistrationModalProps) {
    const handleConfirmRegistration = () => {
        onRegisterAction()
        onCloseAction()
    }

    const renderBuyInConfirmation = () => {
        if (pool.depositAmountPerPerson === 0) {
            return (
                <div className='mb-4 text-center'>
                    <p className='text-gray-700'>This event is free to join!</p>
                </div>
            )
        }

        return (
            <div className='mb-4 text-center'>
                <p className='mb-2 text-gray-700'>This event has a buy-in amount of:</p>
                <p className='text-2xl font-bold text-gray-900'>${pool.depositAmountPerPerson} USDC</p>
                <p className='mt-1 text-sm text-gray-500'>
                    By registering, you agree to pay this amount to participate.
                </p>
            </div>
        )
    }

    return (
        <Modal isOpen={isOpen} onClose={onCloseAction}>
            <div className='mx-auto w-full max-w-md overflow-hidden rounded-lg bg-white'>
                <div className='border-b border-gray-200 p-4'>
                    <h2 className='text-xl font-bold text-gray-900'>Join {pool.name}</h2>
                </div>

                <div className='p-6'>
                    {renderBuyInConfirmation()}

                    <div className='mb-6'>
                        <h3 className='mb-2 font-medium text-gray-800'>About this event:</h3>
                        <p className='text-gray-600'>{pool.description}</p>
                    </div>

                    <div className='flex space-x-3'>
                        <Button
                            className='flex-1 rounded-lg bg-gray-200 py-2 font-medium text-gray-800 hover:bg-gray-300'
                            onClick={onCloseAction}>
                            Cancel
                        </Button>
                        <Button
                            className='flex-1 rounded-lg bg-blue-500 py-2 font-medium text-white hover:bg-blue-600'
                            onClick={handleConfirmRegistration}>
                            Confirm
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    )
}
