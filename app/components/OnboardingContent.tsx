"use client";

import React from 'react';


export function OnboardingScreenOne() {
  return (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
        <svg 
          className="w-10 h-10 text-white" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      
      <h2 className="text-xl font-bold text-gray-800 mb-4">Welcome to Pool!</h2>
      
      <p className="text-gray-600 mb-4 text-center">
        Pool is a Farcaster mini-app that enables creators to organize event pools and giveaways for their community.
      </p>
      
      <div className="bg-gray-50 p-4 rounded-lg w-full">
        <h3 className="font-medium text-gray-800 mb-2">Key Features:</h3>
        <ul className="space-y-2">
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-500 rounded-full mr-2 flex-shrink-0">
              ✓
            </span>
            <span className="text-gray-600">Create events for your community</span>
          </li>
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-500 rounded-full mr-2 flex-shrink-0">
              ✓
            </span>
            <span className="text-gray-600">Organize giveaways with custom rules</span>
          </li>
       
        </ul>
      </div>
    </div>
  );
}

export function OnboardingScreenTwo() {
  return (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
        <svg 
          className="w-10 h-10 text-white" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      </div>
      
      <h2 className="text-xl font-bold text-gray-800 mb-4">Getting Started</h2>
      
      <p className="text-gray-600 mb-4 text-center">
        Ready to dive in? Here&apos;s how to make the most of Pool:
      </p>
      
      <div className="space-y-4 w-full">
        <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500">
          <h3 className="font-medium text-gray-800">For Creators:</h3>
          <p className="text-gray-600 text-sm">
            Create pools or giveaways, then share them with your community.
          </p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-green-500">
          <h3 className="font-medium text-gray-800">For Participants:</h3>
          <p className="text-gray-600 text-sm">
            Discover and participate in pools and giveaways to earn on pool.
          </p>
        </div>
      </div>
    </div>
  );
}

// Export both screens as an array for easy use with the onboarding overlay
export const onboardingScreens = [
  <OnboardingScreenOne key="screen-1" />,
  <OnboardingScreenTwo key="screen-2" />
]; 