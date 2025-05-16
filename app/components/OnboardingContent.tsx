"use client";

import React from 'react';
import Image from "next/image";


export function OnboardingScreenOne() {
  return (
    <div className="flex flex-col items-center">
     
    
        <Image 
          src="/images/pool.svg"
          alt="Pool Logo"
          width={132}
          height={40}
          className="w-32 h-10 mb-5"
        />
   
      
      
      <p className="text-gray-600 mb-4 text-center">
      Pool makes it easy to run onchain events and giveaways—right inside Farcaster.
      </p>
      
      <div className="bg-gray-50 p-4 rounded-lg w-full">
        <h3 className="font-medium text-gray-800 mb-2">Bring your community together by:</h3>
        <ul className="space-y-2">
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-500 rounded-full mr-2 flex-shrink-0">
              ✓
            </span>
            <span className="text-gray-600">Host events and prize pools </span>
          </li>
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-500 rounded-full mr-2 flex-shrink-0">
              ✓
            </span>
            <span className="text-gray-600">Run giveaways with custom rules</span>
          </li>
       
        </ul>
      </div>
    </div>
  );
}

export function OnboardingScreenTwo() {
  return (
    <div className="flex flex-col items-center">
     
      
      <h2 className="text-xl font-bold text-gray-800 mb-4">Getting Started</h2>
      
      <p className="text-gray-600 mb-4 text-center">
      Here’s how to make the most of Pool:

      </p>
      
      <div className="space-y-4 w-full">
        <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500">
          <h3 className="font-medium text-gray-800">For Creators:</h3>
          <p className="text-gray-600 text-sm">
          Create pools or giveaways and share them with your community.

          </p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-[#fdb34a]">
          <h3 className="font-medium text-gray-800">For Participants:</h3>
          <p className="text-gray-600 text-sm">
Join pools and giveaways to win prizes and earn rewards
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