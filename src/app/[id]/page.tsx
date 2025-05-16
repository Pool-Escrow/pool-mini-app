import PoolPageClient from '@/components/PoolPageClient' // Import the new client component
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

interface ServerPageProps {
    params: { id: string }
    // searchParams: { [key: string]: string | string[] | undefined } // if needed
}

export async function generateMetadata({ params }: ServerPageProps): Promise<Metadata> {
    const poolId = params.id
    const pool = await getPoolDataForMeta(poolId)

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
        'fc:frame:button:1:target': `${appBaseUrl}/${pool.id}`,
    }

    if (pool.status === 'open') {
        fcMetadata['fc:frame:button:2'] = 'Join Pool'
        fcMetadata['fc:frame:button:2:action'] = 'link'
        fcMetadata['fc:frame:button:2:target'] = `${appBaseUrl}/${pool.id}?utm_source=farcaster_frame&action=join`
    } else if (pool.status === 'ended') {
        // If not open and ended, button 2 becomes "View Results"
        fcMetadata['fc:frame:button:2'] = 'View Results'
        fcMetadata['fc:frame:button:2:action'] = 'link'
        fcMetadata['fc:frame:button:2:target'] = `${appBaseUrl}/${pool.id}?action=results`
    }
    // Can add more buttons (up to 4) for other statuses if needed

    return {
        title: `${pool.name} - Pool Mini App`,
        description: `Details for ${pool.name}. Join or view results.`,
        openGraph: {
            title: `${pool.name} - Pool Mini App`,
            description: `Details for ${pool.name}. Join or view results.`,
            images: [{ url: dynamicImageUrl }],
            url: `${appBaseUrl}/${pool.id}`,
        },
        other: fcMetadata,
    }
}

// This is now a Server Component
export default function Page({ params }: ServerPageProps) {
    // Data fetching for the actual page content can also happen here if needed by PoolPageClient
    // For now, PoolPageClient fetches its own data, we just pass the id.
    return <PoolPageClient id={params.id} />
}
