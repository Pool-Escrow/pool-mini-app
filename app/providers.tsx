"use client";

import { createContext, useState, useContext, type ReactNode, useEffect } from "react";
import { base } from "wagmi/chains";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";

// Create UserRole context
type UserRoleContextType = {
  userRole: "admin" | "regular";
  isAdmin: boolean;
  toggleUserRole: () => void;
};

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export function useUserRole() {
  const context = useContext(UserRoleContext);
  if (context === undefined) {
    throw new Error("useUserRole must be used within a UserRoleProvider");
  }
  return context;
}

function UserRoleProvider({ children }: { children: ReactNode }) {
  // Default to admin for initial rendering to prevent hydration errors
  const [userRole, setUserRole] = useState<"admin" | "regular">("admin");
  // Add flag to track if the component has been mounted (is client-side)
  const [isMounted, setIsMounted] = useState(false);
  
  // Initialize user role from localStorage on client-side only
  useEffect(() => {
    setIsMounted(true);
    const savedRole = localStorage.getItem("userRole");
    if (savedRole === "regular" || savedRole === "admin") {
      setUserRole(savedRole);
    }
  }, []);
  
  const toggleUserRole = () => {
    const newRole = userRole === "admin" ? "regular" : "admin";
    setUserRole(newRole);
    if (typeof window !== "undefined") {
      localStorage.setItem("userRole", newRole);
    }
  };
  
  return (
    <UserRoleContext.Provider value={{ userRole, isAdmin: userRole === "admin", toggleUserRole }}>
      {children}
    </UserRoleContext.Provider>
  );
}

export function Providers(props: { children: ReactNode }) {
  return (
    <MiniKitProvider
      chain={base}
      config={{
        appearance: {
          mode: "auto",
          theme: "mini-app-theme",
        },
      }}
    >
      <UserRoleProvider>
        {props.children}
      </UserRoleProvider>
    </MiniKitProvider>
  );
}
