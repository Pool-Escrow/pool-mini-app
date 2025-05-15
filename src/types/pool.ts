export interface Pool {
    id: string
    selectedImage: string // Or a more specific type if images are predefined IDs
    name: string
    description: string
    // New on-chain properties from parent task 6
    contractAddress?: string
    tokenAddress?: string
    tokenSymbol?: string
    tokenDecimals?: number
    depositAmount: number // Renamed from buyIn, type changed to number to match form step
    maxEntries: number // Renamed from softCap
    amountPerWinner: number // Added to match form step and contract requirements
    totalDeposited?: string // Total amount currently deposited in the pool
    winnerCount?: number
    status?: 'draft' | 'active' | 'completed' | 'cancelled' // Pool status based on on-chain state or admin input
    participants?: Participant[]
    winners?: string[] // Array of winner addresses
    txHash?: string // Transaction hash of pool creation or a significant state change
    // UI/Wizard state helper
    selectedTokenKey?: string // e.g., 'usdc', 'droplet', 'custom' - for wizard state
    customTokenAddress?: string // Added for wizard state if selectedTokenKey is 'custom'
    // Existing properties
    rulesLink: string
    createdAt: Date
    registrations: number
    startTime: Date
    registrationStart: string
    registrationEnd: string
    registrationEnabled: boolean
}

// New Participant interface from parent task 6
export interface Participant {
    address: string // Participant's wallet address
    depositTxHash?: string // Transaction hash of their deposit
    joinedAt: number // Timestamp of when they joined
    isWinner?: boolean // Flag indicating if this participant is a winner
    hasClaimed?: boolean // Flag indicating if the winner has claimed their prize
}
