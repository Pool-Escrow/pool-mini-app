"use client";

import { useState } from "react";
import { GiveawayWizard, Giveaway } from "@/app/components/GiveawayWizard";

export default function TestGiveawayPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [giveawayData, setGiveawayData] = useState<Partial<Giveaway>>({});
  const [completedData, setCompletedData] = useState<Omit<Giveaway, "id" | "createdAt"> | null>(null);

  const handleStepChange = (step: number, data?: any) => {
    setCurrentStep(step);
    if (data) {
      setGiveawayData((prev) => ({ ...prev, ...data }));
    }
  };

  const handleComplete = (data: Omit<Giveaway, "id" | "createdAt">) => {
    setCompletedData(data);
    // Here you would normally save the giveaway
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-center mb-6">
            Test Giveaway Flow
          </h1>
          
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${(currentStep / 2) * 100}%` }}
              ></div>
            </div>
            <p className="text-center mt-2 text-sm text-gray-500">
              Step {currentStep} of 2
            </p>
          </div>

          <GiveawayWizard
            currentStep={currentStep}
            giveawayData={giveawayData}
            onStepChange={handleStepChange}
            onComplete={handleComplete}
          />

          {completedData && (
            <div className="mt-8 p-4 border border-gray-200 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Completed Giveaway Data:</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(completedData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 