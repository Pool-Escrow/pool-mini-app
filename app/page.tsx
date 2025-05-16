"use client";

import { OnboardingOverlay } from "@/app/components/OnboardingOverlay";
import { AnimatedOnboardingOverlay } from "@/app/components/AnimatedOnboardingOverlay";
import { WaterSplashEffect } from "@/app/components/WaterSplashEffect";
import { onboardingScreens } from "@/app/components/OnboardingContent";
import { useState, useEffect } from "react";
import { HomePage } from "@/app/components/HomePage";

export default function Home() {
  // State to track if user has seen onboarding
  const [showOnboarding, setShowOnboarding] = useState(false);
  // State to track splash animation
  const [showSplash, setShowSplash] = useState(false);

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

  // Handle onboarding close with splash effect
  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    // Trigger splash effect
    setShowSplash(true);
  };

  // Handle splash effect completion
  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <main className="relative">
      {/* Show HomePage which conditionally renders content based on user role */}
      <HomePage />
      
      {/* Animated Onboarding overlay with water filling effect */}
      <AnimatedOnboardingOverlay
        isOpen={showOnboarding}
        onClose={handleOnboardingClose}
        onComplete={handleOnboardingComplete}
      />
      
      {/* Water splash effect after onboarding */}
      <WaterSplashEffect 
        isVisible={showSplash}
        onComplete={handleSplashComplete}
      />
      
      {/* Test button to show animation again (for development purposes) */}
      <button 
        onClick={() => setShowOnboarding(true)}
        className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white font-medium p-2 rounded-full shadow-lg z-40"
        aria-label="Show onboarding"
      >
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>
    </main>
  );
}
