'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useJoinPool } from '@/hooks/use-pool-contract'
import { useApproveToken, useTokenAllowance } from '@/hooks/use-token-approval'
import type { Pool } from '@/types/pool'
import { BlockchainErrorType, type BlockchainErrorMessageProps } from '@/utils/error-handling' // For error state and BlockchainErrorType
import React, { useEffect, useState } from 'react'
import { parseUnits, type Address } from 'viem'
import { useAccount, useBalance } from 'wagmi'
import { BlockchainErrorMessage } from './BlockchainErrorMessage' // For error display (subtask 8.7)
import { JoinPoolSuccessReceipt } from './JoinPoolSuccessReceipt' // Added import
import { TransactionStatusDisplay } from './TransactionStatusDisplay' // Added

interface JoinPoolFormProps {
    pool: Pool // The pool object the user is trying to join
    onJoinSuccess?: (txHash: string) => void // Optional callback on successful join
    onClose?: () => void // Optional callback to close a modal or navigate away
}

export const JoinPoolForm: React.FC<JoinPoolFormProps> = ({ pool, onJoinSuccess, onClose }) => {
    const { address: accountAddress, isConnected, chainId: connectedChainId } = useAccount()
    const [isLoading, setIsLoading] = useState(false) // General submit button loading
    const [blockchainError, setBlockchainError] = useState<BlockchainErrorMessageProps | null>(null)
    const [formValidationError, setFormValidationError] = useState<string | null>(null)
    const [showSuccessReceipt, setShowSuccessReceipt] = useState<boolean>(false) // Added state for success view
    const [finalTxHash, setFinalTxHash] = useState<string | null>(null) // Added state to store final tx hash for receipt

    const spenderAddress = pool.contractAddress as Address | undefined

    const { data: balanceData, isLoading: isLoadingBalance } = useBalance({
        address: accountAddress,
        token: pool.tokenAddress as Address | undefined,
        chainId: pool.chainId, // Assuming chainId is part of Pool type
    })

    const { allowance, isLoadingAllowance, allowanceError } = useTokenAllowance(
        pool.tokenAddress as Address | undefined,
        accountAddress,
        spenderAddress,
        pool.tokenDecimals,
    )

    const { approveToken, isApprovingToken, approveTokenError, approveTokenHash } = useApproveToken(pool.tokenDecimals)

    const { joinPool, isJoiningPool, joinPoolError, joinPoolTxHash } = useJoinPool()

    // Update error state when hook errors change
    useEffect(() => {
        if (approveTokenError) setBlockchainError(approveTokenError)
        else if (joinPoolError) setBlockchainError(joinPoolError)
        else setBlockchainError(null)
    }, [approveTokenError, joinPoolError])

    useEffect(() => {
        // Clear previous validation error first
        setFormValidationError(null)

        if (isLoadingAllowance) {
            // Handled by submit button disable state
        } else if (allowanceError) {
            const viemError = allowanceError as unknown as Error & { shortMessage?: string }
            setFormValidationError(`Error fetching allowance: ${viemError.shortMessage ?? viemError.message}`)
        } else if (balanceData && pool.depositAmount !== undefined && pool.tokenDecimals !== undefined) {
            const requiredAmountBigInt = parseUnits(pool.depositAmount.toString(), pool.tokenDecimals)
            if (balanceData.value < requiredAmountBigInt) {
                setFormValidationError(`Insufficient ${balanceData.symbol ?? pool.tokenSymbol ?? 'token'} balance.`)
            }
        }
        // No specific message for balance loading, handled by button disable
    }, [balanceData, pool.depositAmount, pool.tokenDecimals, pool.tokenSymbol, isLoadingAllowance, allowanceError])

    const requiredDepositBigInt =
        pool.tokenDecimals !== undefined ? parseUnits(pool.depositAmount.toString(), pool.tokenDecimals) : BigInt(0)
    // needsApproval should only be considered valid if allowance is not loading
    const needsApproval =
        !isLoadingAllowance && allowance?.rawAllowance !== undefined && allowance.rawAllowance < requiredDepositBigInt

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!pool.contractAddress || !pool.tokenAddress || pool.tokenDecimals === undefined) {
            setBlockchainError({
                type: BlockchainErrorType.UNKNOWN,
                message: 'Pool configuration is incomplete (missing contract, token address, or decimals).',
                suggestion: 'Please contact support.',
            })
            return
        }
        if (connectedChainId !== pool.chainId) {
            setBlockchainError({
                type: BlockchainErrorType.UNKNOWN,
                message: 'Network Mismatch',
                suggestion: `Please switch your wallet to the network configured for this pool.`,
            })
            return
        }

        setIsLoading(true)
        setBlockchainError(null)
        // setFormValidationError(null) // Already cleared at start of useEffect or if submit proceeds

        try {
            if (needsApproval) {
                console.log('Approving token...')
                await approveToken({
                    tokenAddress: pool.tokenAddress as Address,
                    spenderAddress: pool.contractAddress as Address,
                    amountToApprove: pool.depositAmount.toString(),
                })
            }

            if (!needsApproval) {
                // If no approval was ever needed, join directly
                console.log('Proceeding to join pool (no approval needed)...')
                const submittedJoinTxHash = await joinPool({
                    poolContractAddress: pool.contractAddress as Address,
                    poolId: pool.id,
                    depositAmount: requiredDepositBigInt,
                })
                if (submittedJoinTxHash) {
                    setFinalTxHash(submittedJoinTxHash)
                    setShowSuccessReceipt(true)
                    onJoinSuccess?.(submittedJoinTxHash)
                }
            } else if (approveTokenHash && !isApprovingToken && !approveTokenError) {
                // If approval was needed, is no longer approving, and no error, AND we have an approve hash (meaning it was attempted)
                // This assumes successful approval if no error by this point.
                // A more robust way might involve confirming the approval transaction succeeded via useWaitForTransaction.
                console.log('Approval successful or hash available, proceeding to join pool...')
                const submittedJoinTxHash = await joinPool({
                    poolContractAddress: pool.contractAddress as Address,
                    poolId: pool.id,
                    depositAmount: requiredDepositBigInt,
                })
                if (submittedJoinTxHash) {
                    setFinalTxHash(submittedJoinTxHash)
                    setShowSuccessReceipt(true)
                    onJoinSuccess?.(submittedJoinTxHash)
                }
            }
        } catch (e) {
            console.error('Error during submit (approve/join):', e)
            if (!approveTokenError && !joinPoolError) {
                const genericError = e as Error
                setBlockchainError({
                    type: BlockchainErrorType.UNKNOWN,
                    message: genericError.message || 'An unexpected error occurred during the process.',
                    suggestion: 'Please check your wallet and try again.',
                })
            }
        }
        setIsLoading(false)
    }

    // Effect to automatically join after successful approval
    // This handles the case where approval was needed, initiated, and the approveTxHash is set.
    // We wait for isApprovingToken to be false and no error before attempting to join.
    useEffect(() => {
        if (
            approveTokenHash &&
            !isApprovingToken &&
            !approveTokenError &&
            needsApproval &&
            !joinPoolTxHash &&
            !isJoiningPool &&
            !isLoading
        ) {
            // Check `needsApproval` again in case allowance updated elsewhere, though primary check is if approval was the last action.
            // `!isLoading` ensures we don't try to auto-join if a manual submit is already in progress for some reason.
            const autoJoinAfterApproval = async () => {
                console.log('Auto-joining pool after successful approval hash...')
                setIsLoading(true) // Set main loading for this auto-triggered action
                setBlockchainError(null)
                try {
                    const submittedJoinTxHash = await joinPool({
                        poolContractAddress: pool.contractAddress as Address,
                        poolId: pool.id,
                        depositAmount: requiredDepositBigInt,
                    })
                    if (submittedJoinTxHash) {
                        setFinalTxHash(submittedJoinTxHash)
                        setShowSuccessReceipt(true)
                        onJoinSuccess?.(submittedJoinTxHash)
                    }
                } catch (e) {
                    console.error('Error during auto-join after approval:', e)
                    const genericError = e as Error
                    setBlockchainError({
                        type: BlockchainErrorType.UNKNOWN,
                        message: genericError.message || 'An unexpected error occurred during the auto-join process.',
                        suggestion: 'Please check your wallet and try again, or attempt to join manually.',
                    })
                }
                setIsLoading(false)
            }
            void autoJoinAfterApproval()
        }
    }, [
        approveTokenHash,
        isApprovingToken,
        approveTokenError,
        needsApproval,
        pool,
        requiredDepositBigInt,
        joinPool,
        onJoinSuccess,
        joinPoolTxHash,
        isJoiningPool,
        isLoading,
    ])

    if (!isConnected || !accountAddress) {
        return <p className='text-center text-red-500'>Please connect your wallet to join the pool.</p>
    }

    if (showSuccessReceipt && finalTxHash) {
        return (
            <JoinPoolSuccessReceipt
                pool={pool}
                txHash={finalTxHash}
                onClose={() => {
                    setShowSuccessReceipt(false)
                    setFinalTxHash(null)
                    onClose?.() // Call original onClose if provided
                }}
            />
        )
    }

    const uiLocked = isLoading || isApprovingToken || isJoiningPool || isLoadingBalance || isLoadingAllowance
    const isSubmitDisabled =
        uiLocked ||
        !!formValidationError ||
        (needsApproval === undefined &&
            !isLoadingAllowance) /* More precise: needsApproval calculation depends on !isLoadingAllowance */

    const buttonText = isJoiningPool
        ? 'Joining...'
        : isApprovingToken
          ? 'Approving...'
          : needsApproval
            ? 'Approve Token'
            : isLoading || isLoadingAllowance || isLoadingBalance // General loading state before specific action
              ? 'Loading Data...'
              : 'Join Pool'

    return (
        <Card className='w-full max-w-md'>
            <CardHeader>
                <CardTitle>Join {pool.name}</CardTitle>
                <CardDescription>
                    Deposit {pool.depositAmount} {pool.tokenSymbol} to participate.
                </CardDescription>
            </CardHeader>
            <form
                onSubmit={e => {
                    void handleSubmit(e)
                }}>
                <CardContent className='space-y-4'>
                    {/* Placeholder for Token Selection (Subtask 8.2) */}
                    <div className='space-y-2'>
                        <Label htmlFor='token-selection'>Token (Pool Default)</Label>
                        <Input
                            id='token-selection'
                            value={`${pool.tokenSymbol} (${pool.tokenAddress})`}
                            readOnly
                            disabled
                        />
                        {/* In a real scenario, this might be a dropdown if multiple tokens were allowed per pool */}
                    </div>

                    {/* Placeholder for Amount Input (already part of this subtask's basic structure) */}
                    <div className='space-y-2'>
                        <Label htmlFor='deposit-amount'>Deposit Amount</Label>
                        <Input
                            id='deposit-amount'
                            type='number' // Or text and parse, depending on desired precision handling
                            value={pool.depositAmount} // Assuming fixed deposit amount for now as per CardDescription
                            readOnly // If amount is fixed by the pool
                            // onChange={(e) => setDepositAmount(e.target.value)} // Enable if amount is variable
                            // placeholder={`Enter ${pool.tokenSymbol} amount`}
                            // disabled={isLoading}
                        />
                        {/* Display user balance here if relevant */}
                        {/* <p className="text-sm text-muted-foreground">Your balance: {userBalance} {pool.tokenSymbol}</p> */}
                    </div>

                    {formValidationError && (
                        <div className='mt-2 rounded-md bg-red-50 p-3'>
                            <p className='text-sm font-medium text-red-700'>{formValidationError}</p>
                        </div>
                    )}
                </CardContent>
                <CardFooter className='flex flex-col space-y-2'>
                    <Button type='submit' className='w-full' disabled={isSubmitDisabled}>
                        {buttonText}
                    </Button>
                    {onClose && (
                        <Button variant='outline' className='w-full' onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                    )}
                </CardFooter>
            </form>

            {/* Transaction Status Displays */}
            {approveTokenHash && !showSuccessReceipt && (
                <TransactionStatusDisplay hash={approveTokenHash} chainId={pool.chainId} title='Approval Status' />
            )}
            {joinPoolTxHash && !showSuccessReceipt && (
                <TransactionStatusDisplay hash={joinPoolTxHash} chainId={pool.chainId} title='Join Pool Status' />
            )}

            {blockchainError && !showSuccessReceipt && <BlockchainErrorMessage error={blockchainError} />}
        </Card>
    )
}
