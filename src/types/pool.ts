export interface Pool {
    // === On-chain Identifiers & Core Data (Post-Creation) ===
    id: string // On-chain pool ID (from createPool return value), stored as string. Primary key in Redis.
    chainId?: number // Network identifier, e.g., 8453 for Base, 84532 for Base Sepolia.

    // === Parameters for Pool Creation (Mirrors Smart Contract `createPool` function) ===
    // These fields are the "source of truth" from the smart contract for CREATING a pool.
    // Client-side types; will be converted for contract interaction (e.g., number to BigInt/uint).
    name: string // Corresponds to `poolName` in contract.
    startTime: number // Corresponds to `timeStart` (Unix timestamp).
    endTime: number // Corresponds to `timeEnd` (Unix timestamp).
    depositAmountPerPerson: number // Corresponds to `depositAmountPerPerson`. MUST be 0 if pool is initially sponsored (no entry fee); can be > 0 otherwise.
    tokenContractAddress: string // Corresponds to `token` (address of the ERC20 token).
    totalWinners: number // Corresponds to `totalWinners` (uint16). Optional; if 0, implies winners/amounts might be set differently or not at all initially.
    amountPerWinner: number // Corresponds to `amountPerWinner`. Optional; if 0 with totalWinners > 0, implies even distribution of balance.

    // === Off-Chain Metadata (Stored in Redis, specific to the pool instance) ===
    selectedImage: string // Identifier or URL for the pool's banner image.
    description: string // Pool description (e.g., max 200 characters).
    rulesLink?: string // Optional link to a page with detailed rules.
    softCap?: number // Optional: A target number of participants or deposits, distinct from `totalWinners`.
    // TODO: Consider adding a flexible field for other giveaway-specific metadata if needed, e.g., `giveawayDetails?: Record<string, any>`
    createdBy?: string // Wallet address of the user who initiated the pool creation in the backend.
    createdAt: string // ISO Date string for when the pool record was created in the database.

    // === UI/Wizard State Helpers (Client-side, temporary, not persisted as core Pool model data) ===
    tempPoolId?: string // Temporary ID used during the multi-step pool creation wizard.
    selectedTokenKey?: string // Key for selected token in wizard, e.g., 'usdc', 'droplet', 'custom'.
    customTokenAddress?: string // Used if selectedTokenKey is 'custom'.
    customTokenSymbol?: string // Used if selectedTokenKey is 'custom'.
    customTokenDecimals?: number // Used if selectedTokenKey is 'custom'.

    // === Read-Only On-Chain Data (Fetched from contract, not for creation/direct update via this interface) ===
    // These fields are populated by reading from the smart contract after pool creation or when displaying pool details.
    onChainPoolAdmin?: string // Fetched `poolAdmin` from the contract's `poolDetail` struct.
    onChainTokenSymbol?: string // Fetched symbol from the token contract (based on `tokenContractAddress`).
    onChainTokenDecimals?: number // Fetched decimals from the token contract.
    totalDeposited?: string // Fetched `totalDeposits` from `poolBalance` struct (string for BigNumber).
    currentBalance?: string // Fetched `balance` from `poolBalance` struct (string for BigNumber).
    participants?: Participant[] // Fetched list of participant addresses and their join details.
    onChainWinners?: string[] // Fetched list of actual winner addresses from the contract.
    winnerDetails?: IPoolWinnerDetail[] // Fetched detailed winner info (amount won, claimed) from contract.

    status?: 'draft' | 'active' | 'completed' | 'cancelled' // Overall pool status, likely derived from on-chain state & off-chain admin input.
    txHash?: string // Transaction hash of the `createPool` call or other significant on-chain state changes.
}

// Participant interface for lists, typically fetched from contract.
export interface Participant {
    address: string // Participant's wallet address.
    depositTxHash?: string // Optional: Transaction hash of their deposit.
    joinedAt: number // Timestamp (seconds) of when they joined/deposited.
    // Detailed participant data like specific deposit amount, fees, refund status
    // would come from `getParticipantDetail` if needed for a specific view.
}

// Represents the structure of winner details fetched from the smart contract.
// Based on the IPool.WinnerDetail struct in the ABI.
export interface IPoolWinnerDetail {
    address: string // The winner's address, added for convenience when mapping arrays
    amountWon: string // Represent uint256 as string (e.g., from ethers.BigNumber.toString()).
    amountClaimed: string // Represent uint256 as string.
    timeWon: number // Represent uint40 as number (Unix timestamp).
}
