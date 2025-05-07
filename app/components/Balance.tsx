import { Button } from "@/app/components/DemoComponents";
import { Icon } from "@/app/components/Icon";
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
import { useState } from "react";
import { Pool } from "@/app/types/pool";
import { createPool as savePool } from "@/app/lib/poolStorage"; // Import savePool

// Import Drawer components and the refactored wizard
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
import { ProgressBar } from "@/app/components/ProgressBar";

export function Balance() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // State for the wizard, lifted up from CreatePoolWizard
  const [currentWizardStep, setCurrentWizardStep] = useState(1);
  const [wizardPoolData, setWizardPoolData] = useState<Partial<Pool>>({});

  const handleWizardStepChange = (step: number, data?: StepData) => {
    setCurrentWizardStep(step);
    if (data) {
      // If going forward, merge new data with existing
      setWizardPoolData((prevData) => ({ ...prevData, ...data }));
    }
    // If going backward (data is undefined), wizardPoolData retains its state for when user returns to a step
  };

  const handleWizardComplete = (
    completedPoolData: Omit<Pool, "id" | "createdAt">,
  ) => {
    const newPool = savePool(completedPoolData);
    console.log("New pool created from Balance component:", newPool);
    setIsDrawerOpen(false); // Close drawer
    // Reset wizard state for next time it opens is handled by openDrawer function
  };

  const openDrawerAndResetState = () => {
    setCurrentWizardStep(1); // Reset to the first step
    setWizardPoolData({}); // Clear any previous pool data
    setIsDrawerOpen(true);
  };

  return (
    <>
      <div className="flex flex-col min-h-screen bg-[#4C6FFF] text-white p-4">
        <header className="flex justify-between items-center mb-8">
          <button className="p-2 hover:bg-white/10 rounded-full">
            <Icon name="refresh" className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-white/10 rounded-full">
              <Icon name="lock" className="w-6 h-6" />
            </button>
            <Wallet>
              <ConnectWallet>
                <Avatar className="w-8 h-8 rounded-full" />
              </ConnectWallet>
              <WalletDropdown>
                <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                  <Avatar />
                  <Name />
                  <Address />
                  <EthBalance />
                </Identity>
                <WalletDropdownDisconnect />
              </WalletDropdown>
            </Wallet>
          </div>
        </header>

        <div className="flex-1">
          <div className="text-center mb-8">
            <div className="text-sm opacity-80 mb-2">Total balance</div>
            <div className="text-4xl font-bold mb-1">$0.00</div>
            <div className="text-sm opacity-80">USDC</div>
          </div>

          <div className="bg-white/10 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <Icon name="droplet" className="w-5 h-5 mr-2" />
              <span>Drop Tokens: 1000</span>
            </div>
          </div>
        </div>

        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button
              className="w-full bg-white text-[#4C6FFF] hover:bg-white/90 py-4 rounded-xl font-medium"
              onClick={openDrawerAndResetState} // Use custom handler to reset state
            >
              Create an Event
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-full flex flex-col bg-white">
            {" "}
            {/* Drawer full height, flex column, explicit white background */}
            <DrawerHeader className="flex justify-between items-center p-4 border-b border-gray-200 text-black">
              <DrawerTitle className="text-sm font-medium text-gray-500">
                Farcaster Frame
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
              currentStep={currentWizardStep}
              totalSteps={TOTAL_STEPS_WIZARD}
            />
            <CreatePoolWizard
              currentStep={currentWizardStep}
              poolData={wizardPoolData}
              onStepChange={handleWizardStepChange}
              onComplete={handleWizardComplete}
            />
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
}
