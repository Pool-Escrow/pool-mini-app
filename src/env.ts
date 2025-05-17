import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
    /**
     * Specify your server-side environment variables schema here. This way you can ensure the app
     * isn't built with invalid env vars.
     */
    server: {
        FARCASTER_HEADER: z.string().min(1),
        FARCASTER_PAYLOAD: z.string().min(1),
        FARCASTER_SIGNATURE: z.string().min(1),
        REDIS_URL: z.string().url(),
        REDIS_TOKEN: z.string(),
        NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    },

    /**
     * Specify your client-side environment variables schema here. This way you can ensure the app
     * isn't built with invalid env vars. To expose them to the client, prefix them with
     * `NEXT_PUBLIC_`.
     */
    client: {
        NEXT_PUBLIC_URL: z.string().url(),
        NEXT_PUBLIC_VERSION: z.string().min(1).default('next'),
        NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME: z.string().min(1),
        NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string().min(1),
        NEXT_PUBLIC_APP_SUBTITLE: z
            .string()
            .regex(/^[a-zA-Z0-9\s.,!?'"&()-]*$/, 'Emojis and restricted symbols are not allowed'),
        NEXT_PUBLIC_APP_DESCRIPTION: z.string(),
        NEXT_PUBLIC_ICON_URL: z.string().url(),
        NEXT_PUBLIC_APP_ICON: z.string().url(),
        NEXT_PUBLIC_APP_SPLASH_IMAGE: z.string().url(),
        NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR: z
            .string()
            .regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color code, e.g., #RRGGBB or #RGB (e.g. #000 for black)'),
        NEXT_PUBLIC_APP_PRIMARY_CATEGORY: z.enum([
            'games',
            'social',
            'finance',
            'utility',
            'productivity',
            'health-fitness',
            'news-media',
            'music',
            'shopping',
            'education',
            'developer-tools',
            'entertainment',
            'art-creativity',
        ]),
        NEXT_PUBLIC_APP_HERO_IMAGE: z.string().url(),
        NEXT_PUBLIC_APP_TAGLINE: z.string().max(30, 'Tagline must be 30 characters or less'),
        NEXT_PUBLIC_APP_OG_TITLE: z.string(),
        NEXT_PUBLIC_APP_OG_DESCRIPTION: z
            .string()
            .regex(/^[a-zA-Z0-9\s.,!?'"&()-]*$/, 'Emojis and restricted symbols are not allowed'),
        NEXT_PUBLIC_APP_OG_IMAGE: z.string().url(),
        NEXT_PUBLIC_ONCHAINKIT_API_KEY: z.string(),

        NEXT_PUBLIC_POOL_CONTRACT_BASE: z.custom<`0x${string}`>(
            val => /^0x[0-9a-fA-F]{40}$/.test(val as string),
            'Must be a valid Ethereum address',
        ),
        NEXT_PUBLIC_POOL_CONTRACT_BASE_SEPOLIA: z.custom<`0x${string}`>(
            val => /^0x[0-9a-fA-F]{40}$/.test(val as string),
            'Must be a valid Ethereum address',
        ),
        NEXT_PUBLIC_TOKEN_CONTRACT_BASE: z.custom<`0x${string}`>(
            val => /^0x[0-9a-fA-F]{40}$/.test(val as string),
            'Must be a valid Ethereum address',
        ),
        NEXT_PUBLIC_TOKEN_CONTRACT_BASE_SEPOLIA: z.custom<`0x${string}`>(
            val => /^0x[0-9a-fA-F]{40}$/.test(val as string),
            'Must be a valid Ethereum address',
        ),
        NEXT_PUBLIC_BASE_MAINNET_RPC_URL: z.string().url().min(1),
        NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL: z.string().url().min(1),
        NEXT_PUBLIC_BASE_MAINNET_EXPLORER_URL: z.string().url().min(1),
        NEXT_PUBLIC_BASE_SEPOLIA_EXPLORER_URL: z.string().url().min(1),
    },

    /**
     * You can't destruct `process.env` as a Next.js server-side environment variable consistently
     * between server and client builds. This is why we need to manually destructure received
     * variables on Next.js environments.
     */
    runtimeEnv: {
        FARCASTER_HEADER: process.env.FARCASTER_HEADER,
        FARCASTER_PAYLOAD: process.env.FARCASTER_PAYLOAD,
        FARCASTER_SIGNATURE: process.env.FARCASTER_SIGNATURE,
        REDIS_URL: process.env.REDIS_URL,
        REDIS_TOKEN: process.env.REDIS_TOKEN,
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
        NEXT_PUBLIC_VERSION: process.env.NEXT_PUBLIC_VERSION,
        NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
        NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
        NEXT_PUBLIC_APP_SUBTITLE: process.env.NEXT_PUBLIC_APP_SUBTITLE,
        NEXT_PUBLIC_APP_DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
        NEXT_PUBLIC_ICON_URL: process.env.NEXT_PUBLIC_ICON_URL,
        NEXT_PUBLIC_APP_ICON: process.env.NEXT_PUBLIC_APP_ICON,
        NEXT_PUBLIC_APP_SPLASH_IMAGE: process.env.NEXT_PUBLIC_APP_SPLASH_IMAGE,
        NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR: process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR,
        NEXT_PUBLIC_APP_PRIMARY_CATEGORY: process.env.NEXT_PUBLIC_APP_PRIMARY_CATEGORY,
        NEXT_PUBLIC_APP_HERO_IMAGE: process.env.NEXT_PUBLIC_APP_HERO_IMAGE,
        NEXT_PUBLIC_APP_TAGLINE: process.env.NEXT_PUBLIC_APP_TAGLINE,
        NEXT_PUBLIC_APP_OG_TITLE: process.env.NEXT_PUBLIC_APP_OG_TITLE,
        NEXT_PUBLIC_APP_OG_DESCRIPTION: process.env.NEXT_PUBLIC_APP_OG_DESCRIPTION,
        NEXT_PUBLIC_APP_OG_IMAGE: process.env.NEXT_PUBLIC_APP_OG_IMAGE,
        NEXT_PUBLIC_ONCHAINKIT_API_KEY: process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY,
        NEXT_PUBLIC_POOL_CONTRACT_BASE: process.env.NEXT_PUBLIC_POOL_CONTRACT_BASE,
        NEXT_PUBLIC_POOL_CONTRACT_BASE_SEPOLIA: process.env.NEXT_PUBLIC_POOL_CONTRACT_BASE_SEPOLIA,
        NEXT_PUBLIC_TOKEN_CONTRACT_BASE: process.env.NEXT_PUBLIC_TOKEN_CONTRACT_BASE,
        NEXT_PUBLIC_TOKEN_CONTRACT_BASE_SEPOLIA: process.env.NEXT_PUBLIC_TOKEN_CONTRACT_BASE_SEPOLIA,
        NEXT_PUBLIC_BASE_MAINNET_RPC_URL: process.env.NEXT_PUBLIC_BASE_MAINNET_RPC_URL,
        NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL: process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL,
        NEXT_PUBLIC_BASE_MAINNET_EXPLORER_URL: process.env.NEXT_PUBLIC_BASE_MAINNET_EXPLORER_URL,
        NEXT_PUBLIC_BASE_SEPOLIA_EXPLORER_URL: process.env.NEXT_PUBLIC_BASE_SEPOLIA_EXPLORER_URL,
    },
    /**
     * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
     * useful for Docker builds.
     */
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
    /**
     * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
     * `SOME_VAR=''` will throw an error.
     */
    emptyStringAsUndefined: true,
})
