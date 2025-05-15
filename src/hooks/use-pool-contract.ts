import { CONTRACT_CONFIG } from '@/config/contract-config'
import { useState } from 'react'
import { formatUnits, type Address } from 'viem'
import { useChainId, useReadContract, useWriteContract, type UseWriteContractParameters } from 'wagmi'

import { poolAbi, tokenAbi } from '@/types/contracts' // Import poolAbi and tokenAbi
import { parseBlockchainError, type BlockchainError, type BlockchainErrorMessageProps } from '../utils/error-handling' // Added import

// Formatted type for our custom hook
export interface FormattedPoolInfo {
    id: string | undefined
    detail: {
        timeStart: number
        timeEnd: number
        poolAdmin: Address
        totalWinners: number
        poolName: string
        depositAmountPerPerson: string // Formatted
        amountPerWinner: string // Formatted
    }
    balance: {
        totalDeposits: string // Formatted
        feesAccumulated: string // Formatted
        feesCollected: string // Formatted
        balance: string // Formatted
        sponsored: string // Formatted
    }
    tokenAddress: Address
    participants: readonly Address[]
    winners: readonly Address[]
}

export interface FormattedPoolDetail {
    timeStart: number
    timeEnd: number
    poolAdmin: Address
    totalWinners: number
    poolName: string
    depositAmountPerPerson: string // Formatted
    amountPerWinner: string // Formatted
}

// Helper to get the Pool contract address for the current chain
const usePoolAddress = () => {
    const chainId = useChainId()
    return CONTRACT_CONFIG.getPoolContractAddress(chainId)
}

// Helper to get the Token contract address for the current chain (Removed as it was unused)
// const useTokenAddress = () => {
//   const chainId = useChainId()
//   return CONTRACT_CONFIG.getTokenContractAddress(chainId)
// }

// Interface for the props of individual write hooks, allowing wagmi config overrides
interface UsePoolContractWriteProps {
    config?: Omit<UseWriteContractParameters, 'abi' | 'address' | 'functionName' | 'args'>
}

/**
 * Hook for creating a new pool.
 *
 * This hook encapsulates the `useWriteContract` call for the `createPool` function of the Pool contract.
 * It handles parsing blockchain errors using `parseBlockchainError` from `../utils/error-handling`.
 *
 * @param config Optional configuration overrides for `useWriteContract`.
 * @returns An object containing:
 *  - `createPool`: An async function to call the `createPool` contract method.
 *      Takes poolAddress and args (timeStart, timeEnd, poolName, etc.) as parameters.
 *      Returns the transaction hash on success.
 *      Throws a `ParsedBlockchainError` on failure, which is also set in `parsedCreatePoolError`.
 *  - `createPoolData`: The transaction hash if the `createPool` call was successful.
 *  - `rawCreatePoolError`: The raw error object from `useWriteContract` if an error occurred.
 *  - `parsedCreatePoolError`: A `BlockchainErrorMessageProps` object containing the parsed error details
 *      (type, message, suggestion) if an error occurred. Null otherwise. UI components should primarily use this.
 *  - `isCreatingPool`: A boolean indicating if the `createPool` transaction is currently pending.
 *
 * @example
 * const { createPool, parsedCreatePoolError, isCreatingPool } = useCreatePool();
 *
 * async function handleCreate() {
 *   try {
 *     await createPool(poolContractAddress, poolArgs);
 *     // Handle success
 *   } catch (e) {
 *     // Error is already set in parsedCreatePoolError and can be displayed in the UI
 *     console.error("Create pool failed:", e); // e is the ParsedBlockchainError object
 *   }
 * }
 *
 * // In your component's JSX:
 * {isCreatingPool && <p>Creating pool...</p>}
 * {parsedCreatePoolError && (
 *   <div>
 *     <h3>Error: {parsedCreatePoolError.type.replace(/_/g, ' ')}</h3>
 *     <p>{parsedCreatePoolError.message}</p>
 *     <p>Suggestion: {parsedCreatePoolError.suggestion}</p>
 *   </div>
 * )}
 */
