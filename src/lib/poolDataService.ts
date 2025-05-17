import { env } from '@/env'
import type { IPoolWinnerDetail, Participant, Pool } from '@/types/pool'
import type { Chain } from 'viem'
import { createPublicClient, erc20Abi, http, isAddressEqual, type Address } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { poolAbi } from '../types/contracts'
import { get as getFromRedis, set as setToRedis } from './redis'

const POOL_CACHE_PREFIX = 'pool:'
const DEFAULT_POOL_TTL_SECONDS = 60 * 60 // 1 hour

// Fields that were stored as ISO strings and need to be converted back to Date objects on retrieval IF they were Dates.
// startTime is now number (Unix timestamp), createdAt is string (ISO).
const RPoolDateStringsToConvert: (keyof Pool)[] = [] // Adjusted: startTime is number, createdAt is string.

const poolReviver = (key: string, value: unknown): unknown => {
    if (RPoolDateStringsToConvert.includes(key as keyof Pool) && typeof value === 'string') {
        const date = new Date(value)
        if (!isNaN(date.getTime())) {
            return date
        }
    }
    // startTime should be a number (Unix timestamp)
    if (key === 'startTime' && typeof value === 'string') {
        const num = Number(value)
        if (!isNaN(num)) return num // If it was stored as stringified number
    }
    if (key === 'startTime' && typeof value === 'number') {
        return value // Already a number
    }
    // createdAt is already a string (ISO format)
    if (key === 'createdAt' && typeof value === 'string') {
        return value
    }
    return value
}

/**
 * Fetches a pool by its ID from the Redis cache.
 * @param poolId The ID of the pool to fetch.
 * @returns The pool data if found in cache, otherwise null.
 */
export const getPoolByIdFromCache = async (poolId: string): Promise<Pool | null> => {
    if (!poolId || !/^[0-9]+$/.test(poolId)) {
        console.warn(`getPoolByIdFromCache called with invalid poolId format: ${poolId}`)
        return null
    }
    const cacheKey = `${POOL_CACHE_PREFIX}${poolId}`
    try {
        const value = await getFromRedis(cacheKey)
        if (value && typeof value === 'string') {
            console.log(`Cache HIT for pool ${poolId}`)
            return JSON.parse(value, poolReviver) as Pool
        }
        console.log(`Cache MISS for pool ${poolId}`)
        return null
    } catch (error: unknown) {
        console.error(`Error fetching pool ${poolId} from cache:`, (error as Error).message)
        return null
    }
}

/**
 * Stores pool data in the Redis cache.
 * @param poolId The ID of the pool.
 * @param poolData The pool data to store. Should conform to the Pool type.
 * @param _ttlSeconds Optional TTL (currently not directly supported by the simplified redis.set, but kept for future use).
 * @returns True if storage was successful, otherwise false.
 */
export const storePoolInCache = async (
    poolId: string,
    poolData: Pool,
    _ttlSeconds: number = DEFAULT_POOL_TTL_SECONDS,
): Promise<boolean> => {
    if (!poolId || !/^[0-9]+$/.test(poolId)) {
        console.warn(`storePoolInCache called with invalid poolId format: ${poolId}`)
        return false
    }
    if (!poolData) {
        console.warn(`storePoolInCache called for pool ${poolId} with no poolData`)
        return false
    }
    const cacheKey = `${POOL_CACHE_PREFIX}${poolId}`
    try {
        const storablePoolData: { [K in keyof Pool]: unknown } = { ...poolData }

        // Ensure startTime is a number
        if (typeof poolData.startTime !== 'number') {
            storablePoolData.startTime = Number(poolData.startTime) || 0
        }

        // createdAt is string (ISO format) as per Pool type
        // Validate it's a proper ISO string, if not, create one
        try {
            // Test if it parses as a valid date
            new Date(poolData.createdAt).toISOString()
            storablePoolData.createdAt = poolData.createdAt
        } catch {
            // If parsing fails, use current time
            console.warn(`Invalid ISO date string in poolData.createdAt: "${poolData.createdAt}". Using current time.`)
            storablePoolData.createdAt = new Date().toISOString()
        }

        const stringValue = JSON.stringify(storablePoolData)
        await setToRedis(cacheKey, stringValue)
        console.log(`Successfully stored pool ${poolId} in cache.`)
        return true
    } catch (error: unknown) {
        console.error(`Error storing pool ${poolId} in cache:`, (error as Error).message)
        return false
    }
}

