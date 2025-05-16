'use client'

import { useJoinPool } from '@/hooks/use-pool-contract'
import { useApproveToken, useTokenAllowance } from '@/hooks/use-token-approval'
import type { Pool } from '@/types/pool'
import { BlockchainErrorType, type BlockchainErrorMessageProps } from '@/utils/error-handling' // For error state and BlockchainErrorType
import { useEffect, useState } from 'react'
import { formatUnits, parseUnits, type Address } from 'viem'
import { useAccount, useBalance } from 'wagmi'
import { BlockchainErrorMessage } from './BlockchainErrorMessage' // For error display (subtask 8.7)
import { TransactionStatusDisplay } from './TransactionStatusDisplay' // Added

interface JoinPoolFormProps {
    pool: Pool // Assuming a full Pool object is passed
    onSuccess?: (txHash: string) => void
    onClose?: () => void // Example callback
}

export function JoinPoolForm({ pool, onSuccess, onClose }: JoinPoolFormProps) {
    const { address: accountAddress, isConnected, chainId: connectedChainId } = useAccount()
    const [isLoading, setIsLoading] = useState(false) // General submit button loading
    const [blockchainError, setBlockchainError] = useState<BlockchainErrorMessageProps | null>(null)
    const [formValidationError, setFormValidationError] = useState<string | null>(null)

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

            if (!needsApproval || (needsApproval && approveTokenHash)) {
                console.log('Proceeding to join pool...')
                const submittedJoinTxHash = await joinPool({
                    poolContractAddress: pool.contractAddress as Address,
                    poolId: pool.id,
                    depositAmount: requiredDepositBigInt,
                })
                if (onSuccess && submittedJoinTxHash) {
                    onSuccess(submittedJoinTxHash)
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

    if (!isConnected || !accountAddress) {
        return <p className='text-center text-red-500'>Please connect your wallet to join the pool.</p>
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
        <form onSubmit={event => void handleSubmit(event)} className='space-y-4'>
            <h3 className='text-lg font-semibold'>Join Pool: {pool.name}</h3>

            <div>
                <label htmlFor='depositAmount' className='block text-sm font-medium text-gray-700'>
                    Deposit Amount ({pool.tokenSymbol})
                </label>
                <div className='mt-1'>
                    <input
                        type='text'
                        name='depositAmount'
                        id='depositAmount'
                        value={pool.depositAmount.toString()}
                        readOnly
                        className='block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                        placeholder={`${pool.depositAmount} ${pool.tokenSymbol}`}
                    />
                </div>
                <p className='mt-1 text-xs text-gray-500'>
                    Required deposit: {pool.depositAmount} {pool.tokenSymbol}
                </p>
                {isLoadingBalance && <p className='mt-1 text-xs text-gray-500'>Loading your balance...</p>}
                {balanceData && !isLoadingBalance && (
                    <p className='mt-1 text-xs text-gray-500'>
                        Your balance: {formatUnits(balanceData.value, balanceData.decimals)} {balanceData.symbol}
                    </p>
                )}
                {isLoadingAllowance && <p className='mt-1 text-xs text-gray-500'>Loading token allowance...</p>}
                {allowance?.formattedAllowance !== undefined && !isLoadingAllowance && (
                    <p className='mt-1 text-xs text-gray-500'>
                        Your current allowance: {allowance.formattedAllowance} {pool.tokenSymbol}
                    </p>
                )}
                {formValidationError && <p className='mt-1 text-sm text-red-600'>{formValidationError}</p>}
            </div>

            {/* Transaction Status Displays */}
            {approveTokenHash && (
                <TransactionStatusDisplay hash={approveTokenHash} chainId={pool.chainId} title='Approval Status' />
            )}
            {joinPoolTxHash && (
                <TransactionStatusDisplay hash={joinPoolTxHash} chainId={pool.chainId} title='Join Pool Status' />
            )}

            {blockchainError && <BlockchainErrorMessage error={blockchainError} />}

            <div className='flex items-center justify-between'>
                {onClose && (
                    <button
                        type='button'
                        onClick={onClose}
                        disabled={uiLocked} // Simpler disable logic for cancel
                        className='rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50'>
                        Cancel
                    </button>
                )}
                <button
                    type='submit'
                    disabled={isSubmitDisabled}
                    className='ml-auto rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50'>
                    {buttonText}
                </button>
            </div>
        </form>
    )
}
