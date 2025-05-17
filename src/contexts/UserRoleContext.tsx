'use client'

import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'

// Define the possible user roles
export type UserRole = 'admin' | 'regular'

interface UserRoleContextType {
    userRole: UserRole
    isAdmin: boolean
    toggleUserRole: () => void
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined)

/**
 * Custom hook to access user role context
 */
export function useUserRole() {
    const context = useContext(UserRoleContext)
    if (context === undefined) {
        throw new Error('useUserRole must be used within a UserRoleProvider')
    }
    return context
}

/**
 * Provider component for user role state
 */
export function UserRoleProvider({ children }: { children: ReactNode }) {
    // Default to regular user but check localStorage on mount
    const [userRole, setUserRole] = useState<UserRole>('regular')
    const [isInitialized, setIsInitialized] = useState(false)

    // Load user role from localStorage on mount
    useEffect(() => {
        // Only run this once on client-side
        if (typeof window !== 'undefined' && !isInitialized) {
            const savedRole = localStorage.getItem('userRole')
            if (savedRole === 'regular' || savedRole === 'admin') {
                setUserRole(savedRole as UserRole)
            }
            setIsInitialized(true)
        }
    }, [isInitialized])

    // Toggle between admin and regular user
    const toggleUserRole = () => {
        const newRole: UserRole = userRole === 'admin' ? 'regular' : 'admin'
        setUserRole(newRole)
        if (typeof window !== 'undefined') {
            localStorage.setItem('userRole', newRole)
        }
    }

    // Memoized context value to prevent unnecessary re-renders
    const contextValue = {
        userRole,
        isAdmin: userRole === 'admin',
        toggleUserRole,
    }

    return <UserRoleContext.Provider value={contextValue}>{children}</UserRoleContext.Provider>
}
