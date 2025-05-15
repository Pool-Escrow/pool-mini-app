import React from 'react'
import { formatUnits, parseUnits, type Address } from 'viem'
import { useReadContract, useWriteContract } from 'wagmi'
import { parseBlockchainError, type BlockchainError, type BlockchainErrorMessageProps } from '../utils/error-handling'

// Minimal ERC20 ABI for token interactions
export const erc20Abi = [
    {
        name: 'balanceOf',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: '_owner', type: 'address' }],
        outputs: [{ name: 'balance', type: 'uint256' }],
    },
    {
        name: 'allowance',
        type: 'function',
        stateMutability: 'view',
        inputs: [
            { name: '_owner', type: 'address' },
            { name: '_spender', type: 'address' },
        ],
        outputs: [{ name: 'remaining', type: 'uint256' }],
    },
    {
        name: 'approve',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: '_spender', type: 'address' },
            { name: '_value', type: 'uint256' },
        ],
        outputs: [{ name: 'success', type: 'bool' }],
    },
] as const

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
    decimals: number = 18, // Added for formatting
) {
    const { data, isLoading, isError, error, ...rest } = useReadContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'allowance',
        args: ownerAddress && spenderAddress ? [ownerAddress, spenderAddress] : undefined,
        query: {
            enabled:
                !!tokenAddress &&
                !!ownerAddress &&
                !!spenderAddress &&
                tokenAddress !== '0x0000000000000000000000000000000000000000',
            select: (allowanceData: bigint | undefined): FormattedTokenAllowance => {
                if (typeof allowanceData === 'bigint') {
                    return {
                        rawAllowance: allowanceData,
                        formattedAllowance: formatUnits(allowanceData, decimals),
                    }
                }
                return {
                    rawAllowance: undefined,
                    formattedAllowance: undefined,
                }
            },
        },
    })

    return {
        allowance: data, // This will be FormattedTokenAllowance | undefined
        isLoadingAllowance: isLoading,
        isErrorAllowance: isError,
        allowanceError: error,
        ...rest,
    }
}

/**
 * Hook for approving an ERC20 token for a spender.
 * Allows for a specific amount or 'unlimited' approval.
 */
export function useApproveToken(decimals: number = 18) {
    const { writeContractAsync, isPending, isSuccess, error: rawApproveError, data: hash } = useWriteContract()
    const [parsedApproveError, setParsedApproveError] = React.useState<BlockchainErrorMessageProps | null>(null)

    // Max uint256 value for 'unlimited' approval
    const MAX_UINT256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')

    const approveToken = async ({
        tokenAddress,
        spenderAddress,
        amountToApprove, // Optional: if undefined or 'unlimited', approves MAX_UINT256
    }: {
        tokenAddress: Address
        spenderAddress: Address
        amountToApprove?: string | 'unlimited'
    }) => {
        setParsedApproveError(null)
        let approvalAmount: bigint
        if (amountToApprove === undefined || amountToApprove === 'unlimited') {
            approvalAmount = MAX_UINT256
        } else {
            approvalAmount = parseUnits(amountToApprove, decimals)
        }

        try {
            const result = await writeContractAsync({
                address: tokenAddress,
                abi: erc20Abi,
                functionName: 'approve',
                args: [spenderAddress, approvalAmount],
            })
            return result
        } catch (err) {
            const parsed = parseBlockchainError(err as BlockchainError)
            setParsedApproveError(parsed)
            throw parsed
        }
    }

    return {
        approveToken,
        isApprovingToken: isPending,
        isApproveTokenSuccess: isSuccess,
        rawApproveTokenError: rawApproveError,
        approveTokenError: parsedApproveError,
        approveTokenHash: hash,
    }
}
