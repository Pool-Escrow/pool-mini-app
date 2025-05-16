"use client";

import { useState } from "react";
import { Pool } from "@/app/types/pool";
import { ChooseImageStep } from "@/app/components/steps/ChooseImageStep";
import { NameDescriptionStep } from "@/app/components/steps/NameDescriptionStep";
import { DetailsStep } from "@/app/components/steps/DetailsStep";
import { RegistrationTimeStep } from "@/app/components/steps/RegistrationTimeStep";

export type StepData =
  | { selectedImage: string }
  | { name: string; description: string }
  | { registrationStart: string; registrationEnd: string; registrationEnabled: boolean }
  | { buyIn: number; softCap: number; rulesLink: string };

export const TOTAL_STEPS_WIZARD = 4;

interface CreatePoolWizardProps {
  currentStep: number;
  poolData: Partial<Pool>;
  onStepChange: (step: number, data?: StepData) => void;
  onComplete: (completedPoolData: Omit<Pool, "id" | "createdAt">) => void;
}

export function CreatePoolWizard({
  currentStep,
  poolData,
  onStepChange,
  onComplete,
}: CreatePoolWizardProps) {
  const handleNext = (stepSpecificData: StepData) => {
    const updatedDataForParent = { ...poolData, ...stepSpecificData };
    if (currentStep < TOTAL_STEPS_WIZARD) {
      onStepChange(currentStep + 1, stepSpecificData);
    } else {
      // Update parent with final step data, then complete
      onStepChange(currentStep, stepSpecificData);
      onComplete(updatedDataForParent as Omit<Pool, "id" | "createdAt">);
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
        <ChooseImageStep onNext={(data) => handleNext(data)} />
      )}
      {currentStep === 2 && (
        <NameDescriptionStep
          initialData={{
            name: poolData.name,
            description: poolData.description,
          }}
          onNext={(data) => handleNext(data)}
          onBack={handleBack}
        />
      )}
      {currentStep === 3 && (
        <RegistrationTimeStep
          initialData={{
            registrationStart: poolData.registrationStart,
            registrationEnd: poolData.registrationEnd,
            registrationEnabled: poolData.registrationEnabled,
          }}
          onNext={(data) => handleNext(data)}
          onBack={handleBack}
        />
      )}
      {currentStep === 4 && (
        <DetailsStep
          initialData={{
            buyIn: poolData.buyIn,
            softCap: poolData.softCap,
            rulesLink: poolData.rulesLink,
          }}
          onNext={(data) => handleNext(data)}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
