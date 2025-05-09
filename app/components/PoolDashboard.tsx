"use client";

import { useState, useEffect, useRef } from "react";
import { Pool } from "@/app/types/pool";
import Link from "next/link";
import { Button } from "@/app/components/DemoComponents";
import { ParticipantsList } from "@/app/components/ParticipantsList";
import { RegistrationModal } from "@/app/components/RegistrationModal";
import { useAccount } from "wagmi";
import { useUserRole } from "@/app/providers";
import { 
  isUserRegisteredForPool, 
  registerUserForPool, 
  cancelUserRegistration, 
  initializeRegistrationsStorage 
} from "@/app/lib/registrationStorage";

interface PoolDashboardProps {
  pool: Pool;
}

export function PoolDashboard({ pool }: PoolDashboardProps) {
  const [activeTab, setActiveTab] = useState<"description" | "participants">("participants");
  const { isAdmin: isGlobalAdmin } = useUserRole();
  // Track if user is an admin (creator of the pool)
  const [isPoolAdmin, setIsPoolAdmin] = useState(false);
  // Tracks if the current user is registered for the pool
  const [isRegistered, setIsRegistered] = useState(false);
  // Track if registration modal is open
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  // Get user wallet address from wagmi
  const { address } = useAccount();
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const adminMenuRef = useRef<HTMLDivElement>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Initialize registrations storage and check user status
  useEffect(() => {
    // Initialize registration storage
    initializeRegistrationsStorage();
    
    // Set admin status based on global admin role
    setIsPoolAdmin(isGlobalAdmin);
    
    // If user has wallet connected, check if they're registered
    if (address) {
      const registered = isUserRegisteredForPool(pool.id, address);
      setIsRegistered(registered);
    } else {
      setIsRegistered(false);
    }
  }, [address, isGlobalAdmin, pool.id]);

  const handleOpenRegistrationModal = () => {
    // If no wallet is connected, we can't register
    if (!address) {
      alert("Please connect your wallet to register for this event");
      return;
    }
    setIsRegistrationModalOpen(true);
  };

  const handleCloseRegistrationModal = () => {
    setIsRegistrationModalOpen(false);
  };

  const handleRegister = () => {
    if (!address) {
      alert("Please connect your wallet to register for this event");
      return;
    }
    
    // Register the user for the pool
    const success = registerUserForPool(pool.id, address);
    if (success) {
      setIsRegistered(true);
      
      // Force a component refresh by using a key update or state change
      // This will cause the ParticipantsList to re-render with the new participant
      setRefreshKey(prev => prev + 1);
      
      console.log("User registered for pool:", pool.id);
    } else {
      console.log("User already registered for pool:", pool.id);
    }
  };

  const handleCancelRegistration = () => {
    if (!address) return;
    
    // Cancel the user's registration
    const success = cancelUserRegistration(pool.id, address);
    if (success) {
      setIsRegistered(false);
      
      // Force a component refresh by using a key update or state change
      // This will cause the ParticipantsList to re-render without the cancelled participant
      setRefreshKey(prev => prev + 1);
      
      console.log("User cancelled registration for pool:", pool.id);
    } else {
      console.log("Failed to cancel registration - user may not be registered");
    }
  };

  // Format pool time for display
  const formatPoolTime = () => {
    if (!pool.registrationStart || !pool.registrationEnd) {
      return "Registration time not set";
    }

    try {
      const now = new Date();
      const regStartDate = new Date(pool.registrationStart);
      const regEndDate = new Date(pool.registrationEnd);
      
      // Check if dates are valid
      if (isNaN(regStartDate.getTime()) || isNaN(regEndDate.getTime())) {
        return "Registration dates not properly set";
      }
      
      // Format the date for display
      const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }) + ' at ' + date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      };
      
      // If current time is before start date, show registration starts
      if (now < regStartDate) {
        return `Registration starts: ${formatDate(regStartDate)}`;
      } 
      // If current time is between start and end, show registration ends
      else if (now >= regStartDate && now < regEndDate) {
        return `Registration ends: ${formatDate(regEndDate)}`;
      } 
      // If registration period has passed
      else {
        return `Registration period has ended`;
      }
    } catch (error) {
      console.error("Error formatting pool times:", error);
      return "Registration time available soon";
    }
  };

  const getRegistrationButtonText = () => {
    if (pool.buyIn > 0) {
      return `Register for $${pool.buyIn} USDC`;
    }
    return "Register";
  };

  // Calculate progress percentage for the progress bar
  const getProgressPercentage = () => {
    if (pool.softCap === 0) return 0;
    // Calculate total amount raised based on registrations and buy-in
    const totalRaised = pool.registrations * pool.buyIn;
    const percentage = (totalRaised / pool.softCap) * 100;
    return Math.min(percentage, 100); // Cap at 100%
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  // Close admin menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target as Node)) {
        setShowAdminMenu(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header with back button */}
      <header className="bg-white p-4">
        <Link href="/" className="flex items-center text-blue-500">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back
        </Link>
      </header>

      {/* Event Cover Image */}
      <div className="w-full h-44 bg-gray-400 relative">
        {pool.selectedImage ? (
          <div className="w-full h-full">
            <img 
              src={pool.selectedImage} 
              alt={pool.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                // On error, extract template number for fallback
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                
                // Get parent element
                const parent = target.parentElement!;
                parent.classList.add('flex', 'items-center', 'justify-center');
                
                // Determine template number and color
                let templateNum = '?';
                let bgClass = 'bg-gradient-to-r from-blue-100 to-blue-300';
                
                if (pool.selectedImage.includes('template-')) {
                  const match = pool.selectedImage.match(/template-(\d+)/);
                  if (match) templateNum = match[1];
                } else if (pool.selectedImage.includes('/images/image')) {
                  const match = pool.selectedImage.match(/\/images\/image(\d+)\.png/);
                  if (match) {
                    templateNum = match[1];
                    
                    // Set background color based on template number
                    const colors = [
                      'bg-gradient-to-r from-blue-100 to-blue-300',
                      'bg-gradient-to-r from-green-100 to-green-300',
                      'bg-gradient-to-r from-purple-100 to-purple-300',
                      'bg-gradient-to-r from-red-100 to-red-300',
                      'bg-gradient-to-r from-yellow-100 to-yellow-300',
                      'bg-gradient-to-r from-pink-100 to-pink-300',
                      'bg-gradient-to-r from-indigo-100 to-indigo-300',
                      'bg-gradient-to-r from-gray-100 to-gray-300'
                    ];
                    
                    const index = parseInt(templateNum, 10) - 1;
                    if (index >= 0 && index < colors.length) {
                      bgClass = colors[index];
                    }
                  }
                }
                
                parent.className = `w-full h-full flex items-center justify-center ${bgClass}`;
                
                // Add title with template number and pool name
                const content = document.createElement('div');
                content.className = 'text-center';
                
                const templateIndicator = document.createElement('div');
                templateIndicator.className = 'text-3xl font-bold mb-2 text-white/80';
                templateIndicator.textContent = `#${templateNum}`;
                content.appendChild(templateIndicator);
                
                const poolName = document.createElement('div');
                poolName.className = 'text-xl font-medium text-white/90 px-4';
                poolName.textContent = pool.name;
                content.appendChild(poolName);
                
                parent.appendChild(content);
              }}
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-400">
            <span className="text-gray-600">No Image</span>
          </div>
        )}
      </div>

      {/* Event Details with Admin Menu */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold text-gray-900">{pool.name}</h1>
          
          {/* Admin menu (3 dots) for pool organizers - Horizontal dots */}
          {isPoolAdmin && (
            <div className="relative" ref={adminMenuRef}>
              <button 
                onClick={() => setShowAdminMenu(!showAdminMenu)}
                className="p-2 text-gray-600 hover:text-gray-900"
                aria-label="Pool management options"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="5" cy="12" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="19" cy="12" r="2" />
                </svg>
              </button>
              
              {/* Dropdown menu */}
              {showAdminMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1 border border-gray-200">
                  <button 
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      alert("Prize distribution feature will be enabled when there are participants");
                      setShowAdminMenu(false);
                    }}
                  >
                    Distribute Prize Equally
                  </button>
                  <button 
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to cancel this event?")) {
                        alert("Event cancelled");
                        setShowAdminMenu(false);
                      }
                    }}
                  >
                    Cancel Event
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <p className="text-gray-600">{formatPoolTime()}</p>
        
        <div className="flex justify-between items-center mt-4">
          <div>
            <span className="font-bold text-gray-900">{formatCurrency(pool.buyIn)} USDC</span>
          </div>
          <div>
            <span className="text-gray-600">Goal of {formatCurrency(pool.softCap)} Prize Pool</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
          <div 
            className="h-full bg-blue-500 rounded-full" 
            style={{ width: `${getProgressPercentage()}%` }} 
          ></div>
        </div>
      </div>

      {/* Admin Badge (if user is admin for this pool) */}
      {isPoolAdmin && (
        <div className="mx-4 mb-2">
          <span className="inline-block px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-md">
            You are the organizer
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          <button
            className={`px-4 py-3 font-medium text-sm ${
              activeTab === "participants"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("participants")}
          >
            Participants
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm ${
              activeTab === "description"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("description")}
          >
            Description
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-4">
        {activeTab === "description" ? (
          <div className="space-y-4 text-gray-800">
            <h2 className="font-bold text-lg">Description</h2>
            <p>{pool.description}</p>
            
            {pool.rulesLink && (
              <div className="mt-4">
                <h3 className="font-bold text-md">Terms</h3>
                <a 
                  href={pool.rulesLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View full rules
                </a>
              </div>
            )}

            <div className="mt-6">
              <h3 className="font-bold text-md mb-2">Buy-In</h3>
              <p>${pool.buyIn} USD</p>
            </div>
          </div>
        ) : (
          <ParticipantsList 
            poolId={pool.id} 
            isAdmin={isPoolAdmin} 
            poolAmount={pool.buyIn} 
            key={refreshKey} 
          />
        )}
      </div>

      {/* Action Button - Only show for non-admins */}
      {!isPoolAdmin && (
        <div className="p-4 border-t border-gray-200">
          {!isRegistered ? (
            <Button 
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg"
              onClick={handleOpenRegistrationModal}
            >
              {getRegistrationButtonText()}
            </Button>
          ) : (
            <div className="flex flex-col items-center justify-center text-center">
              <p className="text-green-600 font-medium mb-2">You are registered for this event!</p>
              <Button 
                className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg" 
                variant="secondary"
                onClick={handleCancelRegistration}
              >
                Cancel Registration
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={handleCloseRegistrationModal}
        pool={pool}
        onRegister={handleRegister}
      />
    </div>
  );
} 