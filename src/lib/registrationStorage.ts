// Store registrations with poolId -> user addresses mapping
const REGISTRATIONS_STORAGE_KEY = 'pool_registrations'

interface Registration {
    poolId: string
    userAddress: string
    timestamp: Date
}

// Helper function to get registrations from local storage
export const getStoredRegistrations = (): Registration[] => {
    if (typeof window === 'undefined') {
        return []
    }

    const storedRegistrations = localStorage.getItem(REGISTRATIONS_STORAGE_KEY)
    return storedRegistrations ? (JSON.parse(storedRegistrations) as Registration[]) : []
}

// Helper function to save registrations to local storage
const saveStoredRegistrations = (registrations: Registration[]): void => {
    if (typeof window === 'undefined') {
        return
    }

    localStorage.setItem(REGISTRATIONS_STORAGE_KEY, JSON.stringify(registrations))
}

// Initialize empty registrations storage if it doesn't exist
export const initializeRegistrationsStorage = (): void => {
    if (typeof window === 'undefined') return

    const storedRegistrations = localStorage.getItem(REGISTRATIONS_STORAGE_KEY)
    if (!storedRegistrations) {
        saveStoredRegistrations([])
    }
}

// Register a user for a pool
export const registerUserForPool = (poolId: string, userAddress: string): boolean => {
    const registrations = getStoredRegistrations()

    // Check if user is already registered
    const existingRegistration = registrations.find(reg => reg.poolId === poolId && reg.userAddress === userAddress)

    if (existingRegistration) {
        return false // Already registered
    }

    // Add new registration
    registrations.push({
        poolId,
        userAddress,
        timestamp: new Date(),
    })

    saveStoredRegistrations(registrations)

    // Update the pool's registration count
    void import('./poolStorage').then(({ getPoolById, updatePool }) => {
        const pool = getPoolById(poolId)
        if (pool) {
            updatePool(poolId, { registrations: (pool.registrations ?? 0) + 1 })
        }
    })

    return true
}

// Cancel a user's registration for a pool
export const cancelUserRegistration = (poolId: string, userAddress: string): boolean => {
    let registrations = getStoredRegistrations()
    const initialLength = registrations.length

    registrations = registrations.filter(reg => !(reg.poolId === poolId && reg.userAddress === userAddress))

    if (registrations.length < initialLength) {
        saveStoredRegistrations(registrations)

        // Update the pool's registration count
        void import('./poolStorage').then(({ getPoolById, updatePool }) => {
            const pool = getPoolById(poolId)
            if (pool && pool.registrations > 0) {
                updatePool(poolId, { registrations: pool.registrations - 1 })
            }
        })

        return true
    }

    return false
}

// Check if a user is registered for a specific pool
export const isUserRegisteredForPool = (poolId: string, userAddress: string): boolean => {
    const registrations = getStoredRegistrations()

    return registrations.some(reg => reg.poolId === poolId && reg.userAddress === userAddress)
}

// Get all registrations for a specific pool
export const getPoolRegistrations = (poolId: string): Registration[] => {
    const registrations = getStoredRegistrations()
    return registrations.filter(reg => reg.poolId === poolId)
}

// Get all pools a user is registered for
export const getUserRegisteredPools = (userAddress: string): string[] => {
    const registrations = getStoredRegistrations()
    return registrations.filter(reg => reg.userAddress === userAddress).map(reg => reg.poolId)
}

// Clear all registrations (for testing purposes)
export const clearAllRegistrations = (): void => {
    if (typeof window === 'undefined') return
    saveStoredRegistrations([])
}
