"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Giveaway } from "@/app/components/GiveawayWizard";

interface GiveawayCardProps {
  giveaway: Giveaway;
  creatorName?: string;
  creatorAvatar?: string;
  showCreator?: boolean;
}

// Function to get a color based on giveaway id
const getGiveawayColor = (giveawayId: string): string => {
  const giveawayColors = [
    'from-purple-100 to-purple-300',
    'from-pink-100 to-pink-300',
    'from-indigo-100 to-indigo-300',
    'from-blue-100 to-blue-300',
    'from-green-100 to-green-300',
    'from-yellow-100 to-yellow-300',
    'from-red-100 to-red-300',
    'from-orange-100 to-orange-300',
  ];
  
  // Use giveaway ID to select a color deterministically
  const charSum = [...giveawayId].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorIndex = charSum % giveawayColors.length;
  
  return giveawayColors[colorIndex];
};

export function GiveawayCard({
  giveaway,
  creatorName = "Anonymous",
  creatorAvatar = "",
  showCreator = true,
}: GiveawayCardProps) {
  // Function to safely render the giveaway image with fallback
  const renderGiveawayImage = () => {
    // Get gradient colors based on giveaway ID
    const gradientClass = getGiveawayColor(giveaway.id || "0");

    return (
      <div className={`w-full h-full bg-gradient-to-r ${gradientClass} flex items-center justify-center`}>
        {/* Giveaway Icon */}
        <div className="text-center text-white">
          <svg 
            className="w-12 h-12 mx-auto mb-2 text-white/80" 
            fill="currentColor" 
            viewBox="0 0 20 20" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17A3 3 0 015 5zm4 1V5a1 1 0 10-2 0v1H5a1 1 0 100 2h2v1a2 2 0 104 0V8h2a1 1 0 100-2h-2V5a1 1 0 10-2 0v1H7z" clipRule="evenodd" />
          </svg>
          <div className="text-lg font-medium text-white/90 px-4">
            {giveaway.description.length > 20 
              ? giveaway.description.substring(0, 20) + "..." 
              : giveaway.description}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Link href={`/giveaway/${giveaway.id}`}>
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
        {/* Giveaway Image */}
        <div className="h-40 bg-gray-200 relative">
          {renderGiveawayImage()}
          
          {/* Giveaway Type Badge */}
          <div className="absolute top-3 left-3 bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">
            Giveaway
          </div>
          
          {/* Amount Badge */}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-900 px-2 py-1 rounded-full text-xs font-medium shadow-sm">
            ${giveaway.amount} Prize
          </div>
        </div>
        
        {/* Giveaway Info */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-gray-900 truncate mr-2">Giveaway</h3>
            {giveaway.participantLimit > 0 && (
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                Limit: {giveaway.participantLimit}
              </span>
            )}
          </div>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {giveaway.description || "No description provided."}
          </p>
          
          {/* Creator Info (if provided) */}
          {showCreator && (
            <div className="flex items-center mt-2 pt-2 border-t border-gray-100">
              <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden mr-2">
                {creatorAvatar ? (
                  <img
                    src={creatorAvatar}
                    alt={creatorName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-purple-100 flex items-center justify-center text-purple-500">
                    <span className="text-xs">{creatorName.charAt(0)}</span>
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-600">{creatorName}</span>
              <span className="ml-auto text-xs text-gray-400">
                {giveaway.createdAt ? new Date(giveaway.createdAt).toLocaleDateString() : "Recent"}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
} 