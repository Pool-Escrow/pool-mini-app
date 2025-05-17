'use client'

import { env } from '@/env'
import { MiniKitProvider } from '@coinbase/onchainkit/minikit'
import { sdk } from '@farcaster/frame-sdk'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { base, baseSepolia, type Chain } from 'wagmi/chains'

import { ChainProvider } from '@/contexts/ChainContext'
import { UserRoleProvider } from '@/contexts/UserRoleContext'
import { Toaster } from 'sonner'
import FrameProvider from './frame-provider'

// Create QueryClient outside of component to prevent re-creation
const queryClient = new QueryClient()

// Constants for MiniKit configuration to prevent object recreation
const MINIKIT_CONFIG = {
    appearance: {
        mode: 'auto',
        theme: 'pool-theme',
        name: env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
        logo: env.NEXT_PUBLIC_ICON_URL,
    },
    wallet: {
        display: 'classic',
        preference: 'eoaOnly',
        supportedWallets: {
            frame: true,
        },
    },
} as const

// Types for RainbowKit config and components
interface RainbowKitConfig {
    appName: string
    projectId: string
    chains: readonly [Chain, ...Chain[]]
    transports: Record<number, unknown>
    ssr: boolean
}

interface CachedRainbowKitItems {
    WagmiProvider: React.ComponentType<{ config: RainbowKitConfig; children: React.ReactNode }>
    RainbowKitProvider: React.ComponentType<{ children: React.ReactNode }>
    config: RainbowKitConfig
}

// Module-level cache for RainbowKit config and components
let RCK_CACHE: CachedRainbowKitItems | null = null

/**
 * Lazy loaded RainbowKit providers
 */
