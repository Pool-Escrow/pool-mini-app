'use client'

import { createContext, useContext, type ReactNode } from 'react'

const IsMiniAppContext = createContext<boolean>(false)

export const useIsMiniApp = () => useContext(IsMiniAppContext)

export const IsMiniAppProvider = ({ value, children }: { value: boolean; children: ReactNode }) => {
    return <IsMiniAppContext.Provider value={value}>{children}</IsMiniAppContext.Provider>
}
