import { Button } from '@/components/ui/button' // Assuming Button component is available
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu' // Assuming Dropdown components
import type { ChainConfig } from '@/config/chainConfig'
import { getChainConfig, supportedChains } from '@/config/chainConfig'
import { useChain } from '@/contexts/ChainContext' // Added import
import { ChevronDown } from 'lucide-react' // Assuming lucide-react for icons
import React, { useEffect, useState } from 'react'

export const ChainSelector: React.FC = () => {
    const { selectedChainId, setSelectedChainId, isLoadingChainSwitch } = useChain() // Use context
    const [currentChain, setCurrentChain] = useState<ChainConfig>(getChainConfig(selectedChainId))

    useEffect(() => {
        setCurrentChain(getChainConfig(selectedChainId))
    }, [selectedChainId])

    const handleChainSelect = (chainId: number) => {
        setSelectedChainId(chainId) // Call context's setSelectedChainId
        // console.log(`Chain selected: ${chainId}`)
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant='outline' className='flex items-center' disabled={isLoadingChainSwitch}>
                    {isLoadingChainSwitch ? 'Switching...' : currentChain.name}
                    <ChevronDown className='ml-2 h-4 w-4' />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
                {Object.values(supportedChains).map(chain => (
                    <DropdownMenuItem
                        key={chain.id}
                        onClick={() => handleChainSelect(chain.id)}
                        disabled={chain.id === selectedChainId || isLoadingChainSwitch} // Disable already selected chain or if switching
                    >
                        {chain.name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

// Example of how it might be used in a parent component (e.g. a WalletDisplay or Header)
// const ParentComponent = () => {
//   const [chainId, setChainId] = useState<number>(defaultChainId); // Or from global state

//   // useEffect to handle side effects when chainId changes, e.g., reconnecting wallet, fetching data
//   useEffect(() => {
//     console.log("Selected chain ID in parent: ", chainId);
//     // Potentially call wagmi's switchChain or re-initialize providers here
//   }, [chainId]);

//   return (
//     <div>
//       <p>Current Chain from Parent: {getChainConfig(chainId).name}</p>
//       <ChainSelector selectedChainId={chainId} setSelectedChainId={setChainId} />
//     </div>
//   );
// };
