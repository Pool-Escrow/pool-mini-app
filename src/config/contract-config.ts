import { env } from '@/env'
import { base, baseSepolia } from 'wagmi/chains'

// Types
type ContractAddresses = Record<number, `0x${string}`>

const POOL_CONTRACT_ADDRESSES: ContractAddresses = {
    [base.id]: env.NEXT_PUBLIC_POOL_CONTRACT_BASE,
    [baseSepolia.id]: env.NEXT_PUBLIC_POOL_CONTRACT_BASE_SEPOLIA,
    // Add other chains here if needed
}

const TOKEN_CONTRACT_ADDRESSES: ContractAddresses = {
    [base.id]: env.NEXT_PUBLIC_TOKEN_CONTRACT_BASE,
    [baseSepolia.id]: env.NEXT_PUBLIC_TOKEN_CONTRACT_BASE_SEPOLIA,
}

/**
 * Retrieves the Pool contract address for a given chainId.
 * Falls back to a default or placeholder if not found or in a non-browser environment.
 * @param chainId The chainId for which to get the contract address.
 * @returns The contract address or a placeholder.
 */
export const getPoolContractAddress = (chainId?: number): `0x${string}` => {
    if (typeof window === 'undefined' || !chainId) {
        // Default to Base mainnet address or a placeholder if chainId is not available
        // This helps prevent errors during server-side rendering or when chainId is undefined
        return POOL_CONTRACT_ADDRESSES[base.id] || '0x0000000000000000000000000000000000000000'
    }
    return POOL_CONTRACT_ADDRESSES[chainId] || '0x0000000000000000000000000000000000000000'
}

/**
 * Retrieves the Token contract address for a given chainId.
 * Falls back to a default or placeholder if not found or in a non-browser environment.
 * @param chainId The chainId for which to get the contract address.
 * @returns The contract address or a placeholder.
 */
export const getTokenContractAddress = (chainId?: number): `0x${string}` => {
    if (typeof window === 'undefined' || !chainId) {
        return TOKEN_CONTRACT_ADDRESSES[base.id] || '0x0000000000000000000000000000000000000000'
    }
    return TOKEN_CONTRACT_ADDRESSES[chainId] || '0x0000000000000000000000000000000000000000'
}

export const CONTRACT_CONFIG = {
    supportedChains: [base, baseSepolia],
    getPoolContractAddress,
    getTokenContractAddress,
    POOL_CONTRACT_ADDRESSES,
    TOKEN_CONTRACT_ADDRESSES,
}

// Log for debugging purposes (optional, can be removed)
if (typeof window !== 'undefined') {
    console.log('CONTRACT_CONFIG loaded:', CONTRACT_CONFIG)
    console.log('Pool Mainnet Address:', POOL_CONTRACT_ADDRESSES[base.id])
    console.log('Pool Sepolia Address:', POOL_CONTRACT_ADDRESSES[baseSepolia.id])
}
