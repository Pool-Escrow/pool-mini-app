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
        address: '0x0165878A594ca255338adfa4d48449f69242Eb8F', // Placeholder Sepolia Test ERC20, replace as needed
        decimals: 18,
        logo: '/images/tokens/droplet.png',
    },
}