export function useCreatePool(config?: UsePoolContractWriteProps) {
    const {
        data: createPoolData,
        error: rawCreatePoolError,
        isPending: isCreatingPool,
        writeContractAsync: createPoolAsync,
    } = useWriteContract()

    const [parsedCreatePoolError, setParsedCreatePoolError] = useState<BlockchainErrorMessageProps | null>(null)

    const createPool = async (
        poolAddress: Address,
        args: {
            timeStart: bigint
            timeEnd: bigint
            poolName: string
            depositAmountPerPerson: bigint
            token: Address
            totalWinners: number // uint16 in Solidity
            amountPerWinner: bigint
        },
    ) => {
        try {
            const hash = await createPoolAsync({
                ...config,
                address: poolAddress,
                abi: poolAbi, // Uses imported poolAbi
                functionName: 'createPool',
                args: [
                    Number(args.timeStart),
                    Number(args.timeEnd),
                    args.poolName,
                    args.depositAmountPerPerson,
                    args.token,
                    args.totalWinners,
                    args.amountPerWinner,
                ],
            })
            setParsedCreatePoolError(null)
            return hash
        } catch (e) {
            const parsedError = parseBlockchainError(e as BlockchainError)
            setParsedCreatePoolError(parsedError)
            // console.error("Error creating pool:", parsedError);
            throw new Error(parsedError.message)
        }
    }

    return {
        createPool,
        createPoolData,
        rawCreatePoolError,
        parsedCreatePoolError,
        isCreatingPool,
    }
}

/**
 * Hook for joining an existing pool (depositing funds).
 */
export function useJoinPool() {
    const { writeContractAsync, isPending, isSuccess, error: rawJoinError, data: hash } = useWriteContract()
    const [parsedJoinError, setParsedJoinError] = useState<BlockchainErrorMessageProps | null>(null)

    const joinPool = async ({
        poolContractAddress, // Address of the specific Pool contract instance
        poolId,
        depositAmount, // The exact amount to deposit, already in smallest units (BigInt)
    }: {
        poolContractAddress: Address
        poolId: string | number // Will be converted to BigInt
        depositAmount: bigint
    }) => {
        setParsedJoinError(null)
        try {
            const result = await writeContractAsync({
                address: poolContractAddress,
                abi: poolAbi, // Use imported poolAbi instead of manual minimal ABI
                functionName: 'deposit',
                args: [BigInt(poolId), depositAmount],
            })
            return result // Returns transaction hash
        } catch (err) {
            const parsedError = parseBlockchainError(err as BlockchainError)
            setParsedJoinError({
                type: parsedError.type,
                message: parsedError.message,
                suggestion: parsedError.suggestion,
            })
            throw new Error(parsedError.message) // Re-throw for other catchers/logging
        }
    }

    return {
        joinPool,
        isJoiningPool: isPending,
        isJoinPoolSuccess: isSuccess,
        rawJoinPoolError: rawJoinError,
        joinPoolError: parsedJoinError,
        joinPoolTxHash: hash,
    }
}

/**
 * Hook for sponsoring a pool.
 */
export function useSponsorPool(config?: UsePoolContractWriteProps) {
    const {
        data: sponsorPoolData,
        error: rawSponsorPoolError,
        isPending: isSponsoringPool,
        writeContractAsync: sponsorPoolAsync,
    } = useWriteContract()

    const [parsedSponsorPoolError, setParsedSponsorPoolError] = useState<BlockchainErrorMessageProps | null>(null)

    const sponsorPool = async (poolAddress: Address, poolId: bigint, amount: bigint, message: string) => {
        try {
            const hash = await sponsorPoolAsync({
                ...config,
                address: poolAddress,
                abi: poolAbi,
                functionName: 'sponsor',
                args: [poolId, amount, message],
            })
            setParsedSponsorPoolError(null)
            return hash
        } catch (e) {
            const parsedError = parseBlockchainError(e as BlockchainError)
            setParsedSponsorPoolError(parsedError)
            // console.error("Error sponsoring pool:", parsedError);
            throw new Error(parsedError.message)
        }
    }

    return {
        sponsorPool,
        sponsorPoolData,
        rawSponsorPoolError,
        parsedSponsorPoolError,
        isSponsoringPool,
    }
}

/**
 * Hook for setting winners with specific amounts.
 */
