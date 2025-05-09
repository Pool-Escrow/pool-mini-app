"use client";

import { useState, useEffect } from "react";
import { getPoolRegistrations } from "@/app/lib/registrationStorage";
import Image from "next/image";

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  status: "joined" | "paid" | "attending";
  isPlaceholder?: boolean; // Added to identify placeholder entries
}

interface ParticipantsListProps {
  poolId: string; // Used to fetch participants for a specific pool
  isAdmin?: boolean;
  poolAmount?: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ParticipantsList({ poolId, isAdmin = false, poolAmount = 100 }: ParticipantsListProps) {
  // State for storing participants
  const [participants, setParticipants] = useState<Participant[]>([]);

  // Load participants from registration storage
  useEffect(() => {
    // For a real app, this would fetch actual participant details
    // For our demo, we'll just load registration data and display simple info
    const registrations = getPoolRegistrations(poolId);
    
    // Convert registrations to participants
    // In a real app, we would fetch user profiles using the userAddress
    const loadedParticipants = registrations.map((reg, index) => {
      // Create a deterministic avatar based on address
      const addressLastChar = reg.userAddress.slice(-1);
      const avatarId = parseInt(addressLastChar, 16) % 10 + 1; // 1-10 range
      const gender = avatarId % 2 === 0 ? 'men' : 'women';
      
      return {
        id: reg.userAddress,
        name: `Participant ${index + 1}`, // In a real app, we would fetch the user's name
        avatar: `https://randomuser.me/api/portraits/${gender}/${avatarId}.jpg`,
        status: "joined" as const,
      };
    });
    
    // If no participants, show some placeholders
    if (loadedParticipants.length === 0) {
      setParticipants([
        {
          id: "1",
          name: "No participants yet!",
          status: "joined" as const,
          isPlaceholder: true
        }
      ]);
    } else {
      setParticipants(loadedParticipants);
    }
  }, [poolId]);

  const handleParticipantClick = (participant: Participant) => {
    // Only admins can click on participants to pay them
    if (!isAdmin) return;
    
    // Show browser confirm dialog instead of custom modal
    const confirmPay = window.confirm(`Send payment of $${poolAmount} to ${participant.name}?`);
    if (confirmPay) {
      console.log(`Payment sent to: ${participant.name}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-lg text-black">Participants</h2>
        <span className="text-gray-500 text-sm">
          {participants.length} {participants.length === 1 ? "person" : "people"}
        </span>
      </div>
      
      <div className="space-y-3">
        {participants.map((participant) => (
          <div 
            key={participant.id}
            className={`flex items-center p-3 rounded-lg ${
              isAdmin && !participant.isPlaceholder ? "cursor-pointer hover:bg-gray-50" : ""
            }`}
            onClick={() => {
              if (isAdmin && !participant.isPlaceholder) {
                handleParticipantClick(participant);
              }
            }}
          >
            <div className="w-10 h-10 bg-gray-200 rounded-full mr-3 flex items-center justify-center text-gray-500 relative">
              {participant.avatar ? (
                <Image
                  src={participant.avatar}
                  alt={participant.name}
                  fill
                  sizes="(max-width: 40px) 100vw, 40px"
                  style={{ objectFit: 'cover' }}
                  className="rounded-full"
                />
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  ></path>
                </svg>
              )}
            </div>
            
            <div className="flex-1">
              <span className="font-medium text-gray-900">
                {participant.name}
              </span>
              {participant.isPlaceholder ? (
                <span className="text-xs text-gray-500 block">
                  Users will populate here when they join
                </span>
              ) : isAdmin && (
                <span className="text-xs text-gray-500 block">
                  Click to pay this participant
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 