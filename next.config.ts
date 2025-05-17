import type { NextConfig } from 'next'

const externals = ['pino-pretty']

const nextConfig: NextConfig = {
    // Silence warnings
    // https://github.com/WalletConnect/walletconnect-monorepo/issues/1908
    webpack: (config: NextConfig['webpack'] & { externals: string[] }) => {
        config.externals.push(...externals)
        return config
    },
    turbopack: { rules: { externals } },
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
                    // IMPORTANT: Do NOT set Cross-Origin-Opener-Policy to 'same-origin'
                    // This would break Coinbase Wallet SDK functionality
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'unsafe-none', // Required for Coinbase Wallet SDK
                    },
                    {
                        key: 'Cross-Origin-Embedder-Policy',
                        value: 'credentialless', // Changed from require-corp to allow IPFS resources
                    },
                    // Add Cross-Origin-Resource-Policy to allow IPFS
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
