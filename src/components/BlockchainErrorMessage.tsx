import React from 'react'
import { BlockchainError, getBlockchainErrorMessageProps } from '../utils/error-handling'

interface BlockchainErrorMessageProps {
    error: BlockchainError | null | undefined // Allow null or undefined for error prop
    className?: string
}

export const BlockchainErrorMessage: React.FC<BlockchainErrorMessageProps> = ({ error, className = '' }) => {
    if (!error) {
        return null // Don't render anything if there's no error
    }

    const { message, suggestion } = getBlockchainErrorMessageProps(error)

    return (
        <div className={`rounded-md border border-red-200 bg-red-50 p-3 ${className}`}>
            <h4 className='font-medium text-red-700'>{message}</h4>
            <p className='text-sm text-red-600'>{suggestion}</p>
        </div>
    )
}