// Helper to get Viem client (simplified)
const getViemClient = (activeChainId: number) => {
    let targetChain: Chain // Explicitly type Chain from viem
    let rpcUrl: string | undefined

    if (activeChainId === baseSepolia.id) {
        targetChain = baseSepolia
        rpcUrl = env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL
    } else if (activeChainId === base.id) {
        targetChain = base
        rpcUrl = env.NEXT_PUBLIC_BASE_MAINNET_RPC_URL
    } else {
        console.warn(`Unsupported activeChainId: ${activeChainId}. Defaulting to Base Mainnet configuration.`)
        targetChain = base // Default chain
        rpcUrl = env.NEXT_PUBLIC_BASE_MAINNET_RPC_URL // Attempt to use default RPC URL
    }

    if (!rpcUrl) {
        // This error means the specific RPC URL for the determined chain is missing in env
        // or the default RPC URL is missing if an unsupported chainId was provided.
        throw new Error(`RPC URL for chain ${targetChain.name} (ID: ${targetChain.id}) is not configured in @/env.ts`)
    }
    return createPublicClient({
        chain: targetChain,
        transport: http(rpcUrl),
    })
}

const derivePoolStatus = (startTimeSeconds: bigint, endTimeSeconds: bigint): Pool['status'] => {
    const nowSeconds = BigInt(Math.floor(Date.now() / 1000))
    if (nowSeconds < startTimeSeconds) return 'draft'
    if (nowSeconds >= startTimeSeconds && nowSeconds <= endTimeSeconds) return 'active'
    if (nowSeconds > endTimeSeconds) return 'completed'
    return 'draft' // Default or fallback status
}

