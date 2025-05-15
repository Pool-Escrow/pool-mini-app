'use client'

import { useEffect, useState, use } from 'react'
import { PoolDashboard } from '@/components/PoolDashboard'
import { getPoolById, initializePoolsStorage } from '@/lib/poolStorage'
import type { Pool } from '@/types/pool'
import { useRouter } from 'next/navigation'

export default function PoolPage({ params }: { params: Promise<{ id: string }> }) {
    const [pool, setPool] = useState<Pool | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const { id } = use(params)

    useEffect(() => {
        // Initialize pools if needed
        initializePoolsStorage()

        // Get the pool by ID
        const foundPool = getPoolById(id)

        if (foundPool) {
            // Convert date strings to Date objects if needed
            // This ensures consistent handling of dates between server and client
            const processedPool = {
                ...foundPool,
                createdAt: new Date(foundPool.createdAt),
                startTime: new Date(foundPool.startTime),
            }

            setPool(processedPool)
        } else {
            // Redirect to home if pool not found
            router.push('/')
        }

        setLoading(false)
    }, [id, router])

    if (loading) {
        return (
            <div className='flex min-h-screen items-center justify-center bg-white'>
                <div className='h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500' />
            </div>
        )
    }

    if (!pool) {
        return (
            <div className='flex min-h-screen items-center justify-center bg-white text-gray-800'>
                <div className='text-center'>
                    <h1 className='mb-2 text-2xl font-bold'>Pool Not Found</h1>
                    <p className='mb-4'>The pool you are looking for does not exist.</p>
                    <button onClick={() => router.push('/')} className='rounded-lg bg-blue-500 px-4 py-2 text-white'>
                        Return Home
                    </button>
                </div>
            </div>
        )
    }

    return <PoolDashboard pool={pool} />
}
