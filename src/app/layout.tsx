import { env } from '@/env'
import '@/styles/globals.css'

import { DynamicWalletProviders } from '@/components/DynamicWalletProviders'
import type { Metadata, Viewport } from 'next'

import '@coinbase/onchainkit/styles.css'

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
}

export function generateMetadata(): Metadata {
    const URL = env.NEXT_PUBLIC_URL
    return {
        title: env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
        description: env.NEXT_PUBLIC_APP_DESCRIPTION,
        icons: {
            icon: '/favicon.ico',
            apple: '/favicon.ico',
        },
        other: {
            'fc:frame': JSON.stringify({
                version: env.NEXT_PUBLIC_VERSION,
                imageUrl: env.NEXT_PUBLIC_APP_HERO_IMAGE,
                aspectRatioSchema: '4:3',
                button: {
                    title: `Launch ${env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME}`,
                    action: {
                        type: 'launch_frame',
                        name: env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
                        url: URL,
                        splashImageUrl: env.NEXT_PUBLIC_APP_SPLASH_IMAGE,
                        splashBackgroundColor: env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR,
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
