'use client'

import { useTransactionStatus } from '@/hooks/use-transaction-status' // Removed type import as it's not used directly here
import { getBlockExplorerLink } from '@/utils/network'
import { type Hash } from 'viem'

interface TransactionStatusDisplayProps {
    hash?: Hash
    chainId?: number
    title?: string // e.g., "Approval Status", "Join Pool Status"
}

export function TransactionStatusDisplay({
    hash,
    chainId,
    title = 'Transaction Status',
}: TransactionStatusDisplayProps) {
    const { status, transaction, error, isLoading, isSuccess, isError } = useTransactionStatus(hash)

    if (!hash) {
        return null // Don't render if no hash is provided
    }

    const explorerLink = chainId && hash ? getBlockExplorerLink(hash, 'transaction', chainId) : ''

    return (
        <div className='mt-4 rounded-md border p-3'>
            <p className='text-sm font-medium text-gray-700'>{title}</p>
            {isLoading && <p className='text-sm text-yellow-600'>Processing transaction...</p>}
            {isSuccess && transaction && (
                <div>
                    <p className='text-sm text-green-600'>Transaction successful!</p>
                    {explorerLink && (
                        <a
                            href={explorerLink}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-xs text-blue-500 hover:underline'>
                            View on explorer (Hash: {`${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`})
                        </a>
                    )}
                </div>
            )}
            {isError && (
                <div>
                    <p className='text-sm text-red-600'>Transaction failed to confirm.</p>
                    {error?.message && <p className='text-xs text-red-500'>{error.message}</p>}
                </div>
            )}
            {!isLoading && !isSuccess && !isError && status !== 'idle' && (
                <p className='text-sm text-gray-500'>Status: {status}</p>
            )}
            {status === 'idle' && hash && (
                <p className='text-sm text-gray-500'>
                    Monitoring transaction (Hash: {`${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`})...
                </p>
            )}
        </div>
    )
}
