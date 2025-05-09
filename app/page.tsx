"use client";

import { OnboardingOverlay } from "@/app/components/OnboardingOverlay";
import { onboardingScreens } from "@/app/components/OnboardingContent";
import { useState, useEffect } from "react";
import { HomePage } from "@/app/components/HomePage";

export default function Home() {
  // State to track if user has seen onboarding
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check local storage for onboarding flag on component mount
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
  };

  return (
    <main>
      {/* Show HomePage which conditionally renders content based on user role */}
      <HomePage />
      
      {/* Onboarding overlay for first-time users */}
      <OnboardingOverlay
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        screens={onboardingScreens}
        onComplete={handleOnboardingComplete}
      />
    </main>
  );
}
