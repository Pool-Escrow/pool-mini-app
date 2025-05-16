"use client";

import { GiveawayInfoStep } from "@/components/steps/GiveawayInfoStep";
import { GiveawayRequirementsStep } from "@/components/steps/GiveawayRequirementsStep";

export interface Giveaway {
  id?: string;
  amount: number;
  participantLimit: number;
  description: string;
  requiresApproval: boolean;
  pageFollowRequired: boolean;
  registrationStart: string;
  registrationEnd: string;
  registrationEnabled: boolean;
  createdAt?: string;
}

export type GiveawayStepData =
  | { amount: number; participantLimit: number; description: string }
  | {
      requiresApproval: boolean;
      pageFollowRequired: boolean;
      registrationEnabled: boolean;
      registrationStart: string;
      registrationEnd: string;
    };

export const TOTAL_STEPS_WIZARD = 2;

interface GiveawayWizardProps {
  currentStep: number;
  giveawayData: Partial<Giveaway>;
  onStepChange: (step: number, data?: GiveawayStepData) => void;
  onComplete: (
    completedGiveawayData: Omit<Giveaway, "id" | "createdAt">,
  ) => void;
}

export function GiveawayWizard({
  currentStep,
  giveawayData,
  onStepChange,
  onComplete,
}: GiveawayWizardProps) {
  const handleNext = (stepSpecificData: GiveawayStepData) => {
    const updatedDataForParent = { ...giveawayData, ...stepSpecificData };
    if (currentStep < TOTAL_STEPS_WIZARD) {
      onStepChange(currentStep + 1, stepSpecificData);
    } else {
      onComplete(updatedDataForParent as Omit<Giveaway, "id" | "createdAt">);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      onStepChange(currentStep - 1);
    }
  };

  return (
    <div className="overflow-y-auto flex-grow p-4 sm:p-6">
      {currentStep === 1 && (
        <GiveawayInfoStep
          initialData={{
            amount: giveawayData.amount,
            participantLimit: giveawayData.participantLimit,
            description: giveawayData.description,
          }}
          onNext={(data) => handleNext(data)}
        />
      )}
      {currentStep === 2 && (
        <GiveawayRequirementsStep
          initialData={{
            requiresApproval: giveawayData.requiresApproval,
            pageFollowRequired: giveawayData.pageFollowRequired,
            registrationEnabled: giveawayData.registrationEnabled,
            registrationStart: giveawayData.registrationStart,
            registrationEnd: giveawayData.registrationEnd,
          }}
          onNextAction={(data: GiveawayStepData) => handleNext(data)}
          onBackAction={handleBack}
        />
      )}
    </div>
  );
}
