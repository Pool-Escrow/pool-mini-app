import type { Pool } from '@/types/pool'

const POOLS_STORAGE_KEY = 'pools'

// Helper function to get pools from local storage
const getStoredPools = (): Pool[] => {
    if (typeof window === 'undefined') {
        // On server, return empty array to avoid hydration issues
        return []
    }

    const storedPools = localStorage.getItem(POOLS_STORAGE_KEY)
    return storedPools ? (JSON.parse(storedPools) as Pool[]) : []
}

// Helper function to save pools to local storage
const saveStoredPools = (pools: Pool[]): void => {
    if (typeof window === 'undefined') {
        return
    }
    localStorage.setItem(POOLS_STORAGE_KEY, JSON.stringify(pools))
}

// Initialize empty pools storage if it doesn't exist
export const initializePoolsStorage = (): void => {
    if (typeof window === 'undefined') return

    const storedPools = localStorage.getItem(POOLS_STORAGE_KEY)
    if (!storedPools) {
        saveStoredPools([])
    }
}

// Helper to properly format image paths
const formatImagePath = (imagePath: string): string => {
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath
    }

    // If it's a template format (template-1, template-2, etc.)
    if (imagePath.startsWith('template-')) {
        // Extract the template number
        const templateMatch = /template-(\d+)/.exec(imagePath)
        if (templateMatch) {
            const templateNum = parseInt(templateMatch[1], 10)
            // Use the new image path format
            return `/images/image${templateNum}.png`
        }

        // Fallback to old path format if parsing fails
        return `/images/${imagePath}.jpg`
    }

    // Ensure path starts with slash
    return imagePath.startsWith('/') ? imagePath : `/${imagePath}`
}

export const createPool = (poolData: Omit<Pool, 'id' | 'createdAt'>): Pool => {
    const pools = getStoredPools()

    // Format the image path if provided
    const formattedData = {
        ...poolData,
        selectedImage: poolData.selectedImage ? formatImagePath(poolData.selectedImage) : poolData.selectedImage,
    }

    const newPool: Pool = {
        ...formattedData,
        id: crypto.randomUUID(),
        createdAt: new Date(),
    }
    pools.push(newPool)
    saveStoredPools(pools)
    return newPool
}

export const getPools = (): Pool[] => {
    return getStoredPools()
}

export const getPoolById = (id: string): Pool | undefined => {
    const pools = getStoredPools()
    return pools.find(pool => pool.id === id)
}

export const updatePool = (id: string, updates: Partial<Omit<Pool, 'id' | 'createdAt'>>): Pool | undefined => {
    const pools = getStoredPools()
    const poolIndex = pools.findIndex(pool => pool.id === id)
    if (poolIndex === -1) {
        return undefined
    }

    // Format the image path if it's being updated
    const formattedUpdates = updates.selectedImage
        ? { ...updates, selectedImage: formatImagePath(updates.selectedImage) }
        : updates

    pools[poolIndex] = { ...pools[poolIndex], ...formattedUpdates }
    saveStoredPools(pools)
    return pools[poolIndex]
}

export const deletePool = (id: string): boolean => {
    let pools = getStoredPools()
    const initialLength = pools.length
    pools = pools.filter(pool => pool.id !== id)
    if (pools.length < initialLength) {
        saveStoredPools(pools)
        return true
    }
    return false
}

// Clear all pools (for testing purposes)
export const clearAllPools = (): void => {
    if (typeof window === 'undefined') return
    saveStoredPools([])
}