export const getPoolWithContractFallback = async (poolId: string, activeChainId: number): Promise<Pool | null> => {
    if (!/^[0-9]+$/.test(poolId)) {
        console.warn(`[DataService] getPoolWithContractFallback called with invalid poolId format: ${poolId}`)
        return null
    }

    const poolFromCache = await getPoolByIdFromCache(poolId) // Renamed to avoid conflict
    if (poolFromCache) {
        console.log(`[DataService] Pool ${poolId} found in cache.`)
        return poolFromCache
    }

    console.log(`[DataService] Pool ${poolId} not in cache. Attempting contract fallback.`)

    try {
        const viemClient = getViemClient(activeChainId)
        const currentChainId = viemClient.chain.id

        let actualPoolContractAddress: Address | undefined
        if (currentChainId === base.id) {
            actualPoolContractAddress = env.NEXT_PUBLIC_POOL_CONTRACT_BASE
        } else if (currentChainId === baseSepolia.id) {
            actualPoolContractAddress = env.NEXT_PUBLIC_POOL_CONTRACT_BASE_SEPOLIA
        }

        if (!actualPoolContractAddress) {
            throw new Error(
                `Pool contract address for the active chain ID ${currentChainId} is not configured in @/env.ts. Please check NEXT_PUBLIC_POOL_CONTRACT_BASE or NEXT_PUBLIC_POOL_CONTRACT_BASE_SEPOLIA.`,
            )
        }

        const poolIdBigInt = BigInt(poolId)

        // Fetch all pool info using getAllPoolInfo
        const allInfo = await viemClient.readContract({
            address: actualPoolContractAddress,
            abi: poolAbi,
            functionName: 'getAllPoolInfo',
            args: [poolIdBigInt],
        })
        const [_poolDetail, _poolBalance, _poolTokenAddress, _participantsAddresses, _winnerAddresses] = allInfo

        // Fetch token details if token address is valid
        let onChainTokenSymbol: string | undefined
        let onChainTokenDecimals: number | undefined
        if (
            _poolTokenAddress &&
            !isAddressEqual(_poolTokenAddress, '0x0000000000000000000000000000000000000000' as Address)
        ) {
            try {
                onChainTokenSymbol = await viemClient.readContract({
                    address: _poolTokenAddress,
                    abi: erc20Abi,
                    functionName: 'symbol',
                })
                const decimalsBigInt = await viemClient.readContract({
                    address: _poolTokenAddress,
                    abi: erc20Abi,
                    functionName: 'decimals',
                })
                onChainTokenDecimals = Number(decimalsBigInt)
            } catch (tokenError) {
                console.warn(
                    `[DataService] Could not fetch symbol/decimals for token ${_poolTokenAddress}:`,
                    tokenError,
                )
            }
        }

        // Map participant addresses to Participant objects
        // For now, joinedAt and depositTxHash are placeholders as getAllPoolInfo doesn't provide them directly.
        const onChainParticipants: Participant[] = _participantsAddresses.map((pAddress: Address) => ({
            address: pAddress,
            joinedAt: 0, // Placeholder: Contract's getAllPoolInfo doesn't return individual join times.
            // depositTxHash: undefined, // Placeholder
        }))

        // Fetch detailed winner information
        let winnerDetails: IPoolWinnerDetail[] = []
        if (_winnerAddresses.length > 0) {
            try {
                const details = await viemClient.readContract({
                    address: actualPoolContractAddress,
                    abi: poolAbi,
                    functionName: 'getWinnersDetails',
                    args: [poolIdBigInt],
                })
                // The getWinnersDetails returns [address[], WinnerDetail[]]
                // We need to map them together
                if (details?.[0] && details?.[1]) {
                    const returnedAddresses = details[0] as Address[]
                    const returnedWinnerDetails = details[1] as {
                        amountWon: bigint
                        amountClaimed: bigint
                        timeWon: number
                    }[]
                    winnerDetails = returnedAddresses.map((addr, index) => ({
                        address: addr,
                        amountWon: String(returnedWinnerDetails[index].amountWon),
                        amountClaimed: String(returnedWinnerDetails[index].amountClaimed),
                        timeWon: Number(returnedWinnerDetails[index].timeWon), // timeWon is uint40, fits in number
                    }))
                }
            } catch (winnerError) {
                console.warn(`[DataService] Could not fetch winner details for pool ${poolId}:`, winnerError)
            }
        }

        const startTimeSeconds = BigInt(_poolDetail.timeStart)
        const endTimeSeconds = BigInt(_poolDetail.timeEnd)

        const fetchedPool: Pool = {
            id: poolId, // string
            name: _poolDetail.poolName, // string
            chainId: currentChainId, // number
            tokenContractAddress: _poolTokenAddress, // string (Address)
            onChainTokenSymbol: onChainTokenSymbol, // string | undefined
            onChainTokenDecimals: onChainTokenDecimals, // number | undefined
            depositAmountPerPerson: Number(_poolDetail.depositAmountPerPerson), // number
            totalWinners: Number(_poolDetail.totalWinners), // number
            amountPerWinner: Number(_poolDetail.amountPerWinner), // number
            startTime: Number(startTimeSeconds), // number (Unix timestamp)
            endTime: Number(endTimeSeconds), // number (Unix timestamp)
            status: derivePoolStatus(startTimeSeconds, endTimeSeconds), // 'draft' | 'active' | 'completed' | 'cancelled'
            participants: onChainParticipants, // Participant[]
            onChainWinners: _winnerAddresses as Address[], // string[] (Address[])
            winnerDetails: winnerDetails, // IPoolWinnerDetail[]
            totalDeposited: String(_poolBalance.totalDeposits), // string (BigNumber string)
            currentBalance: String(_poolBalance.balance), // string (BigNumber string)
            onChainPoolAdmin: _poolDetail.poolAdmin, // string (Address)

            // Off-chain metadata - initialize with defaults or fetch from elsewhere if needed
            selectedImage: '', // string - Placeholder
            description: '', // string - Placeholder
            rulesLink: '', // string | undefined - Placeholder
            softCap: 0, // number | undefined - Placeholder
            createdBy: '', // string | undefined - Placeholder, this is usually the backend creator
            createdAt: new Date().toISOString(), // string (ISO Date) - Cache creation time

            // UI/Wizard state helpers - not typically populated from on-chain fetch
            tempPoolId: undefined,
            selectedTokenKey: undefined,
            customTokenAddress: undefined,
            customTokenSymbol: undefined,
            customTokenDecimals: undefined,
            txHash: undefined, // Placeholder, usually set after creation tx
        }

        console.log(`[DataService] Pool ${poolId} fetched from contract. Caching now.`)
        await storePoolInCache(poolId, fetchedPool)
        return fetchedPool
    } catch (error) {
        console.error(`[DataService] Error fetching pool ${poolId} from contract:`, (error as Error).message)
        return null
    }
}

// TODO:
// - TTL for storePoolInCache: Modify redis.ts or use EXPIRE if TTL is critical.
// - Add functions for participant lists, winner lists, etc., with similar caching logic.
// - Consider a mechanism for cache invalidation or more sophisticated update strategies beyond TTL.
