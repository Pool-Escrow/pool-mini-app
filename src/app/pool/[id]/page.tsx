import PoolPageClient from '@/components/PoolPageClient' // Import the new client component
import { getPoolWithContractFallback } from '@/lib/poolDataService' // Import real data fetching
import type { Pool } from '@/types/pool' // Import real Pool type
import { type Metadata } from 'next'

// Mock Pool type and data fetching for metadata - replace with actual imports and logic from Task 40
interface MockPoolForMeta {
    id: string
    name: string
    status: 'open' | 'funded' | 'ended' // Example statuses
}

async function getPoolDataForMeta(poolId: string): Promise<MockPoolForMeta | null> {
    let result: MockPoolForMeta | null = null
    // In a real app, fetch this from your database (e.g., Redis, Postgres) via getPoolDetails (Task 40)
    if (poolId === '1') {
        result = {
            id: '1',
            name: 'Community Fun Fest Pool',
            status: 'open',
        }
    } else if (poolId === '2') {
        result = {
            id: '2',
            name: 'Charity Drive Q2',
            status: 'funded',
        }
    } else if (poolId === '3') {
        result = {
            id: '3',
            name: 'Hackathon Winnings Pool',
            status: 'ended',
        }
    }
    return Promise.resolve(result)
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id: poolId } = await params // Correctly await params

    if (poolId === 'favicon.ico') {
        console.error(
            "[DIAGNOSTIC] generateMetadata in /pool/[id]/page.tsx was called with poolId 'favicon.ico'. This indicates a routing issue.",
        )
        // Return minimal metadata to prevent further errors down the line for this specific case
        return {
            title: 'Favicon Error',
            description: 'Error processing favicon through dynamic route.',
        }
    }

    const pool: Pool | null = await getPoolWithContractFallback(poolId)

    if (!pool) {
        return {
            title: 'Pool Not Found',
            description: 'The requested pool could not be found.',
        }
    }

    const appBaseUrl = process.env.NEXT_PUBLIC_URL ?? 'https://pool-mini.vercel.app'
    const dynamicImageUrl = `${appBaseUrl}/api/farcaster/frame/image/${pool.id}`

    const fcMetadata: Record<string, string> = {
        'fc:frame': 'vNext',
        'fc:frame:image': dynamicImageUrl,
        'fc:frame:image:aspect_ratio': '1.91:1',
        'fc:frame:button:1': 'View Pool Details',
        'fc:frame:button:1:action': 'link',
        'fc:frame:button:1:target': `${appBaseUrl}/pool/${pool.id}`, // Updated target
    }

    if (pool.status === 'active') {
        fcMetadata['fc:frame:button:2'] = 'Join Pool'
        fcMetadata['fc:frame:button:2:action'] = 'link'
        fcMetadata['fc:frame:button:2:target'] = `${appBaseUrl}/pool/${pool.id}?utm_source=farcaster_frame&action=join` // Updated target
    } else if (pool.status === 'completed' || pool.status === 'cancelled') {
        fcMetadata['fc:frame:button:2'] = 'View Results'
        fcMetadata['fc:frame:button:2:action'] = 'link'
        fcMetadata['fc:frame:button:2:target'] = `${appBaseUrl}/pool/${pool.id}?action=results` // Updated target
    }
    // 'draft' pools might not show a second button or show a "Coming Soon" type message.

    return {
        title: `${pool.name} - Pool Mini App`,
        description: `Details for ${pool.name}. Join or view results.`,
        openGraph: {
            title: `${pool.name} - Pool Mini App`,
            description: `Details for ${pool.name}. Join or view results.`,
            images: [{ url: dynamicImageUrl }],
            url: `${appBaseUrl}/pool/${pool.id}`, // Updated URL
        },
        other: fcMetadata,
    }
}

// Make the Page component async and correctly await params
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params // Correctly await params
    return <PoolPageClient id={id} />
}
