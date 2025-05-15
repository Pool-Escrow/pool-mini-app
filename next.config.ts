import type { NextConfig } from 'next'

const externals = ['pino-pretty']

const nextConfig: NextConfig = {
    // Silence warnings
    // https://github.com/WalletConnect/walletconnect-monorepo/issues/1908
    webpack: (config: NextConfig['webpack'] & { externals: string[] }) => ({
        ...config,
        externals: [...(config?.externals ?? []), ...externals],
    }),
    turbopack: { rules: { externals } },
    images: { remotePatterns: [{ hostname: 'randomuser.me' }] },
    serverExternalPackages: externals,

    // Optimize CSS loading
    experimental: {
        optimizeCss: true,
    },

    poweredByHeader: false,
    devIndicators: false,
}

export default nextConfig
