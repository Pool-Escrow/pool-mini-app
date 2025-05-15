import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    // // Silence warnings
    // // https://github.com/WalletConnect/walletconnect-monorepo/issues/1908
    // webpack: config => {
    //     config.externals.push('pino-pretty', 'lokijs', 'encoding')
    //     return config
    // },
    // turbopack: {
    //     rules: {},
    // },
    // Add image domain configuration to allow randomuser.me images
    images: {
        domains: ['randomuser.me'],
    },
    serverExternalPackages: ['pino-pretty', 'lokijs', 'encoding'],
    devIndicators: false,
}

export default nextConfig
