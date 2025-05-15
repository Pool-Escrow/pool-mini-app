'use client'

import { MiniKitProvider } from '@coinbase/onchainkit/minikit'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
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
    console.log('hello')

    return (
        <MiniKitProvider
            chain={base}
            config={{
                appearance: {
                    mode: 'auto',
                    theme: 'pool-theme',
                },
            }}>
            <FrameProvider>
                <UserRoleProvider>{children}</UserRoleProvider>
            </FrameProvider>
        </MiniKitProvider>
    )
}