const RainbowKitProviders = ({ children }: { children: ReactNode }) => {
    // State to track loading status - initially true if cache is not populated
    const [initializationComplete, setInitializationComplete] = useState(!!RCK_CACHE)

    useEffect(() => {
        if (RCK_CACHE) {
            if (!initializationComplete) setInitializationComplete(true)
            return
        }

        let isMounted = true
        async function loadAndConfigure() {
            try {
                // Only import if we're in browser environment
                if (typeof window !== 'undefined') {
                    const [rainbowModule, wagmiModule] = await Promise.all([
                        import('@rainbow-me/rainbowkit'),
                        import('wagmi'),
                    ])

                    // @ts-expect-error - no types for styles.css
                    await import('@rainbow-me/rainbowkit/styles.css')

                    const config = rainbowModule.getDefaultConfig({
                        appName: env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || 'Pool Mini',
                        projectId: env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
                        chains: [base, baseSepolia] as const,
                        transports: {
                            [base.id]: wagmiModule.http(env.NEXT_PUBLIC_BASE_MAINNET_RPC_URL || undefined),
                            [baseSepolia.id]: wagmiModule.http(env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || undefined),
                        },
                        ssr: true,
                    })

                    if (isMounted) {
                        RCK_CACHE = {
                            config: config as unknown as RainbowKitConfig,
                            WagmiProvider: wagmiModule.WagmiProvider as unknown as React.ComponentType<{
                                config: RainbowKitConfig
                                children: React.ReactNode
                            }>,
                            RainbowKitProvider: rainbowModule.RainbowKitProvider,
                        }
                        setInitializationComplete(true)
                    }
                }
            } catch (error) {
                console.error('Failed to load RainbowKit:', error)
                if (isMounted) {
                    // Potentially set an error state here if needed
                    setInitializationComplete(true) // Still mark as complete to avoid infinite loading on error
                }
            }
        }

        void loadAndConfigure()

        return () => {
            isMounted = false
        }
    }, [initializationComplete])

    if (!initializationComplete || !RCK_CACHE) {
        return (
            <div className='flex min-h-screen items-center justify-center'>
                <div className='rounded-md bg-blue-50 p-4'>
                    <div className='flex'>
                        <div className='flex-shrink-0'>
                            <svg className='h-5 w-5 text-blue-400' viewBox='0 0 20 20' fill='currentColor'>
                                <path
                                    fillRule='evenodd'
                                    d='M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm-.5-5a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1a.5.5 0 01.5-.5zm0-4a.5.5 0 100 1 .5.5 0 000-1z'
                                    clipRule='evenodd'
                                />
                            </svg>
                        </div>
                        <div className='ml-3'>
                            <h3 className='text-sm font-medium text-blue-800'>Loading wallet connectors...</h3>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Render with all components available from cache
    const { WagmiProvider, RainbowKitProvider: RKProviderComponentFromCache, config: cachedConfig } = RCK_CACHE

    return (
        <WagmiProvider config={cachedConfig}>
            <QueryClientProvider client={queryClient}>
                <RKProviderComponentFromCache>
                    <ChainProvider>{children}</ChainProvider>
                </RKProviderComponentFromCache>
            </QueryClientProvider>
        </WagmiProvider>
    )
}

/**
 * A provider component that conditionally renders either MiniKit or RainbowKit
 * based on whether the app is running inside a Farcaster MiniApp environment.
 */
export function DynamicWalletProviders({ children }: { children: ReactNode }) {
    const [isMiniApp, setIsMiniApp] = useState<boolean | undefined>(undefined)
    const [, setCheckError] = useState<Error | null>(null)

    // Only run MiniApp check once on mount
    useEffect(() => {
        let isMounted = true

        async function checkMiniApp() {
            try {
                const inMiniApp = await sdk.isInMiniApp()

                if (isMounted) {
                    setIsMiniApp(inMiniApp)
                    // Only log once during initialization, not on every render
                    if (process.env.NODE_ENV !== 'production') {
                        console.log(
                            '[Providers] MiniApp detection complete:',
                            inMiniApp ? 'Running in MiniApp' : 'Running in browser',
                        )
                    }
                }
            } catch (error) {
                if (isMounted) {
                    console.error('Error detecting MiniApp environment:', error)
                    setCheckError(error instanceof Error ? error : new Error(String(error)))
                    setIsMiniApp(false) // Default to browser on error
                }
            }
        }

        void checkMiniApp()

        // Cleanup function to prevent state updates if component unmounts during async check
        return () => {
            isMounted = false
        }
    }, [])

    // Common app structure used in both paths
    const coreAppStructure = useMemo(
        () => (
            <UserRoleProvider>
                {children}
                <Toaster />
            </UserRoleProvider>
        ),
        [children],
    )

    // Show loading state during initialization
    if (isMiniApp === undefined) {
        return (
            <div className='flex min-h-screen items-center justify-center'>
                <div className='rounded-md bg-blue-50 p-4'>
                    <div className='flex'>
                        <div className='flex-shrink-0'>
                            <svg className='h-5 w-5 text-blue-400' viewBox='0 0 20 20' fill='currentColor'>
                                <path
                                    fillRule='evenodd'
                                    d='M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm-.5-5a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1a.5.5 0 01.5-.5zm0-4a.5.5 0 100 1 .5.5 0 000-1z'
                                    clipRule='evenodd'
                                />
                            </svg>
                        </div>
                        <div className='ml-3'>
                            <h3 className='text-sm font-medium text-blue-800'>Initializing wallet providers...</h3>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Handle MiniApp environment
    if (isMiniApp) {
        return (
            <MiniKitProvider apiKey={env.NEXT_PUBLIC_ONCHAINKIT_API_KEY} chain={base} config={MINIKIT_CONFIG}>
                <FrameProvider>
                    <ChainProvider>{coreAppStructure}</ChainProvider>
                </FrameProvider>
            </MiniKitProvider>
        )
    }

    // Handle browser environment - use lazy-loaded RainbowKit
    return <RainbowKitProviders>{coreAppStructure}</RainbowKitProviders>
}
