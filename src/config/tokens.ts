import { env } from '@/env'
import { type Address } from 'viem'

export interface TokenConfig {
    symbol: string
    address: Address
    decimals: number
    logo?: string
}

export const PREDEFINED_TOKENS: Record<string, TokenConfig> = {
    usdc: {
        symbol: 'USDC',
        address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Sepolia USDC Faucet
        decimals: 6,
        logo: '/images/tokens/usdc.png',
    },
    droplet: {
        symbol: 'DROP',
        address: env.NEXT_PUBLIC_TOKEN_CONTRACT_BASE_SEPOLIA,
        decimals: 18,
        logo: '/images/tokens/droplet.png',
    },
}
