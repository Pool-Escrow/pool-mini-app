import { deleteUserNotificationDetails, setUserNotificationDetails } from '@/lib/notification'
import { sendFrameNotification } from '@/lib/notification-client'
import { createPublicClient, http } from 'viem'
import { optimism } from 'viem/chains'

const appName = process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME

const KEY_REGISTRY_ADDRESS = '0x00000000Fc1237824fb747aBDE0FF18990E59b7e'

const KEY_REGISTRY_ABI = [
    {
        inputs: [
            { name: 'fid', type: 'uint256' },
            { name: 'key', type: 'bytes' },
        ],
        name: 'keyDataOf',
        outputs: [
            {
                components: [
                    { name: 'state', type: 'uint8' },
                    { name: 'keyType', type: 'uint32' },
                ],
                name: '',
                type: 'tuple',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
] as const

// Define NotificationDetails based on what setUserNotificationDetails and sendFrameNotification expect
interface NotificationDetails {
    url: string
    token: string
    // any other properties if used by those functions
}

// For the overall request JSON structure
interface WebhookRequestJson {
    header: string // encodedHeader
    payload: string // encodedPayload
    // Add other potential top-level properties if they exist
}

// For the decoded header
interface DecodedHeader {
    fid: number
    key: `0x${string}`
    // Add other potential properties from decoded header
}

// For the decoded payload (event)
interface BaseEventPayload {
    event: 'frame_added' | 'frame_removed' | 'notifications_enabled' | 'notifications_disabled'
    notificationDetails?: NotificationDetails | null // Optional and can be null
    // Add other common event properties
}

async function verifyFidOwnership(fid: number, appKey: `0x${string}`) {
    const client = createPublicClient({
        chain: optimism,
        transport: http(),
    })

    try {
        const result = await client.readContract({
            address: KEY_REGISTRY_ADDRESS,
            abi: KEY_REGISTRY_ABI,
            functionName: 'keyDataOf',
            args: [BigInt(fid), appKey],
        })

        // Assuming result is of the type defined by KEY_REGISTRY_ABI outputs
        // The ABI implies result is { state: number, keyType: number }
        return result.state === 1 && result.keyType === 1
    } catch (error) {
        console.error('Key Registry verification failed:', error)
        return false
    }
}

function decode<T>(encoded: string): T {
    return JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8')) as T
}

export async function POST(request: Request) {
    const requestJson = (await request.json()) as WebhookRequestJson

    const { header: encodedHeader, payload: encodedPayload } = requestJson

    const headerData = decode<DecodedHeader>(encodedHeader)
    const eventData = decode<BaseEventPayload>(encodedPayload) // Changed variable name for clarity

    const { fid, key } = headerData

    if (!fid || !key) {
        // Basic validation
        return Response.json({ success: false, error: 'Missing fid or key in header' }, { status: 400 })
    }

    const valid = await verifyFidOwnership(fid, key)

    if (!valid) {
        return Response.json({ success: false, error: 'Invalid FID ownership' }, { status: 401 })
    }

    switch (eventData.event) {
        case 'frame_added':
            console.log('frame_added', 'eventData.notificationDetails', eventData.notificationDetails)
            if (eventData.notificationDetails) {
                await setUserNotificationDetails(fid, eventData.notificationDetails)
                await sendFrameNotification({
                    fid,
                    title: `Welcome to ${appName ?? 'our app'}`,
                    body: `Thank you for adding ${appName ?? 'our app'}`,
                    // notificationDetails from eventData should match what sendFrameNotification expects
                    // if sendFrameNotification needs specific details, ensure eventData.notificationDetails provides them
                    // or transform eventData.notificationDetails here.
                    // For now, assuming it's compatible or optional.
                    notificationDetails: eventData.notificationDetails ?? undefined,
                })
            } else {
                // Ensure deleteUserNotificationDetails doesn't expect a second arg if not provided.
                await deleteUserNotificationDetails(fid)
            }

            break
        case 'frame_removed': {
            console.log('frame_removed')
            await deleteUserNotificationDetails(fid)
            break
        }
        case 'notifications_enabled': {
            console.log('notifications_enabled', eventData.notificationDetails)
            if (eventData.notificationDetails) {
                // Ensure notificationDetails exists
                await setUserNotificationDetails(fid, eventData.notificationDetails)
                await sendFrameNotification({
                    fid,
                    title: `Welcome to ${appName ?? 'our app'}`,
                    body: `Thank you for enabling notifications for ${appName ?? 'our app'}`,
                    notificationDetails: eventData.notificationDetails ?? undefined,
                })
            } else {
                // Handle case where notifications_enabled is missing details if that's possible/problematic
                console.warn('notifications_enabled event missing notificationDetails for FID:', fid)
                // Optionally, delete details or send a generic notification
                await deleteUserNotificationDetails(fid) // Or a different action
            }

            break
        }
        case 'notifications_disabled': {
            console.log('notifications_disabled')
            await deleteUserNotificationDetails(fid)

            break
        }
        default:
            // Handle unknown event types if necessary
            console.warn('Received unknown event type:', eventData.event)
            return Response.json({ success: false, error: 'Unknown event type' }, { status: 400 })
    }

    return Response.json({ success: true })
}
