import type { Giveaway } from '@/components/GiveawayWizard'

const GIVEAWAYS_STORAGE_KEY = 'giveaways'

// Helper function to get giveaways from local storage
const getStoredGiveaways = (): Giveaway[] => {
    if (typeof window === 'undefined') {
        return []
    }
    const storedGiveaways = localStorage.getItem(GIVEAWAYS_STORAGE_KEY)
    return storedGiveaways ? (JSON.parse(storedGiveaways) as Giveaway[]) : []
}

// Helper function to save giveaways to local storage
const saveStoredGiveaways = (giveaways: Giveaway[]): void => {
    if (typeof window === 'undefined') {
        return
    }
    localStorage.setItem(GIVEAWAYS_STORAGE_KEY, JSON.stringify(giveaways))
}

export const createGiveaway = (giveawayData: Omit<Giveaway, 'id' | 'createdAt'>): Giveaway => {
    const giveaways = getStoredGiveaways()
    const newGiveaway: Giveaway = {
        ...giveawayData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
    }
    giveaways.push(newGiveaway)
    saveStoredGiveaways(giveaways)
    return newGiveaway
}

export const getGiveaways = (): Giveaway[] => {
    return getStoredGiveaways()
}

export const getGiveawayById = (id: string): Giveaway | undefined => {
    const giveaways = getStoredGiveaways()
    return giveaways.find(giveaway => giveaway.id === id)
}

export const updateGiveaway = (
    id: string,
    updates: Partial<Omit<Giveaway, 'id' | 'createdAt'>>,
): Giveaway | undefined => {
    const giveaways = getStoredGiveaways()
    const giveawayIndex = giveaways.findIndex(giveaway => giveaway.id === id)
    if (giveawayIndex === -1) {
        return undefined
    }
    giveaways[giveawayIndex] = { ...giveaways[giveawayIndex], ...updates }
    saveStoredGiveaways(giveaways)
    return giveaways[giveawayIndex]
}

export const deleteGiveaway = (id: string): boolean => {
    let giveaways = getStoredGiveaways()
    const initialLength = giveaways.length
    giveaways = giveaways.filter(giveaway => giveaway.id !== id)
    if (giveaways.length < initialLength) {
        saveStoredGiveaways(giveaways)
        return true
    }
    return false
}
