"use client";

import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import {
  Avatar,
  Name,
  Identity,
  Address,
  EthBalance,
} from "@coinbase/onchainkit/identity";
import { useUserRole } from "@/app/providers";
import { clearAllPools } from "@/app/lib/poolStorage";
import { clearAllRegistrations } from "@/app/lib/registrationStorage";

export function Balance() {
  const { userRole, toggleUserRole } = useUserRole();
  
  // Function to clear all data and reset the app
  const clearAllData = () => {
    // Clear all pools and registrations
    clearAllPools();
    clearAllRegistrations();
    
    console.log("All pools and registrations have been cleared");
    // Reload the page to reflect changes
    window.location.reload();
  };
  
  return (
    <div className="bg-[#4C6FFF] text-white p-6">
      <header className="flex justify-between items-center mb-4">
        <button className="p-2 hover:bg-white/10 rounded-full">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4V9H4.58152M19.9381 11C19.446 7.05369 16.0796 4 12 4C8.64262 4 5.76829 6.06817 4.58152 9M4.58152 9H9M20 20V15H19.4185M19.4185 15C18.2317 17.9318 15.3574 20 12 20C7.92038 20 4.55399 16.9463 4.06189 13M19.4185 15H15" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <Wallet>
          <ConnectWallet>
            <div className="w-10 h-10 rounded-full bg-gray-300"></div>
          </ConnectWallet>
          <WalletDropdown>
            <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
              <Avatar />
              <Name />
              <Address />
              <EthBalance />
            </Identity>
            
            {/* Developer toggle for admin/regular user role */}
            <div className="px-4 py-2 border-t border-gray-200">
              <button
                onClick={toggleUserRole}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
              >
                <span className="flex items-center">
                  <span className="mr-2">{userRole === "admin" ? "👑" : "👤"}</span>
                  <span>Role: {userRole}</span>
                </span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">Switch</span>
              </button>
              
              {/* Clear All Pools & Registrations button (admin only) */}
              {userRole === "admin" && (
                <button
                  onClick={clearAllData}
                  className="w-full flex items-center justify-between mt-2 px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50 transition-colors"
                >
                  <span className="flex items-center">
                    <span className="mr-2">🗑️</span>
                    <span>Clear All Pools & Registrations</span>
                  </span>
                </button>
              )}
            </div>
            
            <WalletDropdownDisconnect />
          </WalletDropdown>
        </Wallet>
      </header>

      <div className="mb-8">
        <p className="text-sm opacity-80 mb-1">Total balance</p>
        <div className="flex items-baseline">
          <span className="text-6xl font-bold">$0.0</span>
          <span className="text-xl ml-1">USDC</span>
        </div>
      </div>

      <div className="flex items-center mb-4">
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 9H9.01" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M15 9H15.01" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>Drop Tokens: 1000</span>
      </div>
    </div>
  );
}