export function useSetWinners(config?: UsePoolContractWriteProps) {
    const {
        data: setWinnersData,
        error: rawSetWinnersError,
        isPending: isSettingWinners,
        writeContractAsync: setWinnersAsync,
    } = useWriteContract()

    const [parsedSetWinnersError, setParsedSetWinnersError] = useState<BlockchainErrorMessageProps | null>(null)

    const setWinners = async (poolAddress: Address, poolId: bigint, winners: Address[], amounts: bigint[]) => {
        try {
            const hash = await setWinnersAsync({
                ...config,
                address: poolAddress,
                abi: poolAbi, // Corrected casing
                functionName: 'setWinners',
                args: [poolId, winners, amounts],
            })
            setParsedSetWinnersError(null)
            return hash
        } catch (e) {
            const parsedError = parseBlockchainError(e as BlockchainError)
            setParsedSetWinnersError(parsedError)
            // console.error("Error setting winners:", parsedError);
            throw new Error(parsedError.message)
        }
    }

    return {
        setWinners,
        setWinnersData,
        rawSetWinnersError,
        parsedSetWinnersError,
        isSettingWinners,
    }
}

/**
 * Hook for setting winners evenly.
 */
export function useSetWinnersEvenly(config?: UsePoolContractWriteProps) {
    const {
        data: setWinnersEvenlyData,
        error: rawSetWinnersEvenlyError,
        isPending: isSettingWinnersEvenly,
        writeContractAsync: setWinnersEvenlyAsync,
    } = useWriteContract()

    const [parsedSetWinnersEvenlyError, setParsedSetWinnersEvenlyError] = useState<BlockchainErrorMessageProps | null>(
        null,
    )

    const setWinnersEvenly = async (poolAddress: Address, poolId: bigint, winners: Address[]) => {
        try {
            const hash = await setWinnersEvenlyAsync({
                ...config,
                address: poolAddress,
                abi: poolAbi, // Corrected casing
                functionName: 'setWinnersEvenly',
                args: [poolId, winners],
            })
            setParsedSetWinnersEvenlyError(null)
            return hash
        } catch (e) {
            const parsedError = parseBlockchainError(e as BlockchainError)
            setParsedSetWinnersEvenlyError(parsedError)
            // console.error("Error setting winners evenly:", parsedError);
            throw new Error(parsedError.message)
        }
    }

    return {
        setWinnersEvenly,
        setWinnersEvenlyData,
        rawSetWinnersEvenlyError,
        parsedSetWinnersEvenlyError,
        isSettingWinnersEvenly,
    }
}

/**
 * Hook for claiming winnings for multiple pools.
 */
export function useClaimWinnings(config?: UsePoolContractWriteProps) {
    const {
        data: claimWinningsData,
        error: rawClaimWinningsError,
        isPending: isClaimingWinnings,
        writeContractAsync: claimWinningsAsync,
    } = useWriteContract()

    const [parsedClaimWinningsError, setParsedClaimWinningsError] = useState<BlockchainErrorMessageProps | null>(null)

    const claimWinnings = async (
        poolAddress: Address,
        poolIds: bigint[],
        winners: Address[], // Assuming this corresponds to each poolId or is a general claim
    ) => {
        try {
            const hash = await claimWinningsAsync({
                ...config,
                address: poolAddress,
                abi: poolAbi, // Corrected casing
                functionName: 'claimWinnings',
                args: [poolIds, winners],
            })
            setParsedClaimWinningsError(null)
            return hash
        } catch (e) {
            const parsedError = parseBlockchainError(e as BlockchainError)
            setParsedClaimWinningsError(parsedError)
            // console.error("Error claiming winnings:", parsedError);
            throw new Error(parsedError.message)
        }
    }

    return {
        claimWinnings,
        claimWinningsData,
        rawClaimWinningsError,
        parsedClaimWinningsError,
        isClaimingWinnings,
    }
}

/**
 * Hook for claiming winnings for a single pool and winner.
 */
