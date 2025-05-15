import type { DefaultError } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import type { TransactionReceipt} from 'viem';
import { type Hash } from 'viem'
import { useWaitForTransactionReceipt } from 'wagmi'

export type TransactionStatus = 'idle' | 'pending' | 'success' | 'error'

export interface UseTransactionStatusReturn {
    status: TransactionStatus
    transaction: TransactionReceipt | undefined
    error: DefaultError | null
    isLoading: boolean
    isSuccess: boolean
    isError: boolean
    isIdle: boolean
}

export function useTransactionStatus(hash?: Hash): UseTransactionStatusReturn {
    const [status, setStatus] = useState<TransactionStatus>('idle')

    const {
        data: transactionData,
        isError: isTxError,
        isLoading: isTxLoading,
        isSuccess: isTxSuccess,
        error: txError,
    } = useWaitForTransactionReceipt({
        hash,
        query: {
            enabled: !!hash,
        },
    })

    useEffect(() => {
        if (!hash) {
            setStatus('idle')
        } else if (isTxLoading) {
            setStatus('pending')
        } else if (isTxSuccess) {
            setStatus('success')
        } else if (isTxError) {
            setStatus('error')
        }
    }, [hash, isTxLoading, isTxSuccess, isTxError])

    return {
        status,
        transaction: transactionData,
        error: txError,
        isLoading: status === 'pending',
        isSuccess: status === 'success',
        isError: status === 'error',
        isIdle: status === 'idle',
    }
}
