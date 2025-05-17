import PoolPageClient from '@/components/PoolPageClient' // Import the new client component
import { getPoolWithContractFallback } from '@/lib/poolDataService' // Import real data fetching
import type { Pool } from '@/types/pool' // Import real Pool type
import { type Metadata } from 'next' // Added ResolvingMetadata

// Mock Pool type and data fetching for metadata - replace with actual imports and logic from Task 40
// interface MockPoolForMeta { // Removed
//     id: string
//     name: string
//     status: 'open' | 'funded' | 'ended' // Example statuses
// } // Removed

// async function getPoolDataForMeta(poolId: string): Promise<MockPoolForMeta | null> { // Removed
//     let result: MockPoolForMeta | null = null
//     // In a real app, fetch this from your database (e.g., Redis, Postgres) via getPoolDetails (Task 40)
//     if (poolId === '1') {
//         result = {
//             id: '1',
//             name: 'Community Fun Fest Pool',
//             status: 'open',
//         }
//     } else if (poolId === '2') {
//         result = {
//             id: '2',
//             name: 'Charity Drive Q2',
//             status: 'funded',
//         }
//     } else if (poolId === '3') {
//         result = {
//             id: '3',
//             name: 'Hackathon Winnings Pool',
//             status: 'ended',
//         }
//     }
//     return Promise.resolve(result)
// } // Removed

export async function generateMetadata({
    params,
    searchParams,
}: {
    params: { id: string }
    searchParams: Record<string, string | string[] | undefined>
}): Promise<Metadata> {
    const poolId = params.id // Correctly await params - params is not a promise here directly

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

    const chainIdString = searchParams?.chainId
    let chainId: number | undefined = undefined

    if (typeof chainIdString === 'string' && /^[0-9]+$/.test(chainIdString)) {
        chainId = parseInt(chainIdString, 10)
    } else {
        // Option 1: Fallback to a default chainId if appropriate
        // chainId = DEFAULT_CHAIN_ID;
        // console.warn(`[Metadata] chainId not found or invalid in searchParams for pool ${poolId}. Falling back to default.`);

        // Option 2: Return error metadata or handle as critical missing info
        // For now, let's assume getPoolWithContractFallback requires it and error out if not present
        // Or, if the page can function without a specific chain for metadata (e.g. generic pool page)
        // but the image needs it, this becomes tricky.
        // For consistency with frame routes, let's make chainId mandatory for metadata too for now.
        console.warn(
            `[Metadata] chainId not found or invalid in searchParams for pool ${poolId}. Metadata might be incomplete or incorrect. Query:`,
            searchParams,
        )
        // If chainId is strictly required for getPoolWithContractFallback, and no default makes sense:
        return {
            title: 'Pool Data Error',
            description: 'Chain ID is missing or invalid for retrieving pool information.',
        }
    }

    const pool: Pool | null = await getPoolWithContractFallback(poolId, chainId)

    if (!pool) {
        return {
            title: 'Pool Not Found',
            description: 'The requested pool could not be found.',
        }
    }

    const appBaseUrl = process.env.NEXT_PUBLIC_URL ?? 'https://pool-mini.vercel.app'
    const dynamicImageUrl = `${appBaseUrl}/api/farcaster/frame/image/${pool.id}?chainId=${chainId}`

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
export default function Page({ params }: { params: { id: string } }) {
    return <PoolPageClient id={params.id} />
}
