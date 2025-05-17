import { getPoolWithContractFallback } from '@/lib/poolDataService'
import type { Pool } from '@/types/pool'
import { ImageResponse } from 'next/og'
import { type NextRequest } from 'next/server'

// Mock Pool type and data fetching - replace with actual imports and logic
// interface MockPoolForImage {  // Removed
//     id: string
//     name: string
//     status: 'open' | 'funded' | 'ended'
//     creatorName?: string
//     // Add other relevant fields, e.g., number of participants, total amount
// } Removed

// async function getPoolDataForImage(poolId: string): Promise<MockPoolForImage | null> { // Removed
//     // In a real app, fetch this from your database (e.g., Redis, Postgres)
//     let result: MockPoolForImage | null = null
//
//     if (poolId === '1') {
//         result = {
//             id: '1',
//             name: 'Community Fun Fest Pool',
//             status: 'open',
//             creatorName: 'Dev Team',
//         }
//     } else if (poolId === '2') {
//         result = {
//             id: '2',
//             name: 'Charity Drive Q2',
//             status: 'funded',
//             creatorName: 'Alice B.',
//         }
//     } else if (poolId === '3') {
//         result = {
//             id: '3',
//             name: 'Hackathon Winnings Pool',
//             status: 'ended',
//             creatorName: 'The Winners',
//         }
//     }
//     return Promise.resolve(result)
// } Removed

export const runtime = 'edge' // Vercel OG recommends Edge runtime

export async function GET(req: NextRequest) {
    // Extract the poolId from the URL pathname
    const pathname = req.nextUrl.pathname
    const poolId = pathname.split('/').pop() ?? ''

    if (!poolId) {
        return new Response('Missing pool ID', { status: 400 })
    }

    const searchParams = req.nextUrl.searchParams
    const chainIdString = searchParams.get('chainId')

    if (!chainIdString) {
        return new Response('Missing chain ID', { status: 400 })
    }

    const chainId = parseInt(chainIdString, 10)
    if (isNaN(chainId)) {
        return new Response('Invalid chain ID format', { status: 400 })
    }

    try {
        const pool: Pool | null = await getPoolWithContractFallback(poolId, chainId)

        if (!pool) {
            return new Response(`Pool not found: ${poolId}`, { status: 404 })
        }

        // Simple image displaying pool name and status
        // Tailwind classes won't work here directly, need inline styles or Satori-compatible CSS.
        const imageJsx = (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#f0f0f0',
                    color: '#333',
                    fontFamily: 'sans-serif',
                    padding: '20px',
                    border: '10px solid #6366f1', // Indigo-500 like color
                    boxSizing: 'border-box',
                }}>
                <h1 style={{ fontSize: '48px', margin: '0 0 20px 0', textAlign: 'center' }}>{pool.name}</h1>
                <p style={{ fontSize: '32px', margin: '0' }}>
                    Status: <span style={{ fontWeight: 'bold' }}>{pool.status?.toUpperCase() ?? 'N/A'}</span>
                </p>
                <p style={{ fontSize: '24px', margin: '20px 0 0 0', color: '#4b5563' }}>Pool ID: {pool.id}</p>
                <p style={{ fontSize: '18px', position: 'absolute', bottom: '10px', right: '20px', color: '#6b7280' }}>
                    Powered by Pool Mini
                </p>
            </div>
        )

        return new ImageResponse(imageJsx, {
            width: 1200,
            height: 630,
            // You can load custom fonts here if needed
            // fonts: [
            //   {
            //     name: 'Typewriter',
            //     data: await fetch(
            //       new URL('./Inter-Regular.woff2', import.meta.url)
            //     ).then((res) => res.arrayBuffer()),
            //     style: 'normal',
            //     weight: 400,
            //   },
            // ],
        })
    } catch (error) {
        console.error(`Error generating image for pool ${poolId}:`, error)
        return new Response('Failed to generate image', { status: 500 })
    }
}
