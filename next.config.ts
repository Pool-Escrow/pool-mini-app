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
    images: { remotePatterns: [{ hostname: 'randomuser.me' }] },
    serverExternalPackages: externals,

    // Optimize CSS loading (requires critters to be installed)
    experimental: {
        optimizeCss: true,
    },

    poweredByHeader: false,
    devIndicators: false,
}

export default nextConfig
