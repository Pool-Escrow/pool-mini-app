'use client'

import { useEffect, useRef, useState } from 'react'
import { createWalletClient, custom } from 'viem'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { base } from 'wagmi/chains'
// import { toast } from 'sonner'

import { sdk } from '@farcaster/frame-sdk'

const MANUAL_DISCONNECT_KEY = 'poolMiniUserManuallyDisconnected'
const CONNECTION_ATTEMPT_TRACKER = '_connectionAttemptInProgress'

/**
 * Helper function for consistent and controlled debug logging
 */
const debugLog = (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') {
        console.log(`[wallet] ${message}`, ...args)
    }
}

/**
 * Hook for wallet connection and network management
 */
export function useWallet() {
    // State for SSR
    const [mounted, setMounted] = useState(false)

    // State to track if we're currently in a connection attempt to prevent duplicates
    const [isConnectingState, setIsConnectingState] = useState(false)

    // Track whether we've attempted auto-connection to avoid multiple attempts
    const autoConnectAttempted = useRef(false)
    const warpcastDetectionAttempted = useRef(false)

    // Connect related hooks
    const { connect, connectors, error: connectError, isPending: isConnectingHook } = useConnect()
    const { address: wagmiAddress, isConnected, connector: activeConnector } = useAccount()
    const { disconnect: wagmiDisconnect } = useDisconnect()

    // States to store client window information
    const [isWarpcast, setIsWarpcast] = useState(false)
    const [warpcastAddress, setWarpcastAddress] = useState<string | null>(null)
    const [currentChainId, setCurrentChainId] = useState(0)

    // Get the effective address (either from Warpcast or wagmi)
    const address = warpcastAddress ?? wagmiAddress

    // Track all connection states together
    const isConnecting = isConnectingHook || isConnectingState

    // Reset connection attempt tracker when connecting state changes to false
    useEffect(() => {
        if (!isConnectingHook && typeof window !== 'undefined') {
            localStorage.removeItem(CONNECTION_ATTEMPT_TRACKER)
            setIsConnectingState(false)
        }
    }, [isConnectingHook])

    // Initial Warpcast detection and address fetch - only run once on mount
    useEffect(() => {
        const initWarpcast = async () => {
            try {
                // Only check for MiniApp status if we haven't already detected it AND haven't attempted
                if (!warpcastDetectionAttempted.current) {
                    warpcastDetectionAttempted.current = true

                    const isMiniApp = await sdk.isInMiniApp()

                    if (isMiniApp) {
                        debugLog('isMiniApp detected:', isMiniApp)
                        setIsWarpcast(true)

                        // Only try to get addresses if in MiniApp mode
                        if (typeof window !== 'undefined' && window.ethereum) {
                            try {
                                // Create a viem wallet client for direct interaction
                                const walletClient = createWalletClient({
                                    chain: base,
                                    transport: custom(window.ethereum),
                                })

                                // Get address directly from Warpcast
                                const addresses = await walletClient.getAddresses()
                                if (addresses.length > 0) {
                                    debugLog('Warpcast addresses:', addresses)
                                    setWarpcastAddress(addresses[0])
                                }
                            } catch (error) {
                                console.error('Failed to get addresses from Warpcast:', error)
                            }
                        }
                    } else {
                        // Not in MiniApp mode
                        debugLog('Not running in MiniApp, will use RainbowKit')
                        setIsWarpcast(false)
                    }
                }
            } catch (error) {
                console.error('Failed to initialize Warpcast detection:', error)
                // Ensure flag is also set in case of error to prevent retries if appropriate
                if (warpcastDetectionAttempted.current === false) {
                    warpcastDetectionAttempted.current = true
                }
                setIsWarpcast(false)
            }
        }

        // Only run the detection once we're mounted and if not already connected
        if (mounted && !isConnected) {
            void initWarpcast()
        }
    }, [mounted, isConnected])

    // Auto-connect to Warpcast connector if running as miniapp and connector is present
    useEffect(() => {
        if (!mounted || !isWarpcast || isConnected || isConnecting || autoConnectAttempted.current) return
        if (typeof window !== 'undefined') {
            // Check if auto-connection is disabled
            if (localStorage.getItem(MANUAL_DISCONNECT_KEY) === 'true') return

            // Check if connection attempt is already in progress
            if (localStorage.getItem(CONNECTION_ATTEMPT_TRACKER) === 'true') return

            // Set the connection attempt tracker
            localStorage.setItem(CONNECTION_ATTEMPT_TRACKER, 'true')
            setIsConnectingState(true)

            // Mark that we've attempted auto-connection
            autoConnectAttempted.current = true
        }

        // Find the Warpcast connector in the connectors array
        const warpcastConnector = connectors.find(c => c.id === 'xyz.farcaster.MiniAppWallet')
        if (warpcastConnector) {
            debugLog('Auto-connecting to Warpcast connector', warpcastConnector.name)
            void connect({ connector: warpcastConnector })
        }
    }, [mounted, isWarpcast, isConnected, connectors, connect, isConnecting])

    // Handle mounting, chain ID, and general auto-reconnection
    useEffect(() => {
        setMounted(true)

        // General auto-reconnection logic (non-Warpcast)
        if (
            typeof window !== 'undefined' &&
            !autoConnectAttempted.current &&
            localStorage.getItem(MANUAL_DISCONNECT_KEY) !== 'true' && // Corrected Check for manual disconnect flag
            mounted &&
            !isConnected &&
            !isWarpcast &&
            !isConnecting &&
            connectors.length > 0
        ) {
            const wasConnected = localStorage.getItem('isWalletConnected') === 'true'
            const lastConnectorId = localStorage.getItem('lastConnectedConnectorId')

            // Check if connection attempt is already in progress
            if (localStorage.getItem(CONNECTION_ATTEMPT_TRACKER) === 'true') return

            if (wasConnected && lastConnectorId) {
                // Set the connection attempt tracker
                localStorage.setItem(CONNECTION_ATTEMPT_TRACKER, 'true')
                setIsConnectingState(true)

                // Mark that we've attempted auto-connection
                autoConnectAttempted.current = true

                const connectorToReconnect = connectors.find(c => c.id === lastConnectorId)
                if (connectorToReconnect) {
                    debugLog('Attempting to auto-reconnect to:', connectorToReconnect.name)
                    void connect({ connector: connectorToReconnect })
                }
                // If connector not found, localStorage will be cleared by the other useEffect when isConnected remains false
            }
        }

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
                    debugLog('Please switch to Base network')
                }
            }

            window.ethereum.on('chainChanged', handleChainChanged)

            return () => {
                if (typeof window !== 'undefined' && window.ethereum) {
                    window.ethereum.removeListener('chainChanged', handleChainChanged)
                }
            }
        }
    }, [mounted, isConnected, activeConnector, connect, connectors, isWarpcast, isConnecting])

    // Update localStorage on connection status change
    useEffect(() => {
        if (typeof window !== 'undefined' && mounted) {
            if (isConnected && activeConnector) {
                localStorage.setItem('isWalletConnected', 'true')
                localStorage.setItem('lastConnectedConnectorId', activeConnector.id)
                localStorage.removeItem(MANUAL_DISCONNECT_KEY) // Clear manual disconnect flag on successful connection
                localStorage.removeItem(CONNECTION_ATTEMPT_TRACKER) // Clear connection attempt tracker
                debugLog('Wallet connected, saved to localStorage:', activeConnector.name, activeConnector.id)
            } else if (!isConnected) {
                // Only clear if not actively trying to connect
                // and if there was no recent connect error that might resolve.
                // This prevents clearing localStorage during an auto-reconnect attempt that might fail then succeed.
                const stillAttemptingConnect =
                    isConnecting || (connectError && localStorage.getItem('isWalletConnected') === 'true')

                if (!stillAttemptingConnect) {
                    const wasConnectedPreviously = localStorage.getItem('isWalletConnected') === 'true'
                    // Do not clear MANUAL_DISCONNECT_KEY here, only when connecting successfully
                    if (wasConnectedPreviously) {
                        // Only log/clear if it was previously set
                        localStorage.removeItem('isWalletConnected')
                        localStorage.removeItem('lastConnectedConnectorId')
                        // Always clear the connection attempt tracker when disconnecting
                        localStorage.removeItem(CONNECTION_ATTEMPT_TRACKER)
                        debugLog(
                            'Wallet disconnected or connection failed, cleared from localStorage (keeping manual disconnect if set)',
                        )
                    }
                }
            }
        }
    }, [mounted, isConnected, activeConnector, isConnecting, connectError])

    // Base chain ID
    const baseChainId = base.id

    // Network management
    const isOnCorrectNetwork = currentChainId === baseChainId

    // Network name for display
    const networkName = 'Base Mainnet'

    // Connect to wallet
    const connectWallet = (connectorId?: string) => {
        debugLog('connectWallet called. Mounted:', mounted, 'IsConnected:', isConnected, 'IsConnecting:', isConnecting)

        if (!mounted || isConnected || isConnecting) {
            debugLog('connectWallet: Aborting due to mounted/isConnected/isConnecting status.')
            return
        }

        // Prevent connection if manually disconnected
        const wasManuallyDisconnected =
            typeof window !== 'undefined' && localStorage.getItem(MANUAL_DISCONNECT_KEY) === 'true'
        debugLog('connectWallet: wasManuallyDisconnected:', wasManuallyDisconnected)

        if (wasManuallyDisconnected) {
            debugLog('connectWallet: Connection prevented: Wallet was manually disconnected.')
            return
        }

        try {
            // Set connecting state to prevent multiple attempts
            setIsConnectingState(true)
            if (typeof window !== 'undefined') {
                localStorage.setItem(CONNECTION_ATTEMPT_TRACKER, 'true')
            }

            if (isWarpcast) {
                const warpcastConnector = connectors.find(c => c.id === 'xyz.farcaster.MiniAppWallet')
                if (warpcastConnector) {
                    void connect({ connector: warpcastConnector }) // Successful connect will clear MANUAL_DISCONNECT_KEY via useEffect
                } else {
                    console.error('Warpcast connector not found for manual connection.')
                    setIsConnectingState(false)
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem(CONNECTION_ATTEMPT_TRACKER)
                    }
                }
            } else {
                // For RainbowKit, we might have a preferred connector ID or use the most common ones as fallbacks
                const connectorToUse = connectorId
                    ? connectors.find(c => c.id === connectorId)
                    : (connectors.find(c => c.id === 'io.metamask') ??
                      connectors.find(c => c.id === 'coinbaseWallet') ??
                      (connectors.length > 0 ? connectors[0] : undefined))

                if (connectorToUse) {
                    debugLog('Attempting to connect with:', connectorToUse.name)
                    void connect({ connector: connectorToUse }) // Successful connect will clear MANUAL_DISCONNECT_KEY via useEffect
                } else {
                    console.error('No suitable connector found for manual connection.')
                    setIsConnectingState(false)
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem(CONNECTION_ATTEMPT_TRACKER)
                    }
                }
            }
        } catch (error) {
            console.error('Failed to connect wallet:', error)
            setIsConnectingState(false)
            if (typeof window !== 'undefined') {
                localStorage.removeItem(CONNECTION_ATTEMPT_TRACKER)
            }
        }
    }

    // Disconnect wallet
    const disconnectWallet = () => {
        if (!mounted) return
        debugLog('Disconnecting wallet (custom function)')
        if (typeof window !== 'undefined') {
            localStorage.setItem(MANUAL_DISCONNECT_KEY, 'true') // Set manual disconnect flag
            localStorage.removeItem(CONNECTION_ATTEMPT_TRACKER) // Clear connection attempt tracker
        }
        autoConnectAttempted.current = true // Explicitly prevent further auto-connections this session
        if (isWarpcast) {
            setWarpcastAddress(null)
        }
        setIsConnectingState(false)
        wagmiDisconnect() // This will trigger the useEffect watching isConnected to clear other localStorage items

        // also disconnect each connector
        connectors.forEach(connector => {
            if (connector.disconnect) {
                // Check if disconnect method exists
                try {
                    void connector.disconnect()
                } catch (e) {
                    console.warn(`Error disconnecting connector ${connector.name}:`, e)
                }
            }
        })
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
            debugLog(`Successfully switched to ${networkName}`)
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
                    debugLog('Successfully added and switched to Base network')
                } catch (addError) {
                    console.error('Failed to add network:', addError)
                    // toast.error('Failed to add Base network. Please try again.')
                    debugLog('Failed to add Base network. Please try again.')
                }
            } else {
                console.error('Failed to switch network:', error)
                // toast.error('Failed to switch network. Please try again.')
                debugLog('Failed to switch network. Please try again.')
            }
        }
    }

    // If not mounted, return a default state for SSR
    if (!mounted) {
        return {
            isWarpcast: false,
            address: undefined,
            isConnected: false,
            isConnecting: isConnecting,
            isSwitchingNetwork: false,
            connectWallet,
            disconnect: disconnectWallet,
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
        isConnecting: isConnecting,
        isSwitchingNetwork: false,
        connectWallet,
        disconnect: disconnectWallet,
        isOnCorrectNetwork,
        currentChainId,
        networkName,
        switchNetwork,
    }
}
