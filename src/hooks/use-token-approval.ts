import { tokenAbi } from '@/types/contracts'
import { useCallback, useState } from 'react'
import { formatUnits, parseUnits, type Address } from 'viem'
import { useReadContract, useWriteContract } from 'wagmi'
import { parseBlockchainError, type BlockchainError, type BlockchainErrorMessageProps } from '../utils/error-handling'

export interface FormattedTokenAllowance {
    rawAllowance: bigint | undefined
    formattedAllowance: string | undefined
}

/**
 * Hook for checking the allowance of a specific ERC20 token for a spender.
 */
export function useTokenAllowance(
    tokenAddress: Address | undefined,
    ownerAddress: Address | undefined,
    spenderAddress: Address | undefined,
    tokenDecimals: number | undefined = 18, // Default to 18 if not provided
) {
    const { data, error, isLoading, refetch } = useReadContract({
        address: tokenAddress,
        abi: tokenAbi,
        functionName: 'allowance',
        args: ownerAddress && spenderAddress ? [ownerAddress, spenderAddress] : undefined,
        query: {
            enabled: !!tokenAddress && !!ownerAddress && !!spenderAddress,
        },
    })

    const tokenDecimalsToUse = tokenDecimals ?? 18

    return {
        allowance:
            data !== undefined
                ? { rawAllowance: data, formattedAllowance: formatUnits(data, tokenDecimalsToUse) }
                : undefined,
        isLoadingAllowance: isLoading,
        allowanceError: error ? parseBlockchainError(error as BlockchainError) : null,
        refetchAllowance: refetch,
    }
}

/**
 * Hook for approving an ERC20 token for a spender.
 * Allows for a specific amount or 'unlimited' approval.
 */
export function useApproveToken(tokenDecimals: number | undefined = 18) {
    const { writeContractAsync, isPending, data: hash } = useWriteContract()
    const [parsedApproveError, setParsedApproveError] = useState<BlockchainErrorMessageProps | null>(null)

    const approveToken = useCallback(
        async ({
            tokenAddress,
            spenderAddress,
            amountToApprove, // Amount in human-readable format (e.g., "100")
        }: {
            tokenAddress: Address
            spenderAddress: Address
            amountToApprove: string
        }) => {
            setParsedApproveError(null)
            try {
                const tokenDecimalsToUse = tokenDecimals ?? 18
                const rawAmount = parseUnits(amountToApprove, tokenDecimalsToUse)

                const txHash = await writeContractAsync({
                    address: tokenAddress,
                    abi: tokenAbi,
                    functionName: 'approve',
                    args: [spenderAddress, rawAmount],
                })
                return { hash: txHash }
            } catch (err) {
                const parsedError = parseBlockchainError(err as BlockchainError)
                setParsedApproveError(parsedError)
                throw new Error(parsedError.message)
            }
        },
        [writeContractAsync, tokenDecimals],
    )

    return {
        approveToken,
        isApprovingToken: isPending,
        approveTokenError: parsedApproveError,
        approveTokenHash: hash,
    }
}
