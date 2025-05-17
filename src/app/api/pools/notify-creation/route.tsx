import { storePoolInCache } from '@/lib/poolDataService'
import type { Participant, Pool } from '@/types/pool'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

// Define a more specific type for the data expected from the client wizard
interface ClientPoolCreationData {
    name?: string
    description?: string
    selectedImage?: string
    tokenAddress?: string // Will be mapped to Pool.tokenContractAddress
    // poolData.tokenSymbol and poolData.tokenDecimals are ambiguous with customTokenSymbol/Decimals
    // and onChainTokenSymbol/Decimals (which are read-only).
    // Rely on customTokenSymbol/Decimals for client input if it's a custom token.
    // If these are for non-custom tokens, their handling needs clarification w.r.t. Pool type.
    depositAmount?: number // Will be mapped to Pool.depositAmountPerPerson
    maxEntries?: number // Will be mapped to Pool.softCap (assumption)
    winnerCount?: number // Will be mapped to Pool.totalWinners
    amountPerWinner?: number // Maps to Pool.amountPerWinner
    startTime?: number // Unix timestamp, maps to Pool.startTime
    endTime?: number // Unix timestamp, maps to Pool.endTime
    // Client might send Date string/number for these, ensure they are handled.
    registrationStart?: string | number | Date
    registrationEnd?: string | number | Date
    rulesLink?: string
    customTokenAddress?: string
    customTokenSymbol?: string
    customTokenDecimals?: number
    selectedTokenKey?: string
    chainId?: number
    participants?: Participant[]
    winners?: string[] // Client might send initial winners
}

interface NotifyCreationRequestBody {
    txHash: string
    poolData: ClientPoolCreationData // Use the more specific type
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as NotifyCreationRequestBody
        const { txHash, poolData } = body

        if (!txHash) {
            return NextResponse.json({ message: 'Transaction hash is required' }, { status: 400 })
        }

        console.log('[API] Pool Creation Notification Received:')
        console.log('Transaction Hash:', txHash)
        console.log('Pool Data (from client wizard):', poolData)

        const tempPoolId = uuidv4()

        // Constructing the Pool object for caching.
        // Client sends partial data; we fill in defaults or placeholders.
        const partialPoolToCache: Pool = {
            // Fields from client (ClientPoolCreationData), mapped to Pool interface
            name: poolData.name ?? 'Untitled Pool',
            description: poolData.description ?? '',
            selectedImage: poolData.selectedImage ?? '',
            tokenContractAddress: poolData.tokenAddress ?? '', // Mapped from poolData.tokenAddress
            depositAmountPerPerson: Number(poolData.depositAmount ?? 0), // Mapped
            softCap: Number(poolData.maxEntries ?? 0), // Mapped from poolData.maxEntries (assumption)
            totalWinners: Number(poolData.winnerCount ?? 1), // Mapped
            amountPerWinner: Number(poolData.amountPerWinner ?? 0),
            startTime: poolData.startTime ?? new Date().getTime(), // Ensure Unix timestamp (number)
            endTime: poolData.endTime ?? (poolData.startTime ?? new Date().getTime()) + 24 * 60 * 60 * 1000, // Default to startTime + 24h if not provided
            // registrationStart, registrationEnd, registrations, registrationEnabled
            // are not part of the official Pool type in src/types/pool.ts.
            // If they need to be cached, the Pool type definition must be updated.
            // Removing them from partialPoolToCache to adhere to the current Pool type.
            rulesLink: poolData.rulesLink ?? '',
            customTokenAddress: poolData.customTokenAddress,
            customTokenSymbol: poolData.customTokenSymbol,
            customTokenDecimals: poolData.customTokenDecimals,
            selectedTokenKey: poolData.selectedTokenKey,
            chainId: poolData.chainId,
            participants: poolData.participants ?? [],
            onChainWinners: poolData.winners ?? [],

            // Server-set or placeholder fields for now
            id: tempPoolId,
            status: 'draft', // Initial status
            createdAt: new Date().toISOString(), // Server-set creation time, ensure ISO string
            txHash: txHash,
        }

        await storePoolInCache(tempPoolId, partialPoolToCache)
        console.log(`[API] Stored partial pool data in cache with temp ID: ${tempPoolId}`)

        return NextResponse.json(
            { message: 'Pool creation notification received and temp data cached', txHash, tempPoolId },
            { status: 200 },
        )
    } catch (error) {
        console.error('[API] Error processing pool creation notification:', error)
        return NextResponse.json(
            { message: 'Error processing request', error: (error as Error).message },
            { status: 500 },
        )
    }
}
