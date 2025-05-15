import { useTransactionStatus } from '@/hooks/use-transaction-status'
import { ExternalLinkIcon, Loader2 } from 'lucide-react'
import React, { useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { BaseError, type Hash, type TransactionReceipt } from 'viem'

// Placeholder for utility function - should be created in @/lib/utils.ts or similar
// IMPORTANT: This needs to be chain-aware in a real app.
const getBlockExplorerUrl = (hash: Hash): string => {
    const L2_EXPLORER_URL = process.env.NEXT_PUBLIC_L2_EXPLORER_URL || 'https://sepolia.basescan.org'
    return `${L2_EXPLORER_URL}/tx/${hash}`
}

export interface NotifyTransactionProps {
    hash?: Hash // Can be initially undefined
    title: string
    pendingDescription?: string
    successDescription?: string
    errorDescription?: string
    chainId?: number // Optional: for block explorer link
}

interface ToastContentProps {
    title: string
    description: string
    explorerLink?: string
    errorDetails?: string // New prop for technical error details
}

const ToastContent: React.FC<ToastContentProps> = ({ title, description, explorerLink, errorDetails }) => (
    <div className='flex flex-col'>
        <span className='font-medium'>{title}</span>
        <p className='text-sm text-gray-600'>{description}</p>
        {explorerLink && (
            <a
                href={explorerLink}
                target='_blank'
                rel='noopener noreferrer'
                className='mt-1 flex items-center text-xs text-blue-500 hover:text-blue-600'>
                View on Explorer <ExternalLinkIcon className='ml-1 h-3 w-3' />
            </a>
        )}
        {errorDetails && (
            <details className='mt-2 text-xs text-gray-500'>
                <summary className='cursor-pointer'>Details</summary>
                <pre className='mt-1 rounded bg-gray-100 p-1 text-xs break-all whitespace-pre-wrap'>{errorDetails}</pre>
            </details>
        )}
    </div>
)

// Common props for Sonner toasts
interface SonnerToastProps {
    id: string | number
    duration: number
    description: React.ReactNode
    icon?: React.ReactNode
    // Add other common Sonner props if needed
}

export function useTransactionNotifier() {
    const activeToastId = useRef<string | number | null>(null)

    const notify = useCallback((props: NotifyTransactionProps) => {
        // If a hash is already provided, we can immediately start tracking.
        // If not, we'll show a generic pending/submitted message and wait for updateHash.

        // Clean up previous toast if any by this hook instance
        if (activeToastId.current) {
            toast.dismiss(activeToastId.current)
            activeToastId.current = null
        }

        // Initial toast - typically will be loading or a generic submitted message
        activeToastId.current = toast.custom((t: string | number) => <ToastUpdater {...props} internalToastId={t} />, {
            duration: Infinity, // Managed by ToastUpdater
        })

        const updateHash = (newHash: Hash, newChainId?: number) => {
            if (activeToastId.current) {
                // Re-toast with the same ID but new props for ToastUpdater
                toast.custom(
                    (t: string | number) => (
                        <ToastUpdater
                            {...props}
                            hash={newHash}
                            chainId={newChainId || props.chainId}
                            internalToastId={t}
                        />
                    ),
                    {
                        id: activeToastId.current,
                        duration: Infinity,
                    },
                )
            }
        }

        const dismiss = () => {
            if (activeToastId.current) {
                toast.dismiss(activeToastId.current)
                activeToastId.current = null
            }
        }

        return { toastId: activeToastId.current, updateHash, dismiss }
    }, []) // useCallback with empty dep array: `notify` function itself is stable.

    return { notify }
}

interface ToastUpdaterProps extends NotifyTransactionProps {
    internalToastId: string | number
}

const ToastUpdater: React.FC<ToastUpdaterProps> = ({
    hash,
    title,
    pendingDescription,
    successDescription,
    errorDescription,
    chainId,
    internalToastId,
}) => {
    const { transaction, error, isLoading, isSuccess, isError, isIdle } = useTransactionStatus(hash)

    useEffect(() => {
        const explorerLink = hash ? getBlockExplorerUrl(hash) : undefined
        let toastType: 'loading' | 'success' | 'error' | 'message' = 'message'

        // Typed toastProps using a subset of Sonner's possible properties
        const sonnerProps: Partial<SonnerToastProps> & { [key: string]: unknown } = {
            id: internalToastId,
            duration: 5000, // Default for success/error
        }

        if (isIdle && !hash) {
            toastType = 'message' // Or a specific initial state toast
            sonnerProps.description = (
                <ToastContent
                    title={title}
                    description={pendingDescription || 'Transaction submitted, waiting for confirmation...'}
                />
            )
            sonnerProps.icon = <Loader2 className='h-5 w-5 animate-spin' />
            sonnerProps.duration = Infinity
        } else if (isLoading) {
            toastType = 'loading'
            sonnerProps.description = (
                <ToastContent
                    title={`${title} (Pending)`}
                    description={pendingDescription || `Processing ${hash?.substring(0, 10)}...`}
                    explorerLink={explorerLink}
                />
            )
            sonnerProps.duration = Infinity
        } else if (isSuccess) {
            toastType = 'success'
            const successMsg = (transaction as TransactionReceipt)?.transactionHash
                ? `Confirmed ${(transaction as TransactionReceipt).transactionHash.substring(0, 10)}...`
                : 'Transaction confirmed!'
            sonnerProps.description = (
                <ToastContent
                    title={`${title} (Success)`}
                    description={successDescription || successMsg}
                    explorerLink={explorerLink}
                />
            )
        } else if (isError) {
            toastType = 'error'
            let userFriendlyMessage = 'Transaction failed.'
            let techDetails = error?.message || 'No additional details.'

            if (error instanceof BaseError) {
                techDetails = `Name: ${error.name}\nMessage: ${error.message}${error.cause ? `\nCause: ${error.cause}` : ''}${error.metaMessages ? `\nMeta: ${error.metaMessages.join('\n')}` : ''}`
                // Attempt to provide more user-friendly messages for common errors
                if (error.shortMessage.includes('rejected') || error.name === 'UserRejectedRequestError') {
                    userFriendlyMessage = 'Transaction rejected by user.'
                } else if (error.name === 'EstimateGasExecutionError') {
                    userFriendlyMessage = 'Gas estimation failed. The transaction might fail or require more gas.'
                } else if (error.shortMessage.includes('insufficient funds')) {
                    userFriendlyMessage = 'Insufficient funds for transaction.'
                } else if (
                    error.message.includes('nonce too low') ||
                    error.message.includes('replacement transaction underpriced')
                ) {
                    userFriendlyMessage = 'Nonce error. Please try again or reset your wallet account.'
                } else if (error.shortMessage) {
                    // Fallback to shortMessage if it seems more concise than the full message
                    userFriendlyMessage = error.shortMessage
                }
            }

            const finalErrorDesc =
                errorDescription ||
                (hash
                    ? `Failed ${hash.substring(0, 10)}... Error: ${userFriendlyMessage}`
                    : `Error: ${userFriendlyMessage}`)
            sonnerProps.description = (
                <ToastContent
                    title={`${title} (Failed)`}
                    description={finalErrorDesc}
                    explorerLink={explorerLink}
                    errorDetails={techDetails} // Pass technical details
                />
            )
        }

        // Call the appropriate Sonner toast function
        // Sonner reuses the ID to update the toast if it exists.
        switch (toastType) {
            case 'loading':
                toast.loading(sonnerProps.description as React.ReactNode, sonnerProps)
                break
            case 'success':
                toast.success(sonnerProps.description as React.ReactNode, sonnerProps)
                break
            case 'error':
                toast.error(sonnerProps.description as React.ReactNode, sonnerProps)
                break
            case 'message': // For initial state before hash, or other neutral messages
            default:
                toast(sonnerProps.description as React.ReactNode, sonnerProps)
                break
        }
    }, [
        hash,
        internalToastId,
        title,
        pendingDescription,
        successDescription,
        errorDescription,
        chainId,
        transaction,
        error,
        isLoading,
        isSuccess,
        isError,
        isIdle,
    ])

    // This component is primarily for its useEffect side-effect of updating the toast.
    // It doesn't render anything into the direct React tree where it's placed by toast.custom().
    return null
}
