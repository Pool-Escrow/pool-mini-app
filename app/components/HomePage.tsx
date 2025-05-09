"use client";

import { useState, useEffect } from "react";
import { Balance } from "@/app/components/Balance";
import { PoolList } from "@/app/components/PoolList";
import { getPools } from "@/app/lib/poolStorage";
import { getGiveaways } from "@/app/lib/giveawayStorage";
import { Pool } from "@/app/types/pool";
import { Giveaway } from "@/app/components/GiveawayWizard";
import { WelcomeScreen } from "@/app/components/WelcomeScreen";
import { useUserRole } from "@/app/providers";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  CreatePoolWizard,
  TOTAL_STEPS_WIZARD,
  type StepData,
} from "@/app/components/CreatePoolWizard";
import {
  GiveawayWizard,
  TOTAL_STEPS_WIZARD as GIVEAWAY_TOTAL_STEPS,
  type GiveawayStepData,
} from "@/app/components/GiveawayWizard";
import { ProgressBar } from "@/app/components/ProgressBar";
import { createPool as savePool } from "@/app/lib/poolStorage";
import { createGiveaway as saveGiveaway } from "@/app/lib/giveawayStorage";

export function HomePage() {
  // Get user role
  const { isAdmin } = useUserRole();
  
  // State for pools and giveaways
  const [pools, setPools] = useState<Pool[]>([]);
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  
  // Pool Wizard States
  const [isPoolDrawerOpen, setIsPoolDrawerOpen] = useState(false);
  const [currentPoolWizardStep, setCurrentPoolWizardStep] = useState(1);
  const [wizardPoolData, setWizardPoolData] = useState<Partial<Pool>>({});

  // Giveaway Wizard States
  const [isGiveawayDrawerOpen, setIsGiveawayDrawerOpen] = useState(false);
  const [currentGiveawayWizardStep, setCurrentGiveawayWizardStep] = useState(1);
  const [wizardGiveawayData, setWizardGiveawayData] = useState<Partial<Giveaway>>({});

  // Load pools on component mount
  useEffect(() => {
    // Initialize pools storage to create empty storage if none exists
    import('@/app/lib/poolStorage').then(({ initializePoolsStorage }) => {
      initializePoolsStorage();
      const storedPools = getPools();
      setPools(storedPools);
    });
    
    // Load giveaways
    const storedGiveaways = getGiveaways();
    setGiveaways(storedGiveaways);
  }, []);

  // Pool Wizard Handlers
  const handlePoolWizardStepChange = (step: number, data?: StepData) => {
    setCurrentPoolWizardStep(step);
    if (data) {
      setWizardPoolData((prevData) => ({ ...prevData, ...data }));
    }
  };

  const handlePoolWizardComplete = (
    completedPoolData: Omit<Pool, "id" | "createdAt">,
  ) => {
    const newPool = savePool(completedPoolData);
    console.log("New pool created:", newPool);
    setIsPoolDrawerOpen(false);
    // Refresh pools list
    setPools(getPools());
  };

  const openPoolDrawerAndResetState = () => {
    setCurrentPoolWizardStep(1);
    setWizardPoolData({});
    setIsPoolDrawerOpen(true);
  };

  // Giveaway Wizard Handlers
  const handleGiveawayWizardStepChange = (step: number, data?: GiveawayStepData) => {
    setCurrentGiveawayWizardStep(step);
    if (data) {
      setWizardGiveawayData((prevData) => ({ ...prevData, ...data }));
    }
  };

  const handleGiveawayWizardComplete = (
    completedGiveawayData: Omit<Giveaway, "id" | "createdAt">,
  ) => {
    const newGiveaway = saveGiveaway(completedGiveawayData);
    console.log("New giveaway created:", newGiveaway);
    setIsGiveawayDrawerOpen(false);
    
    // Refresh giveaways list
    setGiveaways(getGiveaways());
  };

  const openGiveawayDrawerAndResetState = () => {
    setCurrentGiveawayWizardStep(1);
    setWizardGiveawayData({});
    setIsGiveawayDrawerOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Balance Section - Blue Background */}
      <div className="bg-[#4C6FFF]">
        <Balance />
      </div>
      
      {/* Content Area - Either Pool List (admin) or Welcome Screen (regular user) */}
      <div className="flex-1">
        {isAdmin ? (
          pools.length > 0 || giveaways.length > 0 ? (
            <PoolList pools={pools} giveaways={giveaways} />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-2">No pools created yet</p>
              <p className="text-sm">Use the buttons below to create your first pool event or giveaway</p>
            </div>
          )
        ) : (
          <WelcomeScreen />
        )}
      </div>
      
      {/* Admin Action Buttons or Empty Space for Regular Users */}
      <div className="px-4 py-4 space-y-4">
        {isAdmin && (
          <>
            {/* Pool Creation Button & Drawer */}
            <Drawer open={isPoolDrawerOpen} onOpenChange={setIsPoolDrawerOpen}>
              <DrawerTrigger asChild>
                <button
                  className="w-full bg-[#4C6FFF] text-white hover:bg-[#4C6FFF]/90 py-4 rounded-xl font-medium"
                  onClick={openPoolDrawerAndResetState}
                >
                  Create an Event
                </button>
              </DrawerTrigger>
              <DrawerContent className="h-full flex flex-col bg-white">
                <DrawerHeader className="flex justify-between items-center p-4 border-b border-gray-200 text-black">
                  <DrawerTitle className="text-sm font-medium text-gray-500">
                    Create Event Pool
                  </DrawerTitle>
                  <DrawerClose asChild>
                    <button
                      className="text-gray-400 hover:text-gray-600"
                      aria-label="Close wizard"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </DrawerClose>
                </DrawerHeader>
                <ProgressBar
                  currentStep={currentPoolWizardStep}
                  totalSteps={TOTAL_STEPS_WIZARD}
                />
                <CreatePoolWizard
                  currentStep={currentPoolWizardStep}
                  poolData={wizardPoolData}
                  onStepChange={handlePoolWizardStepChange}
                  onComplete={handlePoolWizardComplete}
                />
              </DrawerContent>
            </Drawer>

            {/* Giveaway Creation Button & Drawer */}
            <Drawer open={isGiveawayDrawerOpen} onOpenChange={setIsGiveawayDrawerOpen}>
              <DrawerTrigger asChild>
                <button
                  className="w-full bg-[#4C6FFF] text-white hover:bg-[#4C6FFF]/90 py-4 rounded-xl font-medium"
                  onClick={openGiveawayDrawerAndResetState}
                >
                  Create a Giveaway
                </button>
              </DrawerTrigger>
              <DrawerContent className="h-full flex flex-col bg-white">
                <DrawerHeader className="flex justify-between items-center p-4 border-b border-gray-200 text-black">
                  <DrawerTitle className="text-sm font-medium text-gray-500">
                    Create Giveaway
                  </DrawerTitle>
                  <DrawerClose asChild>
                    <button
                      className="text-gray-400 hover:text-gray-600"
                      aria-label="Close wizard"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </DrawerClose>
                </DrawerHeader>
                <ProgressBar
                  currentStep={currentGiveawayWizardStep}
                  totalSteps={GIVEAWAY_TOTAL_STEPS}
                />
                <GiveawayWizard
                  currentStep={currentGiveawayWizardStep}
                  giveawayData={wizardGiveawayData}
                  onStepChange={handleGiveawayWizardStepChange}
                  onComplete={handleGiveawayWizardComplete}
                />
              </DrawerContent>
            </Drawer>
          </>
        )}
      </div>
    </div>
  );
} 