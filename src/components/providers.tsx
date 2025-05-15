'use client'

import { MiniKitProvider } from '@coinbase/onchainkit/minikit'
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react'
import { Toaster } from 'sonner'
import { base } from 'wagmi/chains'
import FrameProvider from './frame-provider'

// Create UserRole context
type UserRoleContextType = {
    userRole: 'admin' | 'regular'
    isAdmin: boolean
    toggleUserRole: () => void
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined)

export function useUserRole() {
    const context = useContext(UserRoleContext)
    if (context === undefined) {
        throw new Error('useUserRole must be used within a UserRoleProvider')
    }
    return context
}

function UserRoleProvider({ children }: { children: ReactNode }) {
    const [userRole, setUserRole] = useState<'admin' | 'regular'>('admin')

    useEffect(() => {
        const savedRole = localStorage.getItem('userRole')
        if (savedRole === 'regular' || savedRole === 'admin') {
            setUserRole(savedRole)
        }
    }, [])

    const toggleUserRole = () => {
        const newRole = userRole === 'admin' ? 'regular' : 'admin'
        setUserRole(newRole)
        if (typeof window !== 'undefined') {
            localStorage.setItem('userRole', newRole)
        }
    }

    return (
        <UserRoleContext.Provider value={{ userRole, isAdmin: userRole === 'admin', toggleUserRole }}>
            {children}
        </UserRoleContext.Provider>
    )
}

export default function Providers({ children }: { children: React.ReactNode }) {
    // Disable auto-connection by setting this flag in localStorage during development
    useEffect(() => {
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
            // Only in development, to ensure proper wallet dialog behavior with React's strict mode
            if (!localStorage.getItem('_devConnectionAttempted')) {
                localStorage.setItem('poolMiniUserManuallyDisconnected', 'true')
                localStorage.setItem('_devConnectionAttempted', 'true')
            }
        }
    }, [])

    // Use useMemo to prevent unnecessary rerenders of MiniKitProvider
    const miniKitConfig = useMemo(
        () => ({
            appearance: {
                mode: 'auto' as const,
                theme: 'pool-theme',
            },
            connection: {
                autoConnect: false,
            },
        }),
        [],
    )

    return (
        <MiniKitProvider chain={base} config={miniKitConfig}>
            <FrameProvider>
                <UserRoleProvider>
                    {children}
                    <Toaster />
                </UserRoleProvider>
            </FrameProvider>
        </MiniKitProvider>
    )
}
