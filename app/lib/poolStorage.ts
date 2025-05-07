import { Pool } from "@/app/types/pool";

const POOLS_STORAGE_KEY = "pools";

// Helper function to get pools from local storage
const getStoredPools = (): Pool[] => {
  if (typeof window === "undefined") {
    return [];
  }
  const storedPools = localStorage.getItem(POOLS_STORAGE_KEY);
  return storedPools ? JSON.parse(storedPools) : [];
};

// Helper function to save pools to local storage
const saveStoredPools = (pools: Pool[]): void => {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(POOLS_STORAGE_KEY, JSON.stringify(pools));
};

export const createPool = (poolData: Omit<Pool, "id" | "createdAt">): Pool => {
  const pools = getStoredPools();
  const newPool: Pool = {
    ...poolData,
    id: crypto.randomUUID(),
    createdAt: new Date(),
  };
  pools.push(newPool);
  saveStoredPools(pools);
  return newPool;
};

export const getPools = (): Pool[] => {
  return getStoredPools();
};

export const getPoolById = (id: string): Pool | undefined => {
  const pools = getStoredPools();
  return pools.find((pool) => pool.id === id);
};

export const updatePool = (
  id: string,
  updates: Partial<Omit<Pool, "id" | "createdAt">>,
): Pool | undefined => {
  const pools = getStoredPools();
  const poolIndex = pools.findIndex((pool) => pool.id === id);
  if (poolIndex === -1) {
    return undefined;
  }
  pools[poolIndex] = { ...pools[poolIndex], ...updates };
  saveStoredPools(pools);
  return pools[poolIndex];
};

export const deletePool = (id: string): boolean => {
  let pools = getStoredPools();
  const initialLength = pools.length;
  pools = pools.filter((pool) => pool.id !== id);
  if (pools.length < initialLength) {
    saveStoredPools(pools);
    return true;
  }
  return false;
};