export function useClaimWinning(config?: UsePoolContractWriteProps) {
    const {
        data: claimWinningData,
        error: rawClaimWinningError,
        isPending: isClaimingWinning,
        writeContractAsync: claimWinningAsync,
    } = useWriteContract()

    const [parsedClaimWinningError, setParsedClaimWinningError] = useState<BlockchainErrorMessageProps | null>(null)

    const claimWinning = async (poolAddress: Address, poolId: bigint, winner: Address) => {
        try {
            const hash = await claimWinningAsync({
                ...config,
                address: poolAddress,
                abi: poolAbi, // Corrected casing
                functionName: 'claimWinning',
                args: [poolId, winner],
            })
            setParsedClaimWinningError(null)
            return hash
        } catch (e) {
            const parsedError = parseBlockchainError(e as BlockchainError)
            setParsedClaimWinningError(parsedError)
            // console.error("Error claiming winning:", parsedError);
            throw new Error(parsedError.message)
        }
    }

    return {
        claimWinning,
        claimWinningData,
        rawClaimWinningError,
        parsedClaimWinningError,
        isClaimingWinning,
    }
}

/**
 * Hook for collecting the remaining balance by the host.
 */
export function useCollectRemainingBalance(config?: UsePoolContractWriteProps) {
    const {
        data: collectRemainingBalanceData,
        error: rawCollectRemainingBalanceError,
        isPending: isCollectingRemainingBalance,
        writeContractAsync: collectRemainingBalanceAsync,
    } = useWriteContract()

    const [parsedCollectRemainingBalanceError, setParsedCollectRemainingBalanceError] =
        useState<BlockchainErrorMessageProps | null>(null)

    const collectRemainingBalance = async (poolAddress: Address, poolId: bigint) => {
        // Added poolId parameter
        try {
            const hash = await collectRemainingBalanceAsync({
                ...config,
                address: poolAddress,
                abi: poolAbi, // Corrected casing
                functionName: 'collectRemainingBalance',
                args: [poolId], // Added poolId to args
            })
            setParsedCollectRemainingBalanceError(null)
            return hash
        } catch (e) {
            const parsedError = parseBlockchainError(e as BlockchainError)
            setParsedCollectRemainingBalanceError(parsedError)
            // console.error("Error collecting remaining balance:", parsedError);
            throw new Error(parsedError.message)
        }
    }

    return {
        collectRemainingBalance,
        collectRemainingBalanceData,
        rawCollectRemainingBalanceError,
        parsedCollectRemainingBalanceError,
        isCollectingRemainingBalance,
    }
}

// --- Read Hooks ---

/**
 * Hook for reading all information about a specific pool.
 */
export function useGetAllPoolInfo(poolId: string | undefined) {
    const poolAddress = usePoolAddress()
    return useReadContract({
        address: poolAddress,
        abi: poolAbi,
        functionName: 'getAllPoolInfo',
        args: poolId ? [BigInt(poolId)] : undefined,
        query: {
            enabled: !!poolId && !!poolAddress && poolAddress !== '0x0000000000000000000000000000000000000000',
            select: (data): FormattedPoolInfo | undefined => {
                if (!data) return undefined
                const [_poolDetail, _poolBalance, _poolToken, _participants, _winners] = data
                return {
                    id: poolId,
                    detail: {
                        timeStart: Number(_poolDetail.timeStart),
                        timeEnd: Number(_poolDetail.timeEnd),
                        poolAdmin: _poolDetail.poolAdmin,
                        totalWinners: _poolDetail.totalWinners,
                        poolName: _poolDetail.poolName,
                        depositAmountPerPerson: formatUnits(_poolDetail.depositAmountPerPerson, 18),
                        amountPerWinner: formatUnits(_poolDetail.amountPerWinner, 18),
                    },
                    balance: {
                        totalDeposits: formatUnits(_poolBalance.totalDeposits, 18),
                        feesAccumulated: formatUnits(_poolBalance.feesAccumulated, 18),
                        feesCollected: formatUnits(_poolBalance.feesCollected, 18),
                        balance: formatUnits(_poolBalance.balance, 18),
                        sponsored: formatUnits(_poolBalance.sponsored, 18),
                    },
                    tokenAddress: _poolToken,
                    participants: _participants,
                    winners: _winners,
                }
            },
        },
    })
}

/**
 * Hook for reading the details of a specific pool.
 */
