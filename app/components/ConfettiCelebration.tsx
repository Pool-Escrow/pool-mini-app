"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiCelebrationProps {
  isVisible: boolean;
  onComplete?: () => void;
}

export function ConfettiCelebration({ 
  isVisible, 
  onComplete
}: ConfettiCelebrationProps) {
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  
  // Auto-hide after animation completes
  useEffect(() => {
    if (isVisible) {
      // Reset animation state
      setIsAnimationComplete(false);
      
      // Schedule animation completion - faster animation
      const timer = setTimeout(() => {
        setIsAnimationComplete(true);
        if (onComplete) onComplete();
      }, 2000); // Shorter duration (2 seconds)
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);
  
  if (!isVisible) return null;
  
  // Generate confetti with different sizes and more explosive motion
  const createConfettiVariants = (i: number) => {
    // More centered initial position for explosion effect
    const xStart = Math.random() * 40 - 20; // Tighter initial position
    const yStart = Math.random() * 40 - 20; // Tighter initial position
    
    // Calculate random angle but with more explosive distance
    const angle = Math.random() * Math.PI * 2;
    const distance = 300 + Math.random() * 700; // Much larger distance for explosion effect
    
    // Calculate target position
    const xEnd = xStart + Math.cos(angle) * distance;
    const yEnd = yStart + Math.sin(angle) * distance;
    
    // More dramatic rotation
    const rotateStart = Math.random() * 180;
    const rotateEnd = rotateStart + Math.random() * 1440 - 720; // 2-4 full rotations
    
    return {
      initial: { 
        x: xStart, 
        y: yStart, 
        opacity: 0, 
        scale: 0,
        rotate: rotateStart
      },
      animate: { 
        x: [xStart, xEnd],
        y: [yStart, yEnd],
        opacity: [0, 1, 0.8, 0], 
        scale: [0, 0.8 + Math.random() * 0.8, 0.5, 0], 
        rotate: [rotateStart, rotateEnd],
        transition: { 
          duration: 1.5 + Math.random() * 0.8, // Faster animation
          ease: [0.05, 0.2, 0.65, 1], // More explosive easing
          times: [0, 0.05, 0.7, 1] // Quicker initial appearance
        }
      }
    };
  };

  // Colors for confetti - blues only as requested
  const confettiColors = [
    '#3b82f6', // blue-500
    '#60a5fa', // blue-400
    '#93c5fd', // blue-300
    '#2563eb', // blue-600
    '#1d4ed8', // blue-700
    '#0ea5e9', // sky-500
    '#0284c7', // sky-600
    '#38bdf8', // sky-400
    '#7dd3fc', // sky-300
    '#bae6fd', // sky-200
  ];

  // Explosion effect variant
  const explosionVariant = {
    initial: {
      scale: 0,
      opacity: 0,
    },
    animate: {
      scale: [0, 1.5, 2],
      opacity: [0.7, 0.4, 0],
      transition: {
        duration: 0.5,
        ease: [0, 0.55, 0.2, 1]
      }
    }
  };

  // Shapes for confetti
  const confettiShapes = [
    "rounded-sm", // square
    "rounded-full", // circle
    "confetti-triangle", // triangle
    "confetti-rect", // rectangle
    "confetti-droplet", // water droplet
  ];

  // Create faster, more dramatic bubbles animation
  const bubbleVariant = (i: number) => {
    const xOffset = (Math.random() - 0.5) * 300; // Wider spread
    const delay = Math.random() * 0.2; // Faster startup
    const duration = 1 + Math.random() * 1; // Faster animation
    
    return {
      initial: {
        y: 0,
        x: xOffset,
        opacity: 0,
        scale: 0.2 + Math.random() * 0.3,
      },
      animate: {
        y: -400 - Math.random() * 300, // Higher rise
        x: xOffset + ((Math.random() - 0.5) * 200), // More dramatic movement
        opacity: [0, 0.8, 0],
        scale: [0.2, 0.6 + Math.random() * 1, 0.3], // Larger scale
        transition: {
          duration,
          delay,
          ease: "easeOut"
        }
      }
    };
  };

  return (
    <AnimatePresence>
      {!isAnimationComplete && (
        <motion.div 
          className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
        >
          {/* Initial explosion flash */}
          <motion.div
            className="absolute inset-0 bg-blue-500/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0] }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          
          {/* Center explosion ring */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-blue-400/70"
            style={{ width: 20, height: 20 }}
            variants={explosionVariant}
            initial="initial"
            animate="animate"
          />
          
          {/* Main confetti pieces - more pieces for more dramatic effect */}
          <div className="relative w-full h-full">
            {[...Array(200)].map((_, i) => {
              const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
              const size = 5 + Math.random() * 12;
              const shapeClass = confettiShapes[Math.floor(Math.random() * confettiShapes.length)];
              
              // Custom styles for special shapes
              let customStyle = {};
              if (shapeClass === "confetti-triangle") {
                customStyle = {
                  clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)"
                };
              } else if (shapeClass === "confetti-rect") {
                customStyle = {
                  width: size,
                  height: size * 0.5,
                };
              } else if (shapeClass === "confetti-droplet") {
                customStyle = {
                  clipPath: "polygon(50% 0%, 0% 66%, 50% 100%, 100% 66%)",
                  height: size * 1.3,
                };
              }
              
              return (
                <motion.div
                  key={`confetti-${i}`}
                  className={`absolute left-1/2 top-1/2 shadow-sm ${shapeClass}`}
                  style={{ 
                    width: size, 
                    height: size,
                    backgroundColor: color,
                    ...customStyle
                  }}
                  variants={createConfettiVariants(i)}
                  initial="initial"
                  animate="animate"
                />
              );
            })}
          </div>
          
          {/* Fast-rising bubbles for extra drama */}
          <div className="relative w-full h-full">
            {[...Array(40)].map((_, i) => {
              const size = 5 + Math.random() * 20;
              const color = confettiColors[Math.floor(Math.random() * 5)]; // Use lighter blues
              const opacity = 0.3 + Math.random() * 0.4;
              
              return (
                <motion.div
                  key={`bubble-${i}`}
                  className="absolute rounded-full"
                  style={{ 
                    width: size, 
                    height: size,
                    left: `${Math.random() * 100}%`,
                    backgroundColor: color,
                    opacity: opacity,
                    boxShadow: '0 0 4px rgba(255, 255, 255, 0.4) inset'
                  }}
                  variants={bubbleVariant(i)}
                  initial="initial"
                  animate="animate"
                />
              );
            })}
          </div>
          
          {/* Secondary explosion ring for added effect */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-blue-300/60"
            style={{ width: 40, height: 40 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 3], 
              opacity: [0, 0.5, 0],
              transition: {
                delay: 0.1,
                duration: 0.6,
                ease: "easeOut"
              }
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
} 