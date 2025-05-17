import type { NextConfig } from 'next'
import type { Configuration as WebpackConfiguration } from 'webpack'

const externals = ['pino-pretty']

const nextConfig: NextConfig = {
    // Silence warnings
    // https://github.com/WalletConnect/walletconnect-monorepo/issues/1908
    webpack: (config: WebpackConfiguration) => {
        const currentExternals = Array.isArray(config.externals) ? config.externals : []
        config.externals = [...currentExternals, ...externals]
        return config
    },
    turbopack: { rules: { externals: externals } },
    images: {
        remotePatterns: [
            { hostname: 'randomuser.me' },
            { hostname: 'ipfs.io' },
            { hostname: '**.ipfs.dweb.link' },
            { hostname: '**.ipfs.cf-ipfs.com' },
            { hostname: 'nftstorage.link' },
            { hostname: 'w3s.link' },
        ],
        minimumCacheTTL: 1500000,
    },
    serverExternalPackages: externals,

    // Optimize CSS loading (requires critters to be installed)
    experimental: {
        optimizeCss: true,
    },
    // Add your tunnel URL here if you're using one for development with Warpcast/MiniApps
    // This is to address the "Cross origin request detected" warning from Next.js dev server
    allowedDevOrigins: ['https://deep-pillows-wait.loca.lt'],

    poweredByHeader: false,
    devIndicators: false,
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },

    // Add headers configuration for CORS and COOP
    headers: async () =>
        Promise.resolve([
            {
                // Apply to all routes
                source: '/:path*',
                headers: [
                    // Allow embedding in iframes from any origin
                    {
                        key: 'X-Frame-Options',
                        value: 'ALLOWALL',
                    },
                    // More permissive CORS policy
                    {
                        key: 'Access-Control-Allow-Origin',
                        value: '*',
                    },
                    // Less restrictive opener policy
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'unsafe-none',
                    },
                    // Adjusted embedder policy
                    {
                        key: 'Cross-Origin-Embedder-Policy',
                        value: 'unsafe-none',
                    },
                    // Cross-origin resource sharing
                    {
                        key: 'Cross-Origin-Resource-Policy',
                        value: 'cross-origin',
                    },
                    // Add Permissions-Policy to allow IPFS
                    {
                        key: 'Permissions-Policy',
                        value: 'accelerometer=(), camera=(), cross-origin-isolated=(), display-capture=(), encrypted-media=(), fullscreen=*, gamepad=(), geolocation=(), gyroscope=(), identity-credentials-get=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=*, publickey-credentials-get=(), screen-wake-lock=(), sync-xhr=(), usb=(), web-share=*, xr-spatial-tracking=()',
                    },
                ],
            },
            {
                // Apply to API routes
                source: '/api/:path*',
                headers: [
                    {
                        key: 'Access-Control-Allow-Credentials',
                        value: 'true',
                    },
                    {
                        key: 'Access-Control-Allow-Origin',
                        value: '*', // Consider restricting this to specific origins in production
                    },
                    {
                        key: 'Access-Control-Allow-Methods',
                        value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS',
                    },
                    {
                        key: 'Access-Control-Allow-Headers',
                        value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
                    },
                ],
            },
            {
                // Apply specifically to the well-known farcaster.json route
                source: '/.well-known/farcaster.json',
                headers: [
                    {
                        key: 'Access-Control-Allow-Origin',
                        value: '*',
                    },
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=0, must-revalidate',
                    },
                    {
                        key: 'Content-Type',
                        value: 'application/json',
                    },
                ],
            },
            {
                // Special configuration for IPFS resources
                source: '/ipfs/:path*',
                headers: [
                    {
                        key: 'Access-Control-Allow-Origin',
                        value: '*',
                    },
                    {
                        key: 'Access-Control-Allow-Methods',
                        value: 'GET, HEAD, OPTIONS',
                    },
                    {
                        key: 'Access-Control-Allow-Headers',
                        value: '*',
                    },
                    {
                        key: 'Access-Control-Expose-Headers',
                        value: '*',
                    },
                    {
                        key: 'Cross-Origin-Resource-Policy',
                        value: 'cross-origin',
                    },
                    {
                        key: 'Cross-Origin-Embedder-Policy',
                        value: 'credentialless',
                    },
                    {
                        key: 'Timing-Allow-Origin',
                        value: '*',
                    },
                ],
            },
        ]),
}

export default nextConfig
