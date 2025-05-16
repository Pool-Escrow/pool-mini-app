import { storePoolInCache } from '@/lib/poolDataService'
import type { Pool } from '@/types/pool'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

interface NotifyCreationRequestBody {
    txHash: string
    // poolData from client is partial. Omit server-set/confirmed fields.
    poolData: Partial<
        Omit<
            Pool,
            | 'id'
            | 'createdAt'
            | 'contractAddress'
            | 'status'
            | 'registrations'
            | 'registrationEnabled'
            | 'totalDeposited'
            | 'txHash'
        >
    >
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
            // Fields that client is expected to send (made optional by Partial)
            name: poolData.name ?? 'Untitled Pool',
            description: poolData.description ?? '',
            selectedImage: poolData.selectedImage ?? '',
            tokenAddress: poolData.tokenAddress,
            tokenSymbol: poolData.tokenSymbol,
            tokenDecimals: poolData.tokenDecimals,
            depositAmount: Number(poolData.depositAmount ?? 0),
            maxEntries: Number(poolData.maxEntries ?? 0),
            winnerCount: Number(poolData.winnerCount ?? 1),
            amountPerWinner: Number(poolData.amountPerWinner ?? 0),
            startTime: poolData.startTime ?? new Date(), // This is Date type in Pool
            registrationStart: (poolData.registrationStart
                ? new Date(poolData.registrationStart)
                : new Date()
            ).toISOString(), // String in Pool
            registrationEnd: (poolData.registrationEnd
                ? new Date(poolData.registrationEnd)
                : new Date(Date.now() + 24 * 60 * 60 * 1000)
            ).toISOString(), // String in Pool
            rulesLink: poolData.rulesLink ?? '',
            customTokenAddress: poolData.customTokenAddress,
            customTokenSymbol: poolData.customTokenSymbol,
            customTokenDecimals: poolData.customTokenDecimals,
            selectedTokenKey: poolData.selectedTokenKey,
            chainId: poolData.chainId,
            participants: poolData.participants ?? [], // Optional in Pool, default to empty
            winners: poolData.winners ?? [], // Optional in Pool, default to empty

            // Server-set or placeholder fields for now
            id: tempPoolId,
            contractAddress: '0xplaceholderAddress', // Placeholder
            status: 'draft', // Initial status
            createdAt: new Date(), // Server-set creation time
            registrations: 0, // Default for new pool
            registrationEnabled: true, // Default for new pool

            // totalDeposited and txHash are optional and can be added later or if available
            // totalDeposited: poolData.totalDeposited,
            // txHash: txHash,
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
