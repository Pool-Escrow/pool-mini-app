import { sendFrameNotification } from '@/lib/notification-client'
import { NextResponse } from 'next/server'

// Define an interface for the expected request body
interface NotifyRequestBody {
    fid: number // Assuming fid is a number, adjust if not
    notification: {
        title: string
        body: string
        notificationDetails?: {
            url: string
            token: string
            // Add other expected properties if any
        }
        // Add other expected properties for notification
    }
    // Add other top-level expected properties from body
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as NotifyRequestBody // Type assertion
        const { fid, notification } = body

        // Now, `notification.title`, `notification.body`, etc., should be typed
        const result = await sendFrameNotification({
            fid,
            title: notification.title,
            body: notification.body,
            notificationDetails: notification.notificationDetails,
        })

        if (result.state === 'error') {
            return NextResponse.json({ error: result.error }, { status: 500 })
        }

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (error) {
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 400 },
        )
    }
}
