import { env } from '@/env'
import { base, baseSepolia } from 'viem/chains'

export interface ChainConfig {
    id: number
    name: string
    rpcUrl: string
    explorerUrl: string
    nativeCurrency: {
        name: string
        symbol: string
        decimals: number
    }
    contracts: {
        pool: `0x${string}`
        token: `0x${string}` // Assuming a primary ERC20 token like USDC for deposits
        // Add other common/shared contract addresses here if needed
    }
    // Read-only viem chain object for convenience
    viemChain: typeof base | typeof baseSepolia
}

export const baseMainnetConfig: ChainConfig = {
    id: base.id,
    name: base.name,
    rpcUrl: env.NEXT_PUBLIC_BASE_MAINNET_RPC_URL,
    explorerUrl: env.NEXT_PUBLIC_BASE_MAINNET_EXPLORER_URL, // Or use base.blockExplorers.default.url if preferred and always matches
    nativeCurrency: base.nativeCurrency,
    contracts: {
        pool: env.NEXT_PUBLIC_POOL_CONTRACT_BASE,
        token: env.NEXT_PUBLIC_TOKEN_CONTRACT_BASE,
    },
    viemChain: base,
}

export const baseSepoliaConfig: ChainConfig = {
    id: baseSepolia.id,
    name: baseSepolia.name,
    rpcUrl: env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL,
    explorerUrl: env.NEXT_PUBLIC_BASE_SEPOLIA_EXPLORER_URL, // Or use baseSepolia.blockExplorers.default.url
    nativeCurrency: baseSepolia.nativeCurrency,
    contracts: {
        pool: env.NEXT_PUBLIC_POOL_CONTRACT_BASE_SEPOLIA,
        token: env.NEXT_PUBLIC_TOKEN_CONTRACT_BASE_SEPOLIA,
    },
    viemChain: baseSepolia,
}

export const supportedChains: Record<number, ChainConfig> = {
    [baseMainnetConfig.id]: baseMainnetConfig,
    [baseSepoliaConfig.id]: baseSepoliaConfig,
}

// Default to Base Mainnet if no specific chain is requested or if the requested one isn't supported
export const defaultChainId: number = baseMainnetConfig.id

export const getChainConfig = (chainId: number | undefined): ChainConfig => {
    if (chainId && supportedChains[chainId]) {
        return supportedChains[chainId]
    }
    return supportedChains[defaultChainId]
}

// Helper to get wagmi/viem chain objects (optional, but can be useful)
// You might need to install viem/chains if not already: bun add viem
// import * as viemChains from 'viem/chains';

// export const getViemChain = (chainId: number | undefined) => {
//   const config = getChainConfig(chainId);
//   if (config.id === viemChains.base.id) return viemChains.base;
//   if (config.id === viemChains.baseSepolia.id) return viemChains.baseSepolia;
//   // Fallback or error if no viem chain matches
//   return viemChains.base; // Defaulting to base mainnet
// }
