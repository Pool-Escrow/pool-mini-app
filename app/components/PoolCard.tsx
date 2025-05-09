"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Pool } from "@/app/types/pool";

interface PoolCardProps {
  pool: Pool;
  creatorName?: string;
  creatorAvatar?: string;
  showCreator?: boolean;
}

// Function to get a color based on the template number
const getTemplateColor = (templateStr: string): string => {
  const templateColors = [
    'from-blue-100 to-blue-300',   // template-1
    'from-green-100 to-green-300', // template-2
    'from-purple-100 to-purple-300', // template-3
    'from-red-100 to-red-300',     // template-4
    'from-yellow-100 to-yellow-300', // template-5
    'from-pink-100 to-pink-300',   // template-6
    'from-indigo-100 to-indigo-300', // template-7
    'from-gray-100 to-gray-300'    // template-8
  ];
  
  // Extract number from template string (template-1 -> 1) or image path (/image/image1.png -> 1)
  let templateNum = 1;
  
  if (templateStr.includes('template-')) {
    const templateMatch = templateStr.match(/template-(\d+)/);
    if (templateMatch) {
      templateNum = parseInt(templateMatch[1], 10);
    }
  } else if (templateStr.includes('/images/image')) {
    const templateMatch = templateStr.match(/\/images\/image(\d+)\.png/);
    if (templateMatch) {
      templateNum = parseInt(templateMatch[1], 10);
    }
  }
  
  // Use modulo to handle any template number
  return templateColors[(templateNum - 1) % templateColors.length];
};

export function PoolCard({
  pool,
  creatorName = "Anonymous",
  creatorAvatar = "",
  showCreator = true,
}: PoolCardProps) {
  // Function to safely render the image with fallback
  const renderPoolImage = () => {
    if (!pool.selectedImage) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-300">
          <svg
            className="w-16 h-16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            ></path>
          </svg>
        </div>
      );
    }

    // Get gradient colors based on template number
    const gradientClass = getTemplateColor(pool.selectedImage);

    // Extract template number for the fallback
    let templateNum = '?';
    if (pool.selectedImage.includes('template-')) {
      const match = pool.selectedImage.match(/template-(\d+)/);
      if (match) templateNum = match[1];
    } else if (pool.selectedImage.includes('/images/image')) {
      const match = pool.selectedImage.match(/\/images\/image(\d+)\.png/);
      if (match) templateNum = match[1];
    }

    return (
      <div className={`w-full h-full bg-gradient-to-r ${gradientClass}`}>
        <img
          src={pool.selectedImage}
          alt={pool.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // On error, replace with a styled gradient background with text
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            
            // Get parent element
            const parent = target.parentElement!;
            parent.classList.add('flex', 'items-center', 'justify-center');
            
            // Create visually pleasing label with pool name
            const label = document.createElement('div');
            label.className = 'text-center';
            
            // Add pool icon/number
            const iconSpan = document.createElement('div');
            iconSpan.className = 'text-3xl font-bold mb-2 text-white/80';
            iconSpan.textContent = `#${templateNum}`;
            label.appendChild(iconSpan);
            
            // Add pool name
            const nameSpan = document.createElement('div');
            nameSpan.className = 'text-lg font-medium text-white/90 px-4';
            nameSpan.textContent = pool.name;
            label.appendChild(nameSpan);
            
            parent.appendChild(label);
          }}
        />
      </div>
    );
  };

  return (
    <Link href={`/pool/${pool.id}`}>
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
        {/* Pool Image */}
        <div className="h-40 bg-gray-200 relative">
          {renderPoolImage()}
          
          {/* Buy-in badge */}
          {pool.buyIn > 0 && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-900 px-2 py-1 rounded-full text-xs font-medium shadow-sm">
              Buy-in: ${`${pool.buyIn}`}
            </div>
          )}
        </div>
        
        {/* Pool Info */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-gray-900 truncate mr-2">{pool.name}</h3>
            {pool.softCap > 0 && (
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                Cap: {pool.softCap}
              </span>
            )}
          </div>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {pool.description || "No description provided."}
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
                  <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-500">
                    <span className="text-xs">{creatorName.charAt(0)}</span>
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-600">{creatorName}</span>
              <span className="ml-auto text-xs text-gray-400">
                {new Date(pool.createdAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
} 