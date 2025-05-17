'use client'

import { defaultChainId } from '@/config/chainConfig'
import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import { useAccount, useSwitchChain } from 'wagmi'

interface ChainContextType {
    selectedChainId: number
    setSelectedChainId: (chainId: number) => void
    isLoadingChainSwitch: boolean
}

const ChainContext = createContext<ChainContextType | undefined>(undefined)

export const ChainProvider = ({ children }: { children: ReactNode }) => {
    const { chain: connectedWalletChain } = useAccount()
    const { switchChain, isPending: isSwitchingChainWagmi } = useSwitchChain()

    const [selectedChainId, setSelectedChainIdState] = useState<number>(connectedWalletChain?.id ?? defaultChainId)
    const [isLoadingChainSwitch, setIsLoadingChainSwitch] = useState(false)

    // Update selectedChainId if wallet's connected chain changes externally
    useEffect(() => {
        if (connectedWalletChain && connectedWalletChain.id !== selectedChainId) {
            setSelectedChainIdState(connectedWalletChain.id)
        }
    }, [connectedWalletChain, selectedChainId])

    const handleSetSelectedChainId = (newChainId: number) => {
        setSelectedChainIdState(newChainId)
        if (switchChain && connectedWalletChain?.id !== newChainId) {
            setIsLoadingChainSwitch(true)
            switchChain(
                { chainId: newChainId },
                {
                    onSuccess: () => setIsLoadingChainSwitch(false),
                    onError: () => setIsLoadingChainSwitch(false),
                },
            )
        } else if (!switchChain && connectedWalletChain?.id !== newChainId) {
            // If wagmi's switchChain isn't available but we need to switch (e.g. not connected yet, but want to set a default)
            // This case might need more robust handling depending on desired UX when wallet not connected
            console.warn('Wagmi switchChain not available, but chain selection changed.')
        }
    }

    // Consolidate loading state
    const finalIsLoading = isLoadingChainSwitch || isSwitchingChainWagmi

    return (
        <ChainContext.Provider
            value={{
                selectedChainId,
                setSelectedChainId: handleSetSelectedChainId,
                isLoadingChainSwitch: finalIsLoading,
            }}>
            {children}
        </ChainContext.Provider>
    )
}

export const useChain = (): ChainContextType => {
    const context = useContext(ChainContext)
    if (context === undefined) {
        throw new Error('useChain must be used within a ChainProvider')
    }
    return context
}
