import { env } from '@/env'
import { formatUnits } from 'viem'

/**
 * Formats a blockchain address by truncating it for display.
 * e.g., 0x1234567890abcdef1234567890abcdef12345678 -> 0x1234...5678
 * @param address The full address string.
 * @returns The truncated address string or an empty string if address is invalid.
 */
export function formatAddress(address?: string): string {
    if (!address || typeof address !== 'string' || !address.startsWith('0x') || address.length < 10) {
        return 'Invalid Address' // Or return address as is, or empty string depending on desired behavior
    }
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

/**
 * Formats a token amount from its smallest unit to a readable string, appending the token symbol.
 * @param amount The raw amount (string or BigInt) in the token's smallest unit.
 * @param decimals The number of decimals the token uses.
 * @param symbol Optional token symbol to append.
 * @returns A formatted string like "123.45 SYMBOL" or "N/A" if inputs are invalid.
 */
export function formatTokenAmount(amount?: string | bigint, decimals?: number, symbol?: string): string {
    if (amount === undefined || amount === null || decimals === undefined || decimals === null) {
        return 'N/A'
    }
    try {
        const amountBigInt = typeof amount === 'string' ? BigInt(amount) : amount
        const formatted = formatUnits(amountBigInt, decimals)
        // Optional: Add more sophisticated number formatting here (e.g., to a certain number of decimal places)
        // const numberFormatted = parseFloat(formatted).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 });
        return symbol ? `${formatted} ${symbol}` : formatted
    } catch (error) {
        console.error('Error formatting token amount:', error)
        return 'Error' // Or a more user-friendly error string
    }
}

interface ExplorerConfig {
    name: string
    baseUrl: string
    addressPath: string
    tokenPath: string
    txPath: string
}

const explorers: Record<number, ExplorerConfig> = {
    8453: {
        // Base Mainnet
        name: 'BaseScan',
        baseUrl: env.NEXT_PUBLIC_BASE_MAINNET_EXPLORER_URL || 'https://basescan.org',
        addressPath: '/address/',
        tokenPath: '/token/',
        txPath: '/tx/',
    },
    84532: {
        // Base Sepolia
        name: 'BaseScan (Sepolia)',
        baseUrl: env.NEXT_PUBLIC_BASE_SEPOLIA_EXPLORER_URL || 'https://sepolia.basescan.org',
        addressPath: '/address/',
        tokenPath: '/token/',
        txPath: '/tx/',
    },
    // Add other chains here, e.g.:
    // 1: { // Ethereum Mainnet
    //     name: 'Etherscan',
    //     baseUrl: 'https://etherscan.io',
    //     addressPath: '/address/',
    //     tokenPath: '/token/',
    //     txPath: '/tx/',
    // },
    // 11155111: { // Sepolia Testnet (Ethereum)
    //     name: 'Etherscan (Sepolia)',
    //     baseUrl: 'https://sepolia.etherscan.io',
    //     addressPath: '/address/',
    //     tokenPath: '/token/',
    //     txPath: '/tx/',
    // }
}

/**
 * Generates a block explorer link for a given chainId, address, and type.
 * @param chainId The chain ID of the network.
 * @param identifier The address or transaction hash.
 * @param type The type of link to generate ('address', 'token', or 'tx').
 * @returns An object with the explorer name and URL, or null if chainId is unsupported or identifier is missing.
 */
export function getExplorerLink(
    chainId?: number,
    identifier?: string,
    type: 'address' | 'token' | 'tx' = 'address',
): { name: string; url: string } | null {
    if (chainId === undefined || identifier === undefined || identifier === null) {
        return null
    }
    const explorer = explorers[chainId]
    if (!explorer) {
        return null // Unsupported chainId
    }

    let pathSegment = ''
    switch (type) {
        case 'address':
            pathSegment = explorer.addressPath
            break
        case 'token':
            pathSegment = explorer.tokenPath
            break
        case 'tx':
            pathSegment = explorer.txPath
            break
        default:
            return null // Invalid type
    }

    return {
        name: explorer.name,
        url: `${explorer.baseUrl}${pathSegment}${identifier}`,
    }
}
