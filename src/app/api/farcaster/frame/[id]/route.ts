import { NextResponse, type NextRequest } from 'next/server'

// Mock Pool type and data fetching - replace with actual imports and logic
interface MockPool {
    id: string
    name: string
    status: 'open' | 'funded' | 'ended' // Example statuses
    creatorName?: string // Optional, for image
    // Add other relevant fields needed for the frame
}

async function getPoolData(poolId: string): Promise<MockPool | null> {
    // In a real app, fetch this from your database (e.g., Redis, Postgres)
    // For now, returning mock data
    let result: MockPool | null = null
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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const poolId = params.id
    if (!poolId) {
        return new NextResponse('Missing pool ID', { status: 400 })
    }

    const pool = await getPoolData(poolId)

    if (!pool) {
        return new NextResponse('Pool not found', { status: 404 })
    }

    // TODO: Replace with actual dynamic image generation URL
    // For now, use a placeholder or the app's main OG image
    const appBaseUrl = process.env.NEXT_PUBLIC_URL ?? 'https://pool-mini.vercel.app'
    // const imageUrl = `${appBaseUrl}/api/farcaster/frame/image/${pool.id}`;
    const imageUrl = `${appBaseUrl}/cover.png` // Using a static OG image for now

    const frameButtons: string[] = []

    // Button 1: View Pool Details
    frameButtons.push(
        `<meta property="fc:frame:button:1" content="View Pool Details" />`,
        `<meta property="fc:frame:button:1:action" content="link" />`,
        `<meta property="fc:frame:button:1:target" content="${appBaseUrl}/${pool.id}" />`,
    )

    // Button 2: Join Pool (if open)
    if (pool.status === 'open') {
        frameButtons.push(
            `<meta property="fc:frame:button:2" content="Join Pool" />`,
            `<meta property="fc:frame:button:2:action" content="link" />`,
            `<meta property="fc:frame:button:2:target" content="${appBaseUrl}/${pool.id}?utm_source=farcaster_frame&action=join" />`,
        )
    } else if (pool.status === 'ended') {
        // Button 3 (or 2 if not open): View Results (if ended)
        const buttonIndex = 2
        frameButtons.push(
            `<meta property="fc:frame:button:${buttonIndex}" content="View Results" />`,
            `<meta property="fc:frame:button:${buttonIndex}:action" content="link" />`,
            `<meta property="fc:frame:button:${buttonIndex}:target" content="${appBaseUrl}/${pool.id}?action=results" />`,
        )
    }

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="og:title" content="${pool.name} - Pool Mini App" />
        <meta property="og:image" content="${imageUrl}" />
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${imageUrl}" />
        <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
        ${frameButtons.join('\n        ')}
        <title>${pool.name} - Pool Frame</title>
      </head>
      <body>
        <h1>${pool.name}</h1>
        <p>This is a Farcaster Frame for the pool. View on Farcaster to interact.</p>
        <p><a href="${appBaseUrl}/${pool.id}">Or click here to view the pool directly.</a></p>
      </body>
    </html>
  `

    return new NextResponse(html, {
        status: 200,
        headers: {
            'Content-Type': 'text/html',
        },
    })
}
