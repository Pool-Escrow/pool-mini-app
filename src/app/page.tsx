'use client'

import { HomePage } from '@/components/HomePage'
import { onboardingScreens } from '@/components/OnboardingContent'
import { OnboardingOverlay } from '@/components/OnboardingOverlay'
import { useWallet } from '@/hooks/use-wallet'
import { useEffect, useState } from 'react'

export default function MainPage() {
    // State to track if user has seen onboarding
    const { connectWallet } = useWallet()
    const [showOnboarding, setShowOnboarding] = useState(false)

    useEffect(() => {
        if (window.ethereum /*&& window.ethereum.isFrame*/) {
            // console.log("is mini app?", window.ethereum);
            connectWallet()
        }
    }, [connectWallet])

    // Check local storage for onboarding flag on component mount
    useEffect(() => {
        const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding')
        if (!hasSeenOnboarding) {
            setShowOnboarding(true)
        }
    }, [])

    // Handle onboarding completion
    const handleOnboardingComplete = () => {
        localStorage.setItem('hasSeenOnboarding', 'true')
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
