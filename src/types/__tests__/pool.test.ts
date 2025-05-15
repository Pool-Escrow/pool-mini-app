import type { Participant, Pool } from '../pool'

describe('Pool Interface', () => {
    it('should allow creating a basic Pool object', () => {
        const pool: Pool = {
            id: 'pool1',
            selectedImage: '/img/template-1.jpg',
            name: 'Test Pool',
            description: 'A simple test pool',
            depositAmount: 10,
            maxEntries: 100,
            amountPerWinner: 10,
            rulesLink: 'http://example.com/rules',
            createdAt: new Date('2024-01-01T00:00:00.000Z'),
            registrations: 5,
            startTime: new Date('2024-02-01T12:00:00.000Z'),
            registrationStart: new Date('2024-01-15T00:00:00.000Z').toISOString(),
            registrationEnd: new Date('2024-01-30T23:59:59.000Z').toISOString(),
            registrationEnabled: true,
        }
        expect(pool.id).toBe('pool1')
        expect(pool.name).toBe('Test Pool')
    })

    it('should allow creating a Pool object with new on-chain properties', () => {
        const participant1: Participant = {
            address: '0x123',
            joinedAt: Date.now(),
        }
        const pool: Pool = {
            id: 'pool2',
            selectedImage: '/img/template-2.jpg',
            name: 'On-Chain Test Pool',
            description: 'A test pool with on-chain data',
            depositAmount: 0.5,
            maxEntries: 50,
            amountPerWinner: 0.5,
            rulesLink: 'http://example.com/rules2',
            createdAt: new Date('2024-03-01T00:00:00.000Z'),
            registrations: 10,
            startTime: new Date('2024-04-01T12:00:00.000Z'),
            registrationStart: new Date('2024-03-15T00:00:00.000Z').toISOString(),
            registrationEnd: new Date('2024-03-30T23:59:59.000Z').toISOString(),
            registrationEnabled: false,
            // On-chain fields
            contractAddress: '0xabc123',
            tokenAddress: '0xdef456',
            tokenSymbol: 'TST',
            tokenDecimals: 18,
            totalDeposited: '5000 TST',
            winnerCount: 0,
            status: 'draft',
            participants: [participant1],
            winners: [],
            txHash: '0xzyxw987',
        }
        expect(pool.contractAddress).toBe('0xabc123')
        expect(pool.status).toBe('draft')
        expect(pool.participants?.length).toBe(1)
    })

    it('should allow optional on-chain properties to be undefined', () => {
        const pool: Pool = {
            id: 'pool3',
            selectedImage: '/img/template-3.jpg',
            name: 'Minimal On-Chain Pool',
            description: 'A test pool with minimal on-chain data',
            depositAmount: 1,
            maxEntries: 20,
            amountPerWinner: 1,
            rulesLink: 'http://example.com/rules3',
            createdAt: new Date('2024-05-01T00:00:00.000Z'),
            registrations: 2,
            startTime: new Date('2024-06-01T12:00:00.000Z'),
            registrationStart: new Date('2024-05-15T00:00:00.000Z').toISOString(),
            registrationEnd: new Date('2024-05-30T23:59:59.000Z').toISOString(),
            registrationEnabled: true,
        }
        expect(pool.contractAddress).toBeUndefined()
        expect(pool.status).toBeUndefined()
        expect(pool.participants).toBeUndefined()
    })
})

describe('Participant Interface', () => {
    it('should allow creating a basic Participant object', () => {
        const participant: Participant = {
            address: '0xuser1',
            joinedAt: Date.now(),
        }
        expect(participant.address).toBe('0xuser1')
        expect(participant.isWinner).toBeUndefined()
    })

    it('should allow creating a Participant object with all properties', () => {
        const participant: Participant = {
            address: '0xuser2',
            depositTxHash: '0xtx123',
            joinedAt: Date.now() - 100000,
            isWinner: true,
            hasClaimed: false,
        }
        expect(participant.depositTxHash).toBe('0xtx123')
        expect(participant.isWinner).toBe(true)
        expect(participant.hasClaimed).toBe(false)
    })
})
