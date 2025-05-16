import { BlockchainErrorMessage } from '@/components/BlockchainErrorMessage'
import { useTransactionNotifier } from '@/components/notifications/transaction-notifier'
import { Button } from '@/components/ui/button'
import { useApproveToken, useTokenAllowance } from '@/hooks/use-token-approval'
import { Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { type Address, formatUnits, parseUnits } from 'viem'
import { useAccount } from 'wagmi'

// Define explicit transaction states
type TransactionState = 'idle' | 'submitting' | 'pendingConfirmation' | 'success' | 'error'

interface TokenApprovalButtonProps {
    tokenAddress: Address
    spenderAddress: Address
    requiredAmount: string // The amount the spender needs to be approved for (human-readable string)
    tokenDecimals?: number
    tokenSymbol?: string
    buttonText?: string
    approvingText?: string
    approvedText?: string
    onApprovalSuccess?: (hash?: Address) => void
    onApprovalError?: (error: Error) => void
    disabled?: boolean // External disable flag
    className?: string
}

export const TokenApprovalButton: React.FC<TokenApprovalButtonProps> = ({
    tokenAddress,
    spenderAddress,
    requiredAmount,
    tokenDecimals = 18,
    tokenSymbol = 'tokens',
    buttonText = `Approve {amount} {symbol}`,
    approvingText = 'Approving...',
    approvedText = 'Allowance sufficient',
    onApprovalSuccess,
    onApprovalError,
    disabled: externalDisabled = false,
    className,
}) => {
    const { address: ownerAddress } = useAccount()
    const { notify } = useTransactionNotifier()

    const [internalTxHash, setInternalTxHash] = useState<Address | undefined>(undefined)
    const [transactionState, setTransactionState] = useState<TransactionState>('idle')

    const { allowance, isLoadingAllowance, refetchAllowance } = useTokenAllowance(
        tokenAddress,
        ownerAddress,
        spenderAddress,
        tokenDecimals,
    )

    const { approveToken, isApprovingToken, approveTokenHash, approveTokenError } = useApproveToken(tokenDecimals)

    const requiredAmountBigInt = useMemo(() => {
        try {
            return parseUnits(requiredAmount, tokenDecimals)
        } catch {
            return BigInt(0) // Fallback for invalid requiredAmount string
        }
    }, [requiredAmount, tokenDecimals])

    const hasSufficientAllowance = useMemo(() => {
        if (!allowance?.rawAllowance) return false
        return allowance.rawAllowance >= requiredAmountBigInt
    }, [allowance, requiredAmountBigInt])

    // Effect for when approveToken is called (submission phase)
    useEffect(() => {
        if (isApprovingToken) {
            setTransactionState('submitting')
        }
    }, [isApprovingToken])

    // Effect for when transaction hash is received
    useEffect(() => {
        if (approveTokenHash) {
            setInternalTxHash(approveTokenHash)
            setTransactionState('pendingConfirmation') // Move to pending confirmation once hash is available
            notify({
                hash: approveTokenHash,
                title: `Approve ${tokenSymbol}`,
                pendingDescription: `Approving ${formatUnits(requiredAmountBigInt, tokenDecimals)} ${tokenSymbol} for spending...`,
                successDescription: `${formatUnits(requiredAmountBigInt, tokenDecimals)} ${tokenSymbol} approved successfully!`,
                errorDescription: `Failed to approve ${tokenSymbol}.`,
            })
        }
    }, [approveTokenHash, tokenSymbol, notify, requiredAmountBigInt, tokenDecimals])

    // Effect for final transaction success/error based on hook state
    useEffect(() => {
        // Check for success: hash is present, no error, and no longer actively approving
        if (approveTokenHash && !approveTokenError && !isApprovingToken && transactionState === 'pendingConfirmation') {
            setTransactionState('success')
            void refetchAllowance() // Ensured refetchAllowance is called, added void for potential promise return
            onApprovalSuccess?.(approveTokenHash)
        } else if (approveTokenError) {
            setTransactionState('error')
            setInternalTxHash(undefined)
        }
        // Reset to idle if no longer approving, no hash, and no error (e.g., user cancelled before submitting to wallet)
        // This condition might need review based on exact state transitions desired
        if (!isApprovingToken && !approveTokenHash && transactionState === 'submitting' && !approveTokenError) {
            setTransactionState('idle')
        }
    }, [
        approveTokenError,
        internalTxHash, // Keep internalTxHash if used for other logic, but success is now tied to approveTokenHash
        refetchAllowance,
        onApprovalSuccess,
        isApprovingToken,
        approveTokenHash,
        transactionState,
    ])

    const handleApprove = async () => {
        if (!ownerAddress) return
        setTransactionState('submitting') // Optimistically set to submitting
        try {
            await approveToken({
                tokenAddress,
                spenderAddress,
                amountToApprove: requiredAmount, // useApproveToken handles 'unlimited' or specific string
            })
            // Success is handled by the useEffect watching isApproveTokenSuccess and approveTokenHash
        } catch (e) {
            // e is ParsedBlockchainError thrown by the hook
            console.error('Approval submission error caught in component:', e)
            if (onApprovalError) {
                // e is expected to be ParsedBlockchainError, which has a message property.
                if (typeof e === 'object' && e !== null && typeof (e as { message: string }).message === 'string') {
                    onApprovalError(new Error((e as { message: string }).message))
                } else {
                    onApprovalError(new Error('An unknown error occurred during approval'))
                }
            }
            // The approveTokenError state (BlockchainErrorMessageProps) is already set by the hook,
            // which will trigger the useEffect above to setTransactionState('error') and display BlockchainErrorMessage
        }
    }

    if (isLoadingAllowance) {
        return (
            <Button disabled className={className}>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Checking allowance...
            </Button>
        )
    }

    if (hasSufficientAllowance && transactionState !== 'pendingConfirmation' && transactionState !== 'submitting') {
        return (
            <Button disabled className={className}>
                {approvedText}
            </Button>
        )
    }

    const actualButtonText = buttonText.replace('{amount}', requiredAmount).replace('{symbol}', tokenSymbol || 'tokens')

    let buttonContent = actualButtonText
    if (transactionState === 'submitting' || transactionState === 'pendingConfirmation') {
        buttonContent = approvingText
    } else if (transactionState === 'error') {
        buttonContent = 'Approval Failed - Retry' // Or a prop for this text
    }

    return (
        <>
            <Button
                onClick={() => {
                    void handleApprove()
                }}
                disabled={
                    transactionState === 'submitting' ||
                    transactionState === 'pendingConfirmation' ||
                    externalDisabled ||
                    isLoadingAllowance // Also disable if still loading initial allowance
                }
                className={className}>
                {(transactionState === 'submitting' || transactionState === 'pendingConfirmation') && (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                )}
                {buttonContent}
            </Button>
            {approveTokenError && transactionState === 'error' && (
                <BlockchainErrorMessage error={approveTokenError} className='mt-2' />
            )}
        </>
    )
}
