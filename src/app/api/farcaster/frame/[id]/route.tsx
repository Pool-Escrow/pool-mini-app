import { getPoolWithContractFallback } from '@/lib/poolDataService'
import type { Pool } from '@/types/pool'
import { NextResponse, type NextRequest } from 'next/server'

// MockPool interface and getPoolData function are removed as we use real data service

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const poolId = params.id
    if (!poolId) {
        return new NextResponse('Missing pool ID', { status: 400 })
    }

    const pool: Pool | null = await getPoolWithContractFallback(poolId)

    if (!pool) {
        // Message updated to reflect fallback attempt
        console.log(`Frame: Pool ${poolId} not found in cache or via contract fallback.`)
        return new NextResponse('Pool not found.', { status: 404 })
    }

    const appBaseUrl = process.env.NEXT_PUBLIC_URL ?? 'https://pool-mini.vercel.app'
    // Use the dynamic image generation endpoint
    const imageUrl = `${appBaseUrl}/api/farcaster/frame/image/${pool.id}` // Updated to dynamic image URL

    const frameButtons: string[] = []

    frameButtons.push(
        `<meta property="fc:frame:button:1" content="View Pool Details" />`,
        `<meta property="fc:frame:button:1:action" content="link" />`,
        `<meta property="fc:frame:button:1:target" content="${appBaseUrl}/pool/${pool.id}" />`,
    )

    // Adjusting button logic based on real Pool status enum if different from mock
    // Assuming 'active' is similar to 'open' and 'completed' or 'cancelled' is similar to 'ended' for button logic.
    // The Pool type has status?: 'draft' | 'active' | 'completed' | 'cancelled'
    let buttonIndex = 2
    if (pool.status === 'active') {
        frameButtons.push(
            `<meta property="fc:frame:button:${buttonIndex}" content="Join Pool" />`,
            `<meta property="fc:frame:button:${buttonIndex}:action" content="link" />`,
            `<meta property="fc:frame:button:${buttonIndex}:target" content="${appBaseUrl}/pool/${pool.id}?utm_source=farcaster_frame&action=join" />`,
        )
        buttonIndex++
    } else if (pool.status === 'completed' || pool.status === 'cancelled') {
        frameButtons.push(
            `<meta property="fc:frame:button:${buttonIndex}" content="View Results" />`,
            `<meta property="fc:frame:button:${buttonIndex}:action" content="link" />`,
            `<meta property="fc:frame:button:${buttonIndex}:target" content="${appBaseUrl}/pool/${pool.id}?action=results" />`,
        )
        buttonIndex++
    }
    // Potentially add a 'Create Similar Pool' button or other context-aware buttons.

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
        <p>Pool Status: ${pool.status ?? 'N/A'}</p>
        <p>This is a Farcaster Frame for the pool. View on Farcaster to interact.</p>
        <p><a href="${appBaseUrl}/pool/${pool.id}">Or click here to view the pool directly.</a></p>
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
