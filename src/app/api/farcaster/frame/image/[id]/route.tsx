import { ImageResponse } from 'next/og'
import { type NextRequest } from 'next/server'

// Mock Pool type and data fetching - replace with actual imports and logic
interface MockPoolForImage {
    id: string
    name: string
    status: 'open' | 'funded' | 'ended'
    creatorName?: string
    // Add other relevant fields, e.g., number of participants, total amount
}

async function getPoolDataForImage(poolId: string): Promise<MockPoolForImage | null> {
    // In a real app, fetch this from your database (e.g., Redis, Postgres)
    let result: MockPoolForImage | null = null

    if (poolId === '1') {
        result = {
            id: '1',
            name: 'Community Fun Fest Pool',
            status: 'open',
            creatorName: 'Dev Team',
        }
    } else if (poolId === '2') {
        result = {
            id: '2',
            name: 'Charity Drive Q2',
            status: 'funded',
            creatorName: 'Alice B.',
        }
    } else if (poolId === '3') {
        result = {
            id: '3',
            name: 'Hackathon Winnings Pool',
            status: 'ended',
            creatorName: 'The Winners',
        }
    }
    return Promise.resolve(result)
}

export const runtime = 'edge' // Vercel OG recommends Edge runtime

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const poolId = params.id
    if (!poolId) {
        return new Response('Missing pool ID', { status: 400 })
    }

    const pool = await getPoolDataForImage(poolId)

    if (!pool) {
        return new Response('Pool not found', { status: 404 })
    }

    try {
        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'white', // Example background
                        padding: '40px',
                        fontFamily: 'sans-serif', // Added for consistency
                    }}>
                    <div
                        style={{
                            fontSize: 60,
                            fontWeight: 'bold',
                            color: 'black',
                            textAlign: 'center',
                            marginBottom: '30px', // Added spacing
                        }}>
                        {pool.name}
                    </div>
                    <div
                        style={{
                            fontSize: 30,
                            color: '#333', // Darker grey for better readability
                            textAlign: 'center',
                            marginBottom: '15px', // Added spacing
                        }}>
                        Status: {pool.status.toUpperCase()}
                    </div>
                    {pool.creatorName && (
                        <div
                            style={{
                                fontSize: 24,
                                color: '#555', // Medium grey
                                fontStyle: 'italic',
                                textAlign: 'center',
                            }}>
                            Created by: {pool.creatorName}
                        </div>
                    )}
                    {/* TODO: Add more data like participant count, total amount once available */}
                </div>
            ),
            {
                width: 1200,
                height: 630,
            },
        )
    } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred'
        console.error(`Failed to generate image for pool ${poolId}: ${errorMessage}`, e)
        return new Response(`Failed to generate the image for pool ${poolId}: ${errorMessage}`, {
            status: 500,
        })
    }
}
