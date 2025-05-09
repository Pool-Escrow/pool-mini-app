"use client";

import { useState, useEffect, ReactNode } from "react";

interface OnboardingOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  screens: ReactNode[];
  onComplete?: () => void;
}

export function OnboardingOverlay({
  isOpen,
  onClose,
  screens,
  onComplete,
}: OnboardingOverlayProps) {
  const [currentScreen, setCurrentScreen] = useState(0);

  // Reset to first screen when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentScreen(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isFirstScreen = currentScreen === 0;
  const isLastScreen = currentScreen === screens.length - 1;

  const handleNext = () => {
    if (isLastScreen) {
      if (onComplete) onComplete();
      onClose();
    } else {
      setCurrentScreen((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstScreen) {
      setCurrentScreen((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    if (onComplete) onComplete();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg flex flex-col overflow-hidden">
        {/* Header with close button */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div className="text-sm font-medium text-gray-500">
            {currentScreen + 1} / {screens.length}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close onboarding"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Content area */}
        <div className="flex-grow p-6 overflow-y-auto">
          {screens[currentScreen]}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center p-4 border-t border-gray-200">
          <div>
            {!isFirstScreen && (
              <button
                onClick={handlePrevious}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <svg 
                  className="w-4 h-4 mr-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Skip
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg flex items-center"
            >
              {isLastScreen ? "Get Started" : "Next"}
              {!isLastScreen && (
                <svg 
                  className="w-4 h-4 ml-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 