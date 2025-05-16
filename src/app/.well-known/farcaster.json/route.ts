import { env } from '@/env'

function withValidProperties(properties: Record<string, undefined | string | string[]>) {
    return Object.fromEntries(
        Object.entries(properties).filter(([, value]) => {
            if (Array.isArray(value)) {
                return value.length > 0
            }
            return !!value
        }),
    )
}

export function GET() {
    const URL = env.NEXT_PUBLIC_URL

    return Response.json({
        accountAssociation: {
            header: env.FARCASTER_HEADER,
            payload: env.FARCASTER_PAYLOAD,
            signature: env.FARCASTER_SIGNATURE,
        },
        frame: withValidProperties({
            version: '1',
            name: env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
            subtitle: env.NEXT_PUBLIC_APP_SUBTITLE,
            description: env.NEXT_PUBLIC_APP_DESCRIPTION,
            screenshotUrls: [],
            iconUrl: env.NEXT_PUBLIC_APP_ICON,
            splashImageUrl: env.NEXT_PUBLIC_APP_SPLASH_IMAGE,
            splashBackgroundColor: env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR,
            homeUrl: URL,
            webhookUrl: `${URL}/api/webhook`,
            primaryCategory: env.NEXT_PUBLIC_APP_PRIMARY_CATEGORY,
            tags: [],
            heroImageUrl: env.NEXT_PUBLIC_APP_HERO_IMAGE,
            tagline: env.NEXT_PUBLIC_APP_TAGLINE,
            ogTitle: env.NEXT_PUBLIC_APP_OG_TITLE,
            ogDescription: env.NEXT_PUBLIC_APP_OG_DESCRIPTION,
            ogImageUrl: env.NEXT_PUBLIC_APP_OG_IMAGE,
        }),
    })
}
