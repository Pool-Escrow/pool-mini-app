"use client";

import { useState } from "react";
import { RegistrationTimeStep } from "@/app/components/steps/RegistrationTimeStep";

export default function TestRegistrationPage() {
  const [registrationData, setRegistrationData] = useState<{
    registrationStart: string;
    registrationEnd: string;
    registrationEnabled: boolean;
  } | null>(null);

  const handleNext = (data: {
    registrationStart: string;
    registrationEnd: string;
    registrationEnabled: boolean;
  }) => {
    setRegistrationData(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-center mb-6">
            Registration Time Component Test
          </h1>
          
          <RegistrationTimeStep
            initialData={{
              registrationStart: "2024-11-25T16:45:00Z",
              registrationEnd: "2024-11-25T17:45:00Z",
              registrationEnabled: true,
            }}
            onNext={handleNext}
          />

          {registrationData && (
            <div className="mt-8 p-4 border border-gray-200 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Submitted Data:</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(registrationData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 