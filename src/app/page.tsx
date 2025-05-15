'use client'

import { HomePage } from '@/components/HomePage'
import { onboardingScreens } from '@/components/OnboardingContent'
import { OnboardingOverlay } from '@/components/OnboardingOverlay'
import { useWallet } from '@/hooks/use-wallet'
import { useEffect, useState } from 'react'

const MANUAL_DISCONNECT_KEY = 'poolMiniUserManuallyDisconnected' // Define the key here as well for use

export default function MainPage() {
    // State to track if user has seen onboarding
    const { connectWallet, isConnected } = useWallet()
    const [showOnboarding, setShowOnboarding] = useState(false)

    // Check local storage for onboarding flag on component mount
    useEffect(() => {
        const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding')
        // Only show onboarding if it hasn't been seen AND the wallet is not already connected
        if (!hasSeenOnboarding && !isConnected) {
            setShowOnboarding(true)
        }
    }, [isConnected])

    // Handle onboarding completion
    const handleOnboardingComplete = () => {
        console.log('[page.tsx] handleOnboardingComplete called') // Log: Function entry
        localStorage.setItem('hasSeenOnboarding', 'true')
        setShowOnboarding(false) // Close the overlay

        console.log('[page.tsx] isConnected before connectWallet call:', isConnected) // Log: isConnected state
        // Attempt to connect wallet only if not already connected
        if (!isConnected) {
            // Explicitly clear the manual disconnect flag before user-initiated connection from onboarding
            if (typeof window !== 'undefined') {
                localStorage.removeItem(MANUAL_DISCONNECT_KEY)
                console.log('[page.tsx] Cleared MANUAL_DISCONNECT_KEY for onboarding connection attempt')
            }
            console.log('[page.tsx] Attempting to call connectWallet()') // Log: Before calling connectWallet
            void connectWallet()
        } else {
            console.log('[page.tsx] Wallet already connected, not calling connectWallet()') // Log: If already connected
        }
    }

    return (
        <main>
            <HomePage />
            <OnboardingOverlay
                isOpen={showOnboarding}
                onClose={() => setShowOnboarding(false)}
                screens={onboardingScreens}
                onComplete={handleOnboardingComplete}
            />
        </main>
    )
}
