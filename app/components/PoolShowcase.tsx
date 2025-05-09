"use client";

import React from "react";
import { PoolCard } from "@/app/components/PoolCard";
import { Pool } from "@/app/types/pool";

interface PoolShowcaseProps {
  title?: string;
  pools: Pool[];
  showCreator?: boolean;
}

export function PoolShowcase({ 
  title = "Community Pools", 
  pools, 
  showCreator = true 
}: PoolShowcaseProps) {
  // Mock creator data - in a real app, this would come from a database
  const creators = {
    "1": { name: "Jack Butcher", avatar: "https://pbs.twimg.com/profile_images/1617848085099253761/PrXpCD-d_400x400.jpg" },
    "2": { name: "Vitalik", avatar: "https://pbs.twimg.com/profile_images/977496875887558661/L86xyLF4_400x400.jpg" },
    "3": { name: "Balaji", avatar: "https://pbs.twimg.com/profile_images/1654064289519706114/mL65-Y5D_400x400.jpg" },
    "4": { name: "Vignesh", avatar: "https://pbs.twimg.com/profile_images/1481810183229284352/OcIyCzKK_400x400.jpg" },
    "5": { name: "Cozomo", avatar: "https://pbs.twimg.com/profile_images/1431361047967838212/Bp2FqZ6e_400x400.jpg" },
    "6": { name: "Chris Dixon", avatar: "https://pbs.twimg.com/profile_images/1643131046609215489/zpLW8ib5_400x400.jpg" },
  };
  
  // If no pools, show empty state
  if (pools.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500">No pools available at the moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pools.map((pool) => {
          // Randomly assign a creator for demonstration
          const creatorId = String(Math.floor(Math.random() * 6) + 1);
          const creator = creators[creatorId as keyof typeof creators];
          
          return (
            <PoolCard 
              key={pool.id}
              pool={pool}
              creatorName={showCreator ? creator.name : undefined}
              creatorAvatar={showCreator ? creator.avatar : undefined}
              showCreator={showCreator}
            />
          );
        })}
      </div>
    </div>
  );
} 