import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
    // Get the response
    const response = NextResponse.next()

    // Add security headers - Required for Coinbase Wallet SDK and IPFS
    response.headers.set('Cross-Origin-Opener-Policy', 'unsafe-none')
    response.headers.set('Cross-Origin-Embedder-Policy', 'credentialless')
    response.headers.set('Cross-Origin-Resource-Policy', 'cross-origin')

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
        const corsResponse = new NextResponse(null, {
            status: 200,
            headers: {
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Origin': '*', // Consider restricting this in production
                'Access-Control-Allow-Methods': 'GET,DELETE,PATCH,POST,PUT,OPTIONS',
                'Access-Control-Allow-Headers':
                    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
                // Add security headers here too for consistency
                'Cross-Origin-Opener-Policy': 'unsafe-none',
                'Cross-Origin-Embedder-Policy': 'credentialless',
                'Cross-Origin-Resource-Policy': 'cross-origin',
            },
        })
        return corsResponse
    }

    return response
}

// Configure middleware to run on specific paths
export const config = {
    matcher: [
        // Match all API routes
        '/api/:path*',
        // Match all page routes except static files
        '/((?!_next/static|_next/image|favicon.ico).*)',
        // Include IPFS gateway paths if you're proxying them
        '/ipfs/:path*',
    ],
}
