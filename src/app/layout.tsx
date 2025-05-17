import { env } from '@/env'
import '@/styles/globals.css'

import { DynamicWalletProviders } from '@/components/DynamicWalletProviders'
import type { Metadata, Viewport } from 'next'

import '@coinbase/onchainkit/styles.css'

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
}

// Ensure metadata generation is dynamic for production
export const dynamic = 'force-dynamic'

export function generateMetadata(): Metadata {
    const appName = env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME
    const appDescription = env.NEXT_PUBLIC_APP_DESCRIPTION
    const appBaseUrl = env.NEXT_PUBLIC_URL // This should be your main app URL
    const frameImageUrl = env.NEXT_PUBLIC_APP_HERO_IMAGE
    const splashImageUrl = env.NEXT_PUBLIC_APP_SPLASH_IMAGE
    const splashBgColor = env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR
    const frameVersion = env.NEXT_PUBLIC_VERSION // Should be 'next' or 'vNext'

    return {
        title: appName,
        description: appDescription,
        icons: {
            icon: '/favicon.ico',
            apple: '/favicon.ico',
        },
        // Open Graph and other general metadata
        openGraph: {
            title: appName,
            description: appDescription,
            url: appBaseUrl,
            siteName: appName,
            images: [
                {
                    url: env.NEXT_PUBLIC_APP_OG_IMAGE, // Ensure this is a full URL
                    width: 1200,
                    height: 630,
                },
            ],
            locale: 'en_US',
            type: 'website',
        },
        // Farcaster frame specific metadata
        other: {
            'fc:frame': JSON.stringify({
                version: frameVersion,
                imageUrl: frameImageUrl,
                button: {
                    title: `Launch ${appName}`,
                    action: {
                        type: 'launch_frame',
                        name: appName,
                        url: appBaseUrl,
                        splashImageUrl: splashImageUrl,
                        splashBackgroundColor: splashBgColor,
                    },
                },
            }),
        },
    }
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang='en'>
            <body className='bg-background'>
                <DynamicWalletProviders>{children}</DynamicWalletProviders>
            </body>
        </html>
    )
}
