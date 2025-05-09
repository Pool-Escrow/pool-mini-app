"use client";

import { useEffect, useState } from "react";
import { PoolDashboard } from "@/app/components/PoolDashboard";
import { getPoolById, initializePoolsStorage } from "@/app/lib/poolStorage";
import { Pool } from "@/app/types/pool";
import { Providers } from "@/app/providers";
import { useRouter } from "next/navigation";

export default function PoolPage({ params }: { params: { id: string } }) {
  const [pool, setPool] = useState<Pool | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Initialize pools if needed
    initializePoolsStorage();
    
    // Get the pool by ID
    const foundPool = getPoolById(params.id);
    
    if (foundPool) {
      // Convert date strings to Date objects if needed
      // This ensures consistent handling of dates between server and client
      const processedPool = {
        ...foundPool,
        createdAt: new Date(foundPool.createdAt),
        startTime: new Date(foundPool.startTime)
      };
      
      setPool(processedPool);
    } else {
      // Redirect to home if pool not found
      router.push("/");
    }
    
    setLoading(false);
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white text-gray-800">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Pool Not Found</h1>
          <p className="mb-4">The pool you are looking for does not exist.</p>
          <button 
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <Providers>
      <PoolDashboard pool={pool} />
    </Providers>
  );
} 