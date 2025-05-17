import PoolPageClient from '@/components/PoolPageClient' // Import the new client component
import { getPoolWithContractFallback } from '@/lib/poolDataService' // Import real data fetching
import type { Pool } from '@/types/pool' // Import real Pool type
import { type Metadata } from 'next' // Added ResolvingMetadata

export async function generateMetadata({
    params,
    searchParams,
}: {
    params: { id: string }
    searchParams: Record<string, string | string[] | undefined>
}): Promise<Metadata> {
    const poolId = params.id

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
        console.warn(
            `[Metadata] chainId not found or invalid in searchParams for pool ${poolId}. Metadata might be incomplete or incorrect. Query:`,
            searchParams,
        )
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

    const appBaseUrl = process.env.NEXT_PUBLIC_URL
    const dynamicImageUrl = `${appBaseUrl}/api/farcaster/frame/image/${pool.id}?chainId=${chainId}`

    const fcMetadata: Record<string, string> = {
        'fc:frame': 'vNext',
        'fc:frame:image': dynamicImageUrl,
        'fc:frame:image:aspect_ratio': '1.91:1',
        'fc:frame:button:1': 'View Pool Details',
        'fc:frame:button:1:action': 'link',
        'fc:frame:button:1:target': `${appBaseUrl}/pool/${pool.id}`,
    }

    if (pool.status === 'active') {
        fcMetadata['fc:frame:button:2'] = 'Join Pool'
        fcMetadata['fc:frame:button:2:action'] = 'link'
        fcMetadata['fc:frame:button:2:target'] = `${appBaseUrl}/pool/${pool.id}?utm_source=farcaster_frame&action=join`
    } else if (pool.status === 'completed' || pool.status === 'cancelled') {
        fcMetadata['fc:frame:button:2'] = 'View Results'
        fcMetadata['fc:frame:button:2:action'] = 'link'
        fcMetadata['fc:frame:button:2:target'] = `${appBaseUrl}/pool/${pool.id}?action=results`
    }

    return {
        title: `${pool.name} - Pool Mini App`,
        description: `Details for ${pool.name}. Join or view results.`,
        openGraph: {
            title: `${pool.name} - Pool Mini App`,
            description: `Details for ${pool.name}. Join or view results.`,
            images: [{ url: dynamicImageUrl }],
            url: `${appBaseUrl}/pool/${pool.id}`,
        },
        other: fcMetadata,
    }
}

export default function Page({ params }: { params: { id: string } }) {
    return <PoolPageClient id={params.id} />
}