export function useGetPoolDetail(poolId: string | undefined) {
    const poolAddress = usePoolAddress()
    return useReadContract({
        address: poolAddress,
        abi: poolAbi,
        functionName: 'getPoolDetail',
        args: poolId ? [BigInt(poolId)] : undefined,
        query: {
            enabled: !!poolId && !!poolAddress && poolAddress !== '0x0000000000000000000000000000000000000000',
            select: (data): FormattedPoolDetail | undefined => {
                if (!data) return undefined
                return {
                    timeStart: Number(data.timeStart),
                    timeEnd: Number(data.timeEnd),
                    poolAdmin: data.poolAdmin,
                    totalWinners: data.totalWinners,
                    poolName: data.poolName,
                    depositAmountPerPerson: formatUnits(data.depositAmountPerPerson, 18),
                    amountPerWinner: formatUnits(data.amountPerWinner, 18),
                }
            },
        },
    })
}

/**
 * Hook for reading the participants of a specific pool.
 */
export function useGetParticipants(poolId: string | undefined) {
    const poolAddress = usePoolAddress()
    return useReadContract({
        address: poolAddress,
        abi: poolAbi,
        functionName: 'getParticipants',
        args: poolId ? [BigInt(poolId)] : undefined,
        query: {
            enabled: !!poolId && !!poolAddress && poolAddress !== '0x0000000000000000000000000000000000000000',
            select: (data: readonly Address[] | undefined) => data ?? undefined,
        },
    })
}

/**
 * Hook for reading the winners of a specific pool.
 */
export function useGetWinners(poolId: string | undefined) {
    const poolAddress = usePoolAddress()
    return useReadContract({
        address: poolAddress,
        abi: poolAbi,
        functionName: 'getWinners',
        args: poolId ? [BigInt(poolId)] : undefined,
        query: {
            enabled: !!poolId && !!poolAddress && poolAddress !== '0x0000000000000000000000000000000000000000',
            select: (data: readonly Address[] | undefined) => data ?? undefined,
        },
    })
}

/**
 * Hook to get a user's deposit for a specific pool.
 */
export function useGetParticipantDeposit(poolId: string | undefined, participantAddress: Address | undefined) {
    const poolAddress = usePoolAddress()
    return useReadContract({
        address: poolAddress,
        abi: poolAbi,
        functionName: 'getParticipantDeposit',
        args: poolId && participantAddress ? [participantAddress, BigInt(poolId)] : undefined,
        query: {
            enabled:
                !!poolId &&
                !!participantAddress &&
                !!poolAddress &&
                poolAddress !== '0x0000000000000000000000000000000000000000',
            select: (data: bigint | undefined) => data,
        },
    })
}

/**
 * Hook for reading the balance of a specific ERC20 token for an address.
 */
export function useTokenBalance(tokenAddress: Address | undefined, ownerAddress: Address | undefined) {
    return useReadContract({
        address: tokenAddress,
        abi: tokenAbi, // Use imported tokenAbi from @/types/contracts
        functionName: 'balanceOf',
        args: ownerAddress ? [ownerAddress] : undefined,
        query: {
            enabled: !!tokenAddress && !!ownerAddress && tokenAddress !== '0x0000000000000000000000000000000000000000',
            select: (data: bigint | undefined) => data ?? BigInt(0),
        },
    })
}

/**
 * Hook for approving an ERC20 token for a spender.
 */
// export function useApproveToken() {  // REMOVED - Moved to use-token-approval.ts
//     const { writeContractAsync, isPending, isSuccess, error, data: hash } = useWriteContract()
//
//     const approveToken = async ({
//         tokenAddress,
//         spenderAddress,
//         amount,
//     }: {
//         tokenAddress: Address
//         spenderAddress: Address
//         amount: string
//     }) => {
//         return writeContractAsync({
//             address: tokenAddress,
//             abi: erc20Abi, // Now uses imported erc20Abi
//             functionName: 'approve',
//             args: [spenderAddress, parseUnits(amount, 18)],
//         })
//     }
//     return {
//         approveToken,
//         isApprovingToken: isPending,
//         isApproveTokenSuccess: isSuccess,
//         approveTokenError: error,
//         approveTokenHash: hash,
//     }
// }
