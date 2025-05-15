"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/DemoComponents";
import { Pool } from "@/types/pool";
import Link from "next/link";
import Image from "next/image";
import { getPools, initializePoolsStorage } from "@/lib/poolStorage";
import { getGiveaways } from "@/lib/giveawayStorage";
import { Giveaway } from "@/components/GiveawayWizard";

export function WelcomeScreen() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [upcomingPools, setUpcomingPools] = useState<Pool[]>([]);
  const [upcomingGiveaways, setUpcomingGiveaways] = useState<Giveaway[]>([]);

  // Initialize pools and giveaways on client side
  useEffect(() => {
    // Initialize pools in localStorage if needed
    initializePoolsStorage();
    // Get pools from storage
    const pools = getPools();
    setUpcomingPools(pools);

    // Get giveaways from storage
    const giveaways = getGiveaways();
    setUpcomingGiveaways(giveaways);
  }, []);

  // Helper function to format time remaining
  const formatTimeRemaining = (dateStr: string | Date) => {
    try {
      const date = dateStr instanceof Date ? dateStr : new Date(dateStr);
      const now = new Date();

      if (isNaN(date.getTime())) {
        return "NaNm";
      }

      const diffMs = date.getTime() - now.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      if (diffHrs > 0) {
        return `${diffHrs}h ${diffMins}m`;
      } else {
        return `${diffMins}m`;
      }
    } catch (error) {
      console.error("Error formatting time:", error);
      return "unavailable";
    }
  };

  // Handle email submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setIsSubmitting(true);

    // Mock API call
    setTimeout(() => {
      console.log("Email submitted:", email);
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1000);
  };

  return (
    <div className="pb-4">
      {/* Your Pools Section - Empty state with welcome message */}
      <div className="bg-white rounded-3xl shadow-sm p-4 mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Pools</h2>

        <div className="text-center py-4">
          <h3 className="text-xl font-bold mb-2 text-black">Welcome to Pool</h3>
          <p className="text-gray-600 mb-2">
            Find and join pools created by the community
          </p>
          <p className="text-gray-600">Your joined pools will appear here</p>
        </div>
      </div>

      {/* Upcoming Pools Section */}
      <div className="bg-white rounded-3xl shadow-sm p-4 mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Upcoming Pools
        </h2>

        <div className="space-y-3">
          {/* Display Pools */}
          {upcomingPools.map((pool) => (
            <Link href={`/pool/${pool.id}`} key={pool.id} className="block">
              <div className="flex items-center p-3.5 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors">
                <div className="relative w-16 h-16 bg-gray-200 rounded-xl mr-4 overflow-hidden">
                  {pool.selectedImage ? (
                    <Image
                      src={pool.selectedImage}
                      alt={pool.name}
                      fill
                      sizes="(max-width: 64px) 100vw, 64px"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-white text-xs">No Image</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-lg">
                    {pool.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {pool.registrations || 0}/{pool.softCap} Registered
                  </div>
                  <div className="text-sm text-gray-500">
                    Starts in {formatTimeRemaining(pool.startTime)}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  {pool.buyIn > 0 && (
                    <div className="mb-2 bg-white/90 backdrop-blur-sm text-gray-900 px-2 py-1 rounded-full text-xs font-medium shadow-sm">
                      ${pool.buyIn} Buy-in
                    </div>
                  )}
                  <div className="text-blue-500">
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
                        d="M9 5l7 7-7 7"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {/* Display Giveaways */}
          {upcomingGiveaways.map((giveaway) => (
            <Link
              href={`/giveaway/${giveaway.id}`}
              key={giveaway.id}
              className="block"
            >
              <div className="flex items-center p-3.5 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors">
                <div className="relative w-16 h-16 bg-gray-200 rounded-xl mr-4 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-r from-purple-100 to-purple-300 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17A3 3 0 015 5zm4 1V5a1 1 0 10-2 0v1H5a1 1 0 100 2h2v1a2 2 0 104 0V8h2a1 1 0 100-2h-2V5a1 1 0 10-2 0v1H7z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-lg">
                    Giveaway
                  </div>
                  <div className="text-sm text-gray-500">
                    0/{giveaway.participantLimit} Registered
                  </div>
                  <div className="text-sm text-gray-500">
                    {giveaway.registrationStart
                      ? `Starts in ${formatTimeRemaining(giveaway.registrationStart)}`
                      : "Registration time not set"}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  {giveaway.amount > 0 && (
                    <div className="mb-2 bg-white/90 backdrop-blur-sm text-gray-900 px-2 py-1 rounded-full text-xs font-medium shadow-sm">
                      ${giveaway.amount} Prize
                    </div>
                  )}
                  <div className="text-blue-500">
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
                        d="M9 5l7 7-7 7"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {/* Message when no pools or giveaways exist */}
          {upcomingPools.length === 0 && upcomingGiveaways.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              <p>No events available at the moment.</p>
            </div>
          )}
        </div>
      </div>

      {/* Email Capture Form */}
      <div className="bg-white rounded-3xl shadow-sm p-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Become a Pool Creator
        </h2>
        <p className="text-gray-600 mb-6">
          Sign up to create your own pools for your community
        </p>

        {isSubmitted ? (
          <div className="text-center py-4">
            <svg
              className="w-16 h-16 text-green-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <h3 className="text-xl font-bold mb-2">
              Thanks for Your Interest!
            </h3>
            <p className="text-gray-600">
              We&apos;ll contact you when creator spots are available
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="you@example.com"
              />
              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>
            <Button className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg">
              {isSubmitting ? "Submitting..." : "Join Waitlist"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
