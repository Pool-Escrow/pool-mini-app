'use client'

import { useEffect, useState } from 'react'
import { createWalletClient, custom } from 'viem'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { base } from 'wagmi/chains'
// import { toast } from 'sonner'

import { sdk } from '@farcaster/frame-sdk'

/**
 * Hook for wallet connection and network management
 */
export function useWallet() {
    // State for SSR
    const [mounted, setMounted] = useState(false)

    // Connect related hooks
    const { connect, connectors } = useConnect()
    const { address: wagmiAddress, isConnected } = useAccount()
    const { disconnect } = useDisconnect()

    // States to store client window information
    const [isWarpcast, setIsWarpcast] = useState(false)
    const [warpcastAddress, setWarpcastAddress] = useState<string | null>(null)
    const [currentChainId, setCurrentChainId] = useState(0)

    // Get the effective address (either from Warpcast or wagmi)
    const address = warpcastAddress || wagmiAddress

    // Initial Warpcast detection and address fetch
    useEffect(() => {
        const initWarpcast = async () => {
            const isMiniApp = await sdk.isInMiniApp()

            if (isMiniApp) {
                console.log('isMiniApp', isMiniApp)
                setIsWarpcast(true)

                try {
                    // Create a viem wallet client for direct interaction
                    const walletClient = createWalletClient({
                        chain: base,
                        transport: custom(window.ethereum),
                    })

                    // Get address directly from Warpcast
                    const addresses = await walletClient.getAddresses()
                    console.log('addresses1', addresses)
                    setWarpcastAddress(addresses[0])
                } catch (error) {
                    console.error('Failed to initialize Warpcast:', error)
                }
            }
        }

        if (!isConnected && mounted) {
            initWarpcast()
        }
    }, [mounted, isConnected])

    // Auto-connect to Warpcast connector if running as miniapp and connector is present
    useEffect(() => {
        if (!mounted || !isWarpcast || isConnected) return
        // Find the Warpcast connector in the connectors array
        const warpcastConnector = connectors.find(c => c.id === 'xyz.farcaster.MiniAppWallet')
        if (warpcastConnector) {
            console.log('Auto-connecting to Warpcast connector', warpcastConnector)
            connect({ connector: warpcastConnector })
        }
    }, [mounted, isWarpcast, isConnected, connectors, connect])

    // Handle mounting and chain ID
    useEffect(() => {
        setMounted(true)

        // Set current chain ID and listen for changes
        if (typeof window !== 'undefined' && window.ethereum) {
            // Set initial chain ID
            if (window.ethereum.networkVersion) {
                setCurrentChainId(Number(window.ethereum.networkVersion))
            }

            // Listen for chain changes
            const handleChainChanged = (chainId: string) => {
                const newChainId = Number(chainId)
                setCurrentChainId(newChainId)
                if (newChainId !== base.id) {
                    // toast.warning('Please switch to Base network')
                    console.log('Please switch to Base network')
                }
            }

            window.ethereum.on('chainChanged', handleChainChanged)

            return () => {
                window.ethereum.removeListener('chainChanged', handleChainChanged)
            }
        }
    }, [])

    // Base chain ID
    const baseChainId = base.id

    // Network management
    const isOnCorrectNetwork = currentChainId === baseChainId

    // Network name for display
    const networkName = 'Base Mainnet'

    // Connect to wallet
    const connectWallet = async () => {
        if (!mounted) return

        try {
            if (isWarpcast) {
                // Create a viem wallet client for direct interaction
                const walletClient = createWalletClient({
                    chain: base,
                    transport: custom(window.ethereum),
                })

                // Get address directly from Warpcast
                // const [address] = await walletClient.getAddresses();
                const addresses = await walletClient.getAddresses()

                console.log('addresses', addresses)
                setWarpcastAddress(addresses[0])
            } else {
                console.log('Warpcast not detected')
                // // For non-Warpcast, use the first available connector
                // const connector = connectors[0]

                // Also connect through wagmi
                // connect({
                //     connector: injected({
                //         target: 'metaMask',
                //     }),
                // })
                // if (connector) {
                //     console.log('connectors', connectors)
                //     //   connect({ connector });
                // }
            }
        } catch (error) {
            console.error('Failed to connect wallet:', error)
        }
    }

    // Disconnect wallet
    const disconnectWallet = () => {
        console.log('disconnecting wallet')
        // if (!mounted) return;
        // setWarpcastAddress(null);
        // disconnect();
    }

    // Switch network
    const switchNetwork = async () => {
        if (!mounted || typeof window === 'undefined' || !window.ethereum) return

        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${baseChainId.toString(16)}` }],
            })
            // toast.success(`Successfully switched to ${networkName}`)
            console.log(`Successfully switched to ${networkName}`)
        } catch (error) {
            // Chain not added, try to add it
            interface SwitchChainError {
                code: number
                message: string
            }

            if ((error as SwitchChainError).code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [
                            {
                                chainId: `0x${baseChainId.toString(16)}`,
                                chainName: 'Base',
                                nativeCurrency: {
                                    name: 'Base',
                                    symbol: 'Base',
                                    decimals: 18,
                                },
                                rpcUrls: ['https://base-rpc.com'],
                                blockExplorerUrls: ['https://basescan.org'],
                            },
                        ],
                    })
                    // toast.success('Successfully added and switched to Base network')
                    console.log('Successfully added and switched to Base network')
                } catch (addError) {
                    console.error('Failed to add network:', addError)
                    // toast.error('Failed to add Base network. Please try again.')
                    console.log('Failed to add Base network. Please try again.')
                }
            } else {
                console.error('Failed to switch network:', error)
                // toast.error('Failed to switch network. Please try again.')
                console.log('Failed to switch network. Please try again.')
            }
        }
    }

    // If not mounted, return a default state for SSR
    if (!mounted) {
        return {
            isWarpcast: false,
            address: undefined,
            isConnected: false,
            isConnecting: false,
            isSwitchingNetwork: false,
            connectWallet,
            disconnect,
            disconnectWallet,
            isOnCorrectNetwork: false,
            currentChainId: 0,
            networkName,
            switchNetwork,
        }
    }

    return {
        isWarpcast,
        address,
        isConnected: Boolean(address),
        isConnecting: false,
        isSwitchingNetwork: false,
        connectWallet,
        disconnect,
        disconnectWallet,
        isOnCorrectNetwork,
        currentChainId,
        networkName,
        switchNetwork,
    }
}
