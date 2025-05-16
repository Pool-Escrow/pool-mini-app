"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WaterSplashEffectProps {
  isVisible: boolean;
  onComplete: () => void;
}

export function WaterSplashEffect({ isVisible, onComplete }: WaterSplashEffectProps) {
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  
  // Auto-hide after animation completes
  useEffect(() => {
    if (isVisible) {
      // Reset animation state
      setIsAnimationComplete(false);
      
      // Schedule animation completion
      const timer = setTimeout(() => {
        setIsAnimationComplete(true);
        onComplete();
      }, 2500); // Extended to allow for more dramatic effects
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);
  
  if (!isVisible) return null;
  
  // Ripple variants with enhanced visuals - more dramatic and faster expanding
  const rippleVariants = (size: number, delay: number, duration: number, maxOpacity: number = 0.8) => ({
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: [0, size], 
      opacity: [0, maxOpacity, 0], 
      transition: { 
        duration, 
        delay,
        ease: [0.04, 0.62, 0.23, 0.98] // More energetic ease curve
      } 
    }
  });
  
  // Interactive water ripple variant - more dynamic with bigger size changes
  const interactiveRippleVariants = (delay: number, size: number, duration: number) => ({
    initial: { 
      scale: 0.2, 
      opacity: 0,
      x: Math.random() * 200 - 100,
      y: Math.random() * 200 - 100
    },
    animate: { 
      scale: [0.2, size],
      opacity: [0, 0.4, 0], // Increased opacity
      x: (Math.random() * 250 - 125) * size/2, // More dramatic movement
      y: (Math.random() * 250 - 125) * size/2, // More dramatic movement
      transition: { 
        duration, 
        delay,
        ease: [0.1, 0.6, 0.3, 1] // More energetic ease
      } 
    }
  });
  
  // Water blur/distortion effect - more dramatic
  const distortionVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: {
      scale: [0, 4], // Larger scale
      opacity: [0, 0.15, 0], // Increased opacity
      transition: {
        duration: 2,
        ease: [0.04, 0.62, 0.23, 0.98] // More energetic ease
      }
    }
  };
  
  // New underwater wave effect
  const waveVariants = {
    initial: { opacity: 0, y: 0 },
    animate: {
      opacity: [0, 0.6, 0],
      y: [-20, 20],
      transition: {
        duration: 1.5,
        ease: "easeInOut",
        repeat: 1,
        repeatType: "reverse" as const // Type as const to fix the string type error
      }
    }
  };

  return (
    <AnimatePresence>
      {!isAnimationComplete && (
        <motion.div 
          className="fixed inset-0 z-40 pointer-events-none overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Blue flash - more dramatic */}
          <motion.div 
            className="absolute inset-0 bg-blue-400/40" // Reduced opacity
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.4, 0], 
              transition: { duration: 1.2, ease: [0.04, 0.62, 0.23, 0.98] } 
            }}
          />
          
          {/* Water texture overlay - more visible */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-b from-blue-300/10 to-blue-500/15 mix-blend-overlay" // Increased opacity
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0.2] }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          
          {/* Impact ripple effect - positioned at the splash point */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {/* Initial impact ripple - more dramatic */}
            <motion.div 
              className="absolute rounded-full border-4 border-white/80" // Thicker border, more opacity
              style={{
                width: 20,
                height: 20,
                boxShadow: "0 0 30px 10px rgba(255, 255, 255, 0.4)", // Stronger glow
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 18], // Even larger scale
                opacity: [0, 0.9, 0] // Higher peak opacity
              }}
              transition={{ 
                duration: 1.2, 
                ease: [0, 0.55, 0.17, 1] // Stronger impact curve
              }}
            />
            
            {/* Primary ripple rings - multiple concentric circles - faster expanding and more spread */}
            {[...Array(10)].map((_, i) => ( // More rings
              <motion.div 
                key={`ripple-${i}`}
                className="absolute rounded-full"
                style={{
                  width: 40,
                  height: 40,
                  border: `${3.5 - Math.min(2.5, i * 0.3)}px solid rgba(255, 255, 255, ${0.8 - i * 0.07})`, // Thicker borders, more opacity
                  boxShadow: i < 3 ? "0 0 15px 3px rgba(255, 255, 255, 0.3)" : "none" // Stronger glow
                }}
                variants={rippleVariants(
                  5.5 + i * 0.9, // Even larger size multiplier for wider spread
                  0.02 + i * 0.07, // Less delay between ripples for faster sequence
                  1.2 + i * 0.15, // Faster expansion
                  0.8 - i * 0.07 // Higher peak opacity
                )}
                initial="initial"
                animate="animate"
              />
            ))}
            
            {/* Secondary ripple group - offset for more natural look - more dramatic */}
            <motion.div
              className="absolute"
              initial={{ x: 0, y: 0 }}
              animate={{ x: 50, y: -35 }} // More offset for wider spread
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              {[...Array(6)].map((_, i) => ( // More rings
                <motion.div 
                  key={`offset-ripple-${i}`}
                  className="absolute rounded-full"
                  style={{
                    width: 25,
                    height: 25,
                    border: `${2.5 - i * 0.4}px solid rgba(255, 255, 255, ${0.7 - i * 0.12})` // Thicker border
                  }}
                  variants={rippleVariants(
                    4.5 + i * 0.7, // Larger multiplier
                    0.1 + i * 0.08, // Less delay for faster appearance
                    0.9 + i * 0.15 // Faster duration
                  )}
                  initial="initial"
                  animate="animate"
                />
              ))}
            </motion.div>
            
            {/* Tertiary ripple group - another offset for more complex splash */}
            <motion.div
              className="absolute"
              initial={{ x: 0, y: 0 }}
              animate={{ x: -60, y: -25 }} // Larger offset for wider spread
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {[...Array(6)].map((_, i) => (
                <motion.div 
                  key={`tertiary-ripple-${i}`}
                  className="absolute rounded-full"
                  style={{
                    width: 25,
                    height: 25,
                    border: `${2.2 - i * 0.4}px solid rgba(255, 255, 255, ${0.65 - i * 0.1})`
                  }}
                  variants={rippleVariants(
                    4 + i * 0.6,
                    0.15 + i * 0.1,
                    0.95 + i * 0.15
                  )}
                  initial="initial"
                  animate="animate"
                />
              ))}
            </motion.div>
            
            {/* Fourth ripple group - another direction */}
            <motion.div
              className="absolute"
              initial={{ x: 0, y: 0 }}
              animate={{ x: 40, y: 45 }} // Different direction
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {[...Array(5)].map((_, i) => (
                <motion.div 
                  key={`fourth-ripple-${i}`}
                  className="absolute rounded-full"
                  style={{
                    width: 22,
                    height: 22,
                    border: `${2.2 - i * 0.4}px solid rgba(255, 255, 255, ${0.65 - i * 0.1})`
                  }}
                  variants={rippleVariants(
                    3.8 + i * 0.7,
                    0.12 + i * 0.11,
                    0.9 + i * 0.15
                  )}
                  initial="initial"
                  animate="animate"
                />
              ))}
            </motion.div>
            
            {/* Fifth ripple group - yet another direction */}
            <motion.div
              className="absolute"
              initial={{ x: 0, y: 0 }}
              animate={{ x: -35, y: 60 }} // Different direction
              transition={{ duration: 0.16, ease: "easeOut" }}
            >
              {[...Array(5)].map((_, i) => (
                <motion.div 
                  key={`fifth-ripple-${i}`}
                  className="absolute rounded-full"
                  style={{
                    width: 20,
                    height: 20,
                    border: `${2 - i * 0.4}px solid rgba(255, 255, 255, ${0.65 - i * 0.1})`
                  }}
                  variants={rippleVariants(
                    3.5 + i * 0.7,
                    0.14 + i * 0.09,
                    0.85 + i * 0.15
                  )}
                  initial="initial"
                  animate="animate"
                />
              ))}
            </motion.div>
            
            {/* Water blur/distortion effect - more dramatic */}
            <motion.div
              className="absolute rounded-full bg-gradient-radial from-blue-200/50 to-transparent" // Increased opacity
              style={{ width: 80, height: 80 }}
              variants={distortionVariants}
              initial="initial"
              animate="animate"
            />
            
            {/* Interactive water ripples - more of them, bigger and more dynamic */}
            {[...Array(35)].map((_, i) => ( // More ripples
              <motion.div
                key={`interactive-ripple-${i}`}
                className="absolute rounded-full"
                style={{
                  width: 6 + Math.random() * 14, // Bigger size
                  height: 6 + Math.random() * 14, // Bigger size
                  border: `${1 + Math.random() * 1}px solid rgba(255, 255, 255, ${0.3 + Math.random() * 0.4})`, // Thicker border, more opacity
                }}
                variants={interactiveRippleVariants(
                  0.05 + i * 0.02 + Math.random() * 0.15, // Less delay for faster reaction
                  1.4 + Math.random() * 2.2, // Bigger size for wider spread
                  0.6 + Math.random() * 1 // Faster duration
                )}
                initial="initial"
                animate="animate"
              />
            ))}
            
            {/* Underwater wave effects */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={`wave-${i}`}
                className="absolute rounded-full"
                style={{
                  width: 500 + i * 120,
                  height: 20 + i * 5,
                  top: 100 + i * 70,
                  left: -250 - i * 60,
                  background: `linear-gradient(90deg, transparent, rgba(255, 255, 255, ${0.2 - i * 0.05}), transparent)`,
                  transform: `rotate(${-5 + i * 3}deg)`
                }}
                variants={waveVariants}
                initial="initial"
                animate="animate"
                transition={{ delay: i * 0.15 }}
              />
            ))}
            
            {/* Water droplets - more of them and bigger, with greater spread */}
            {[...Array(40)].map((_, i) => { // More droplets
              const size = 8 + Math.random() * 20; // Bigger size range
              // Generate droplet variants with different sizes, directions and timings
              const createWiderDropletVariants = () => {
                // Calculate angle based on index - much wider spread
                const angle = (i / 40) * Math.PI * 2;
                
                // Calculate random distance - increased for more dramatic splash
                const distance = 150 + Math.random() * 300;
                
                // Calculate target position
                const x = Math.cos(angle) * distance;
                const y = Math.sin(angle) * distance - 120; // Stronger upward bias for more dramatic splash
                
                return {
                  initial: { 
                    x: 0, 
                    y: 0, 
                    opacity: 0, 
                    scale: 0
                  },
                  animate: { 
                    x, 
                    y, 
                    opacity: [0, 0.9, 0], // Increased opacity for more visibility
                    scale: [0, 0.9 + Math.random() * 0.8, 0], // Larger scale for more dramatic droplets
                    transition: { 
                      duration: 1.4 + Math.random() * 0.8, // Longer for more dramatic movement
                      ease: [0.1, 0.65, 0.3, 1], // More dynamic easing
                    }
                  }
                };
              };
              
              const dropletVariant = createWiderDropletVariants();
              
              return (
                <motion.div
                  key={i}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-200/90" // More opacity
                  style={{ 
                    width: size, 
                    height: size,
                    boxShadow: "0 0 10px rgba(255, 255, 255, 0.6)" // Stronger glow
                  }}
                  initial={dropletVariant.initial}
                  animate={dropletVariant.animate}
                />
              );
            })}
            
            {/* Large splash droplets - bigger and more dramatic with greater spread */}
            {[...Array(20)].map((_, i) => { // More splash elements
              const angle = (i / 20) * Math.PI * 2;
              const size = 15 + Math.random() * 30; // Bigger size
              const distance = 150 + Math.random() * 250; // Greater distance for wider spread
              
              return (
                <motion.div
                  key={`large-${i}`}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-300/90" // More opacity
                  style={{ 
                    width: size, 
                    height: size * 1.8, // More elongated
                    borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                    boxShadow: "0 0 15px rgba(255, 255, 255, 0.5)" // Stronger glow
                  }}
                  initial={{ 
                    x: 0, 
                    y: 0, 
                    opacity: 0, 
                    scale: 0,
                    rotate: 0
                  }}
                  animate={{
                    x: Math.cos(angle) * distance, // More distance
                    y: Math.sin(angle) * distance - 80, // More distance and upward bias
                    opacity: [0, 0.9, 0], // Higher peak opacity
                    scale: [0, 1.2, 0.5], // Larger scale
                    rotate: Math.random() * 90 - 45, // More rotation
                    transition: { 
                      duration: 1.3 + Math.random() * 0.6, // Longer for more dramatic movement
                      ease: [0.1, 0.6, 0.3, 1] // More energetic ease
                    }
                  }}
                />
              );
            })}
            
            {/* Additional water columns for dramatic upward splash */}
            {[...Array(12)].map((_, i) => { // More columns
              const angle = (i / 12) * Math.PI * 2;
              const distance = 20 + Math.random() * 120; // Wider spread
              const size = 25 + Math.random() * 20;
              const height = 100 + Math.random() * 120; // Higher columns
              
              return (
                <motion.div
                  key={`column-${i}`}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-200/80"
                  style={{ 
                    width: size,
                    height: 10,
                    borderRadius: "40% 40% 50% 50% / 40% 40% 60% 60%",
                    boxShadow: "0 0 15px rgba(255, 255, 255, 0.3)",
                    originY: "bottom"
                  }}
                  initial={{ 
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                    opacity: 0,
                    scaleY: 0.2,
                  }}
                  animate={{
                    x: Math.cos(angle) * distance,
                    y: [Math.sin(angle) * distance, Math.sin(angle) * distance - height, Math.sin(angle) * distance],
                    opacity: [0, 0.9, 0],
                    scaleY: [0.2, 1, 0.3],
                    transition: { 
                      duration: 1.2 + Math.random() * 0.6,
                      ease: [0.33, 1.0, 0.5, 1.0],
                      times: [0, 0.4, 1]
                    }
                  }}
                />
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 