import type { Participant, Pool } from '@/types/pool'
import { formatUnits } from 'viem'

// Mock data for testing
export const mockParticipant: Participant = {
    address: '0x1234567890123456789012345678901234567890',
    joinedAt: Date.now(),
}

export const mockPool: Pool = {
    id: '1',
    name: 'Test Pool',
    description: 'A test pool for unit testing',
    chainId: 8453, // Base mainnet
    tokenContractAddress: '0x2222222222222222222222222222222222222222',
    onChainTokenSymbol: 'TEST',
    onChainTokenDecimals: 18,
    depositAmountPerPerson: 100,
    totalWinners: 5,
    amountPerWinner: 500,
    startTime: Math.floor(Date.now() / 1000), // Current time in seconds
    endTime: Math.floor(Date.now() / 1000) + 86400, // 24 hours from now
    status: 'active',
    participants: [mockParticipant],
    onChainWinners: [],
    winnerDetails: [],
    totalDeposited: formatUnits(BigInt(100), 18),
    currentBalance: formatUnits(BigInt(100), 18),
    onChainPoolAdmin: '0x3333333333333333333333333333333333333333',
    selectedImage: '/images/test-pool.jpg',
    createdBy: '0x4444444444444444444444444444444444444444',
    createdAt: new Date().toISOString(),
    softCap: 100,
}

// Helper function to create a pool with custom overrides
export const createMockPool = (overrides: Partial<Pool> = {}): Pool => ({
    id: '1',
    name: 'Test Pool',
    description: 'A test pool for unit testing',
    chainId: 8453, // Base mainnet
    tokenContractAddress: '0x2222222222222222222222222222222222222222',
    onChainTokenSymbol: 'TEST',
    onChainTokenDecimals: 18,
    depositAmountPerPerson: 100,
    totalWinners: 5,
    amountPerWinner: 500,
    startTime: Math.floor(Date.now() / 1000), // Current time in seconds
    endTime: Math.floor(Date.now() / 1000) + 86400, // 24 hours from now
    status: 'active',
    selectedImage: '/images/default-pool-banner.jpg',
    createdAt: new Date().toISOString(),
    ...overrides,
})

// Helper function to create multiple mock pools
export const createMockPools = (count: number, baseOverrides: Partial<Pool> = {}): Pool[] => {
    return Array.from({ length: count }, (_, i) => ({
        ...mockPool,
        ...baseOverrides,
        id: String(i + 1),
        name: `Test Pool ${i + 1}`,
    }))
}

// Mock contract responses
export const mockContractResponses = {
    getAllPoolInfo: [
        {
            timeStart: BigInt(Math.floor(Date.now() / 1000)),
            timeEnd: BigInt(Math.floor(Date.now() / 1000) + 86400),
            poolAdmin: '0x3333333333333333333333333333333333333333',
            totalWinners: 5,
            poolName: 'Test Pool',
            depositAmountPerPerson: BigInt(100),
            amountPerWinner: BigInt(500),
        },
        {
            totalDeposits: BigInt(100),
            feesAccumulated: BigInt(0),
            feesCollected: BigInt(0),
            balance: BigInt(100),
            sponsored: BigInt(0),
        },
        '0x2222222222222222222222222222222222222222',
        ['0x1234567890123456789012345678901234567890'],
        [],
    ],
}

// Mock error responses
export const mockErrors = {
    userRejected: { code: 4001, message: 'User rejected the request' },
    insufficientFunds: { code: -32000, message: 'Insufficient funds for gas * price + value' },
    networkError: { message: 'Network connection error' },
}

// Mock event data
export const mockEvents = {
    deposit: {
        args: {
            poolId: BigInt(1),
            participant: '0x1234567890123456789012345678901234567890',
            amount: BigInt(100),
        },
        eventName: 'Deposit',
    },
    poolCreated: {
        args: {
            poolId: BigInt(1),
            admin: '0x3333333333333333333333333333333333333333',
        },
        eventName: 'PoolCreated',
    },
}

// Mock blockchain data
export const mockBlockchainData = {
    blockNumber: 12345678,
    timestamp: Math.floor(Date.now() / 1000),
    hash: '0x5555555555555555555555555555555555555555555555555555555555555555',
}

// Test IDs for components
export const testIds = {
    poolCard: 'pool-card',
    poolDashboard: 'pool-dashboard',
    poolList: 'pool-list',
    joinPoolForm: 'join-pool-form',
    participantsList: 'participants-list',
}
