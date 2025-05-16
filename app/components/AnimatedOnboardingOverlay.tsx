"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { onboardingScreens } from './OnboardingContent';

interface AnimatedOnboardingOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export function AnimatedOnboardingOverlay({ 
  isOpen, 
  onClose,
  onComplete
}: AnimatedOnboardingOverlayProps) {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [isWaterFilled, setIsWaterFilled] = useState(false);
  const [isDiving, setIsDiving] = useState(false);
  const [showRipples, setShowRipples] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Reset to first screen when closed and reopened
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setCurrentScreen(0);
      setIsDiving(false);
      setShowRipples(false);
      
      // Start water filling animation
      setIsWaterFilled(false);
      const timer = setTimeout(() => {
        setIsWaterFilled(true);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle fade out and close
  useEffect(() => {
    if (!isVisible && isOpen) {
      // Wait for fade out animation to complete before actually closing
      const timer = setTimeout(() => {
        onClose();
      }, 500); // Match this with the animation duration in the AnimatePresence
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, isOpen, onClose]);

  const isFirstScreen = currentScreen === 0;
  const isLastScreen = currentScreen === onboardingScreens.length - 1;

  const handleNext = () => {
    if (isLastScreen) {
      if (isLastScreen) {
        // Trigger diving animation on last screen
        setIsDiving(true);
        setShowRipples(true);
        
        // Delay the fade out to allow diving animation to complete
        setTimeout(() => {
          if (onComplete) onComplete();
          setIsVisible(false); // Trigger fade out
        }, 1500); // Match this with the animation duration
      }
    } else {
      setCurrentScreen(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstScreen) {
      setCurrentScreen(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    if (onComplete) onComplete();
    setIsVisible(false); // Trigger fade out instead of closing immediately
  };

  // If not open, don't render at all
  if (!isOpen) return null;

  // Wave animation effect
  const waveVariants = {
    initial: {
      y: '100%',
    },
    animate: {
      y: '0%',
      transition: {
        duration: 1.8,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  // Card floating animation
  const cardVariants = {
    initial: {
      y: 100,
      opacity: 0,
      rotate: 2,
    },
    animate: {
      y: 0,
      opacity: 1,
      rotate: 0,
      transition: {
        delay: 0.6,
        duration: 1.3,
        type: "spring",
        damping: 12,
      },
    },
    diving: {
      y: [0, -20, 400],
      scale: [1, 1.1, 0.7],
      opacity: [1, 1, 0],
      rotate: [0, -3, 10],
      transition: {
        duration: 1.5,
        ease: [0.4, 0, 0.7, 1],
      },
    }
  };

  // Small bubbles animation
  const bubbleVariants = (delay: number) => ({
    initial: { y: 30, opacity: 0 },
    animate: { 
      y: -40, 
      opacity: [0, 0.7, 0],
      transition: { 
        delay, 
        duration: 2, 
        repeat: Infinity,
        repeatDelay: Math.random() * 2 + 1
      }
    },
    diving: {
      y: [-20, -200],
      opacity: [0, 0.9, 0],
      scale: [0.5, 1.5],
      transition: {
        duration: 1,
        delay: delay * 0.1,
        ease: "easeOut"
      }
    }
  });

  // Ripple effect animation
  const rippleVariants = {
    initial: {
      opacity: 0,
      scale: 0,
    },
    animate: {
      opacity: [0, 0.7, 0],
      scale: [0, 1.5],
      transition: {
        duration: 1.2,
        ease: "easeOut",
      }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Water filling background */}
          <motion.div 
            className="absolute inset-0 bg-blue-500/5 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
          
          {/* Animated water overlay with waves */}
          <motion.div 
            className="absolute inset-0 pointer-events-none overflow-hidden"
            variants={waveVariants}
            initial="initial"
            animate={isWaterFilled ? "animate" : "initial"}
          >
            {/* Main water body - positioned below the waves */}
            <div className="absolute inset-0 top-16 bg-blue-400/85"></div>
            
            {/* Wave SVG for top of water */}
            <div className="absolute top-0 left-0 w-full transform -translate-y-1">
              <motion.div 
                className="relative w-full z-10"
                animate={{
                  x: [0, -50, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 5,
                  ease: "easeInOut",
                }}
              >
                <svg 
                  className="w-[200%] h-24" 
                  viewBox="0 0 1200 60" 
                  preserveAspectRatio="none"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M0,0 C100,40 200,60 300,30 C400,0 500,30 600,50 C700,65 800,25 900,15 C1000,5 1100,25 1200,45 L1200,200 L0,200 Z" 
                    fill="rgba(96, 165, 250, 0.85)"
                  />
                </svg>
              </motion.div>
            </div>
            
            {/* Second offset wave for more realistic effect */}
            <div className="absolute top-0 left-0 w-full transform -translate-y-5">
              <motion.div 
                className="relative w-full z-20"
                animate={{
                  x: [-50, 0, -50],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 7,
                  ease: "easeInOut",
                }}
              >
                <svg 
                  className="w-[200%] h-24" 
                  viewBox="0 0 1200 40" 
                  preserveAspectRatio="none"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M0,15 C100,35 200,5 300,25 C400,45 500,15 600,5 C700,25 800,35 900,20 C1000,5 1100,35 1200,30 L1200,200 L0,200 Z" 
                    fill="rgba(96, 165, 250, 0.65)"
                  />
                </svg>
              </motion.div>
            </div>
          </motion.div>

          {/* Decorative bubbles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  width: `${Math.random() * 15 + 5}px`,
                  height: `${Math.random() * 15 + 5}px`,
                  left: `${Math.random() * 80 + 10}%`,
                  bottom: `${Math.random() * 20}%`,
                }}
                variants={bubbleVariants(i * 0.2)}
                initial="initial"
                animate={isDiving ? "diving" : "animate"}
              />
            ))}
            
            {/* Extra diving bubbles - only visible during dive */}
            {isDiving && [...Array(15)].map((_, i) => (
              <motion.div
                key={`dive-bubble-${i}`}
                className="absolute rounded-full bg-white"
                style={{
                  width: `${Math.random() * 20 + 10}px`,
                  height: `${Math.random() * 20 + 10}px`,
                  left: `${Math.random() * 60 + 20}%`,
                  top: `${Math.random() * 40 + 50}%`,
                }}
                initial={{ opacity: 0, y: 0, scale: 0.2 }}
                animate={{ 
                  opacity: [0, 0.8, 0],
                  y: -200, 
                  scale: Math.random() * 0.8 + 0.5,
                  transition: { 
                    duration: 1.2,
                    delay: Math.random() * 0.5,
                  }
                }}
              />
            ))}
          </div>
          
          {/* Water ripple effect - appears when diving */}
          {showRipples && (
            <div className="absolute z-30 left-0 right-0 mx-auto flex justify-center items-center" style={{ top: '60%' }}>
              <motion.div 
                className="w-40 h-40 rounded-full border-4 border-white/30 absolute"
                variants={rippleVariants}
                initial="initial"
                animate="animate"
              />
              <motion.div 
                className="w-40 h-40 rounded-full border-4 border-white/20 absolute"
                variants={rippleVariants}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.2 }}
              />
              <motion.div 
                className="w-40 h-40 rounded-full border-4 border-white/10 absolute"
                variants={rippleVariants}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.4 }}
              />
            </div>
          )}

          {/* Content card with floating/diving animation */}
          <motion.div 
            className="relative z-10 bg-white rounded-xl overflow-hidden shadow-xl w-[90%] max-w-md mx-auto"
            variants={cardVariants}
            initial="initial"
            animate={isDiving ? "diving" : "animate"}
          >
            {/* Header with screen number */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <div className="text-sm font-medium text-gray-500">
                {currentScreen + 1} / {onboardingScreens.length}
              </div>
              <button
                onClick={() => setIsVisible(false)}
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
            
            <div className="p-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentScreen}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {onboardingScreens[currentScreen]}
                </motion.div>
              </AnimatePresence>
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
                {!isDiving && (
                  <button
                    onClick={handleSkip}
                    className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    Skip
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg flex items-center"
                  disabled={isDiving}
                >
                  {isLastScreen ? "Dive in" : "Next"}
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 