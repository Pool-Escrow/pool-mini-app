'use client'

import { PoolCard } from '@/components/PoolCard'
import type { Pool } from '@/types/pool'

interface PoolShowcaseProps {
    title?: string
    pools: Pool[]
    showCreator?: boolean
}

export function PoolShowcase({ title = 'Community Pools', pools, showCreator = true }: PoolShowcaseProps) {
    // Mock creator data - in a real app, this would come from a database
    // const creators = { ... }

    // If no pools, show empty state
    if (pools.length === 0) {
        return (
            <div className='mb-4 rounded-xl bg-white p-6 shadow-sm'>
                <h2 className='mb-4 text-xl font-bold text-gray-900'>{title}</h2>
                <div className='rounded-lg bg-gray-50 p-8 text-center'>
                    <p className='text-gray-500'>No pools available at the moment</p>
                </div>
            </div>
        )
    }

    return (
        <div className='mb-4 rounded-xl bg-white p-6 shadow-sm'>
            <h2 className='mb-4 text-xl font-bold text-gray-900'>{title}</h2>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                {pools.map(pool => {
                    // Randomly assign a creator for demonstration
                    // const creatorId = String(Math.floor(Math.random() * 6) + 1)
                    // const creator = creators[creatorId as keyof typeof creators]

                    // Determine creator details based on actual pool data if available
                    // For now, we'll pass undefined, or use pool.onChainPoolAdmin if desired.
                    // This part might need a more robust solution for fetching creator profiles.
                    const creatorName: string | undefined = undefined
                    const creatorAvatar: string | undefined = undefined

                    // Example: if (showCreator && pool.onChainPoolAdmin) {
                    //    creatorName = pool.onChainPoolAdmin; // Or fetch a profile
                    //    // creatorAvatar = ... // fetch avatar based on admin/creatorId
                    // }

                    return (
                        <PoolCard
                            key={pool.id}
                            pool={pool}
                            creatorName={showCreator ? creatorName : undefined}
                            creatorAvatar={showCreator ? creatorAvatar : undefined}
                            showCreator={showCreator}
                        />
                    )
                })}
            </div>
        </div>
    )
}
