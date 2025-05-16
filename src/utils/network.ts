// A simple map for now, can be expanded.
// Ensure these base URLs are correct for your supported chains.
const explorers: Record<number, { name: string; url: string }> = {
    1: { name: 'Etherscan', url: 'https://etherscan.io' }, // Ethereum Mainnet
    11155111: { name: 'Sepolia Etherscan', url: 'https://sepolia.etherscan.io' }, // Sepolia
    8453: { name: 'Base Mainnet Explorer', url: 'https://basescan.org' }, // Base Mainnet
    84532: { name: 'Base Sepolia Explorer', url: 'https://sepolia.basescan.org' }, // Base Sepolia
    // Add other chains as needed
}

export function getBlockExplorerLink(
    hashOrAddress: string,
    type: 'transaction' | 'address' | 'token',
    chainId: number,
): string {
    const explorer = explorers[chainId]
    if (!explorer) {
        console.warn(`No explorer configured for chainId: ${chainId}`)
        return '' // Or a default/fallback URL
    }

    const path = type === 'transaction' ? 'tx' : type
    return `${explorer.url}/${path}/${hashOrAddress}`
}
