import { useTransactionStatus } from '@/hooks/use-transaction-status'
import { DefaultError } from '@tanstack/react-query'
import { CheckCircleIcon, ExternalLinkIcon, LoaderCircleIcon, XCircleIcon } from 'lucide-react'
import React, { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { type Hash } from 'viem'

interface TransactionNotificationProps {
    hash?: Hash // The transaction hash, can be initially undefined
    title: string
    description?: string
    // onClose is implicitly handled by sonner's dismiss or auto-dismissal
}

const getBlockExplorerUrl = (hash: Hash): string => {
    const chainId = process.env.NEXT_PUBLIC_CHAIN_ID
    if (chainId === '8453') {
        return `https://basescan.org/tx/${hash}`
    }
    // Default to Base Sepolia for development or other chain IDs
    return `https://sepolia.basescan.org/tx/${hash}`
}

export function useSonnerTransactionToast() {
    const toastIdRef = useRef<string | number | undefined>(undefined)

    const showToast = ({ hash, title, description }: TransactionNotificationProps) => {
        if (toastIdRef.current) {
            toast.dismiss(toastIdRef.current)
        }

        const newToastId = toast.custom(
            (
                t, // t is the toastId provided by sonner
            ) => (
                <TransactionToastInternal
                    toastId={t}
                    initialHash={hash}
                    title={title}
                    initialDescription={description}
                    onDismiss={() => toast.dismiss(t)}
                />
            ),
            {
                duration: Infinity, // Managed by TransactionToastInternal's effect for auto-dismissal
            },
        )
        toastIdRef.current = newToastId
    }

    const dismissToast = () => {
        if (toastIdRef.current) {
            toast.dismiss(toastIdRef.current)
            toastIdRef.current = undefined
        }
    }

    return { showToast, dismissToast }
}

interface TransactionToastInternalProps {
    toastId: string | number // ID from sonner, used for manual dismiss
    initialHash?: Hash
    title: string
    initialDescription?: string
    onDismiss: () => void
}

const TransactionToastInternal: React.FC<TransactionToastInternalProps> = ({
    initialHash,
    title,
    initialDescription,
    onDismiss,
}) => {
    const {
        status, // The status from useTransactionStatus
        transaction, // Assuming useTransactionStatus returns this for the receipt
        error: transactionHookError, // Assuming useTransactionStatus returns an error object
        isLoading: transactionIsLoading,
        isSuccess: transactionIsSuccess,
        isError: transactionIsError,
        isIdle: transactionIsIdle,
    } = useTransactionStatus(initialHash)

    const effectiveHash = initialHash || transaction?.transactionHash

    useEffect(() => {
        // Auto-dismissal for final states
        const shouldAutoDismiss = transactionIsSuccess || transactionIsError
        if (shouldAutoDismiss) {
            const timer = setTimeout(() => {
                onDismiss()
            }, 5000) // 5 seconds for success/error states
            return () => clearTimeout(timer)
        }
    }, [transactionIsSuccess, transactionIsError, onDismiss])

    let icon: React.ReactNode = null
    let currentTitle = title
    let currentDescription = initialDescription

    if (!effectiveHash && (transactionIsIdle || transactionIsLoading)) {
        currentTitle = `${title} (Initializing)`
        currentDescription = initialDescription || 'Waiting for transaction details...'
        icon = <LoaderCircleIcon className='mr-2 h-4 w-4 animate-spin text-gray-500 dark:text-gray-400' />
    } else if (transactionIsLoading) {
        currentTitle = `${title} (Pending)`
        currentDescription = effectiveHash
            ? `Processing ${effectiveHash.substring(0, 6)}...${effectiveHash.substring(effectiveHash.length - 4)}`
            : 'Processing transaction...'
        icon = <LoaderCircleIcon className='mr-2 h-4 w-4 animate-spin text-blue-500 dark:text-blue-400' />
    } else if (transactionIsSuccess) {
        currentTitle = `${title} (Success)`
        currentDescription = effectiveHash
            ? `Confirmed ${effectiveHash.substring(0, 6)}...${effectiveHash.substring(effectiveHash.length - 4)}`
            : 'Transaction confirmed!'
        icon = <CheckCircleIcon className='mr-2 h-4 w-4 text-green-500 dark:text-green-400' />
    } else if (transactionIsError) {
        currentTitle = `${title} (Failed)`
        const specificError =
            (transactionHookError as DefaultError)?.message || (transactionHookError as Error)?.message
        currentDescription = specificError || 'Transaction failed.'
        if (effectiveHash) {
            currentDescription =
                `Tx ${effectiveHash.substring(0, 6)}...${effectiveHash.substring(effectiveHash.length - 4)} failed. ${specificError || ''}`.trim()
        }
        icon = <XCircleIcon className='mr-2 h-4 w-4 text-red-500 dark:text-red-400' />
    } else if (effectiveHash && transactionIsIdle) {
        if (status === 'success' || transaction?.status === 'success') {
            currentTitle = `${title} (Success)`
            currentDescription = `Transaction ${effectiveHash.substring(0, 6)}...${effectiveHash.substring(effectiveHash.length - 4)} already confirmed.`
            icon = <CheckCircleIcon className='mr-2 h-4 w-4 text-green-500 dark:text-green-400' />
        } else if (status === 'error' || transaction?.status === 'reverted') {
            currentTitle = `${title} (Failed)`
            currentDescription = `Transaction ${effectiveHash.substring(0, 6)}...${effectiveHash.substring(effectiveHash.length - 4)} previously failed or was reverted.`
            icon = <XCircleIcon className='mr-2 h-4 w-4 text-red-500 dark:text-red-400' />
        } else {
            // Default for idle with hash but no definitive prior status from hook
            currentTitle = title
            currentDescription =
                initialDescription ||
                (effectiveHash
                    ? `Tx: ${effectiveHash.substring(0, 6)}...${effectiveHash.substring(effectiveHash.length - 4)}`
                    : 'Awaiting status...')
            icon = <LoaderCircleIcon className='mr-2 h-4 w-4 text-gray-500 dark:text-gray-400' />
        }
    }

    return (
        <div className='ring-opacity-5 dark:ring-opacity-10 flex w-full max-w-xs flex-col items-start rounded-lg bg-white p-3 shadow-lg ring-1 ring-black sm:max-w-sm dark:bg-gray-800 dark:ring-white'>
            <div className='flex w-full items-center justify-between'>
                <div className='flex items-center'>
                    {icon}
                    <span className='ml-1.5 text-sm font-medium text-gray-900 dark:text-gray-100'>{currentTitle}</span>
                </div>
                <button
                    onClick={onDismiss}
                    type='button'
                    className='-mt-1 -mr-1 rounded-full p-1 text-gray-400 hover:text-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-gray-500 dark:hover:text-gray-300'
                    aria-label='Close'>
                    <XCircleIcon className='h-5 w-5' />
                </button>
            </div>
            {currentDescription && (
                <p className='mt-0.5 ml-[22px] text-xs text-gray-600 dark:text-gray-400'>{currentDescription}</p>
            )}
            {effectiveHash && (
                <a
                    href={getBlockExplorerUrl(effectiveHash)}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='mt-1.5 ml-[22px] flex items-center text-xs text-blue-600 hover:text-blue-700 focus:underline focus:outline-none dark:text-blue-400 dark:hover:text-blue-300'>
                    View on Explorer <ExternalLinkIcon className='ml-1 h-3 w-3' />
                </a>
            )}
        </div>
    )
}
