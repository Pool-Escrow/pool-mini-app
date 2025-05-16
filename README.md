# MiniKit Template

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-onchain --mini`](), configured with:

- [MiniKit](https://docs.base.org/builderkits/minikit/overview)
- [OnchainKit](https://www.base.org/builders/onchainkit)
- [Tailwind CSS](https://tailwindcss.com)
- [Next.js](https://nextjs.org/docs)

## Getting Started

1. Install dependencies:

```bash
bun install
```

2. Verify environment variables, these will be set up by the `bunx create-onchain --mini` command:

You can regenerate the FARCASTER Account Association environment variables by running `bunx create-onchain --manifest` in your project directory.

The environment variables enable the following features:

- Frame metadata - Sets up the Frame Embed that will be shown when you cast your frame
- Account association - Allows users to add your frame to their account, enables notifications
- Redis API keys - Enable Webhooks and background notifications for your application by storing users notification details

```bash
# Required for Frame metadata
NEXT_PUBLIC_URL=
NEXT_PUBLIC_VERSION=
NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME=
NEXT_PUBLIC_ICON_URL=
NEXT_PUBLIC_IMAGE_URL=
NEXT_PUBLIC_SPLASH_IMAGE_URL=
NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR=

# Required to allow users to add your frame
FARCASTER_HEADER=
FARCASTER_PAYLOAD=
FARCASTER_SIGNATURE=

# Required for webhooks and background notifications
REDIS_URL=
REDIS_TOKEN=
```

3. Start the development server:

```bash
bun dev
```

## Template Features

### Frame Configuration

- `.well-known/farcaster.json` endpoint configured for Frame metadata and account association
- Frame metadata automatically added to page headers in `layout.tsx`

### Background Notifications

- Redis-backed notification system using Upstash
- Ready-to-use notification endpoints in `api/notify` and `api/webhook`
- Notification client utilities in `lib/notification-client.ts`

### Theming

- Custom theme defined in `theme.css` with OnchainKit variables
- Pixel font integration with Pixelify Sans
- Dark/light mode support through OnchainKit

### MiniKit Provider

The app is wrapped with `MiniKitProvider` in `providers.tsx`, configured with:

- OnchainKit integration
- Access to Frames context
- Sets up Wagmi Connectors
- Sets up Frame SDK listeners
- Applies Safe Area Insets

## Customization

To get started building your own frame, follow these steps:

1. Remove the DemoComponents:

    - Delete `components/DemoComponents.tsx`
    - Remove demo-related imports from `page.tsx`

2. Start building your Frame:

    - Modify `page.tsx` to create your Frame UI
    - Update theme variables in `theme.css`
    - Adjust MiniKit configuration in `providers.tsx`

3. Add your frame to your account:
    - Cast your frame to see it in action
    - Share your frame with others to start building your community

## Learn More

- [MiniKit Documentation](https://docs.base.org/builderkits/minikit/overview)
- [OnchainKit Documentation](https://docs.base.org/builderkits/onchainkit/getting-started)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Secure Smart Contract Deployments with Foundry](./docs/secure-deployments.md)

## Minikit CLI:

Integrations:
✓ MiniKit
✓ OnchainKit
✓ Base

Frameworks:

- Wagmi
- React
- Next.js
- Tailwind CSS
- ESLint
- Upstash Redis

Before launching your app:

- Set up account manifest
    - Required for app discovery, notifications, and client integration
    - Run `bunx create-onchain --manifest` from project root
- Support webhooks and background notifications (optional)
    - Set REDIS_URL and REDIS_TOKEN environment variables

## Environment Variables Management with t3-env

This project uses `t3-env` (`@t3-oss/env-nextjs`) to manage and validate environment variables for enhanced type safety and reliability.

- A comprehensive schema for all required and optional environment variables is defined in `src/env.ts`. This schema uses Zod for validation.
- To set up your local environment, copy the `.env.example` file to `.env.local` (or other relevant files like `.env.development.local`, `.env.production.local`). Then, fill in the necessary values according to the schema.
- The application is configured to validate these environment variables at build time and runtime. If any required variables are missing or do not conform to the defined schema (e.g., incorrect type, malformed URL), an error will be thrown, preventing unexpected behavior.
- If you need to skip environment variable validation for specific scenarios (e.g., during Docker builds or in certain CI environments), you can do so by setting the `SKIP_ENV_VALIDATION=true` environment variable.

This approach ensures that the application runs with a predictable and validated set of environment variables, reducing runtime errors and improving the development workflow.
