import React from 'react'
import { type BlockchainErrorMessageProps as ErrorProps } from '../utils/error-handling' // Renamed to avoid conflict

interface BlockchainErrorMessageProps {
    error: ErrorProps | null | undefined // Use the imported and renamed type
    className?: string
}

export const BlockchainErrorMessage: React.FC<BlockchainErrorMessageProps> = ({ error, className = '' }) => {
    if (!error) {
        return null // Don't render anything if there's no error
    }

    // The error prop is now already BlockchainErrorMessageProps, so no need to call getBlockchainErrorMessageProps
    const { message, suggestion } = error

    return (
        <div className={`rounded-md border border-red-200 bg-red-50 p-3 ${className}`}>
            <h4 className='font-medium text-red-700'>{message}</h4>
            <p className='text-sm text-red-600'>{suggestion}</p>
        </div>
    )
}
