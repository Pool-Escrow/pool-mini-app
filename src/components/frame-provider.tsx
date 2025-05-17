'use client'

import { useMiniKit } from '@coinbase/onchainkit/minikit'
import { useEffect, useRef } from 'react'

export default function FrameProvider({ children }: { children: React.ReactNode }) {
    const { setFrameReady, isFrameReady } = useMiniKit()
    const calledSetReady = useRef(false)

    useEffect(() => {
        if (!isFrameReady && !calledSetReady.current) {
            console.log('App: Setting frame ready (once)')
            void setFrameReady()
            calledSetReady.current = true
        }
    }, [setFrameReady, isFrameReady])

    return <>{children}</>
}
