"use client";

import { useState } from "react";

interface DetailsStepProps {
  initialData?: {
    buyIn?: number;
    softCap?: number;
    rulesLink?: string;
  };
  onNext: (data: { buyIn: number; softCap: number; rulesLink: string }) => void;
  onBack?: () => void;
}

export function DetailsStep({ initialData, onNext, onBack }: DetailsStepProps) {
  const [buyIn, setBuyIn] = useState<string>(
    initialData?.buyIn?.toString() || "",
  );
  const [softCap, setSoftCap] = useState<string>(
    initialData?.softCap?.toString() || "",
  );
  const [rulesLink, setRulesLink] = useState(initialData?.rulesLink || "");

  const handleSubmit = () => {
    const buyInNum = parseFloat(buyIn);
    const softCapNum = parseFloat(softCap);

    if (!isNaN(buyInNum) && !isNaN(softCapNum) && rulesLink.trim()) {
      onNext({ buyIn: buyInNum, softCap: softCapNum, rulesLink });
    }
  };

  const isFormValid = () => {
    const buyInNum = parseFloat(buyIn);
    const softCapNum = parseFloat(softCap);
    return (
      !isNaN(buyInNum) &&
      buyInNum > 0 &&
      !isNaN(softCapNum) &&
      softCapNum > 0 &&
      rulesLink.trim() !== ""
    );
  };

  return (
    <div className="flex flex-col items-center p-4 sm:p-8 w-full max-w-md mx-auto">
      <div className="w-full mb-6">
        <label
          htmlFor="buyIn"
          className="block text-xl font-semibold mb-1 text-center text-gray-900"
        >
          Buy in*
        </label>
        <p className="text-sm text-gray-500 mb-3 text-center">
          What is the price to participate in the Pool?
        </p>
        <input
          id="buyIn"
          type="number"
          value={buyIn}
          onChange={(e) => setBuyIn(e.target.value)}
          placeholder="e.g., 10"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
        />
      </div>

      <div className="w-full mb-6">
        <label
          htmlFor="softCap"
          className="block text-xl font-semibold mb-1 text-center text-gray-900"
        >
          Soft Cap*
        </label>
        <p className="text-sm text-gray-500 mb-3 text-center">
          Enter the max amount of paid entries allowed to join
        </p>
        <input
          id="softCap"
          type="number"
          value={softCap}
          onChange={(e) => setSoftCap(e.target.value)}
          placeholder="e.g., 100"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
        />
      </div>

      <div className="w-full mb-8">
        <label
          htmlFor="rulesLink"
          className="block text-xl font-semibold mb-1 text-center text-gray-900"
        >
          Link To Rules, Terms, and Conditions
        </label>
        <p className="text-sm text-gray-500 mb-3 text-center">
          Paste a link to your rules
        </p>
        <input
          id="rulesLink"
          type="url"
          value={rulesLink}
          onChange={(e) => setRulesLink(e.target.value)}
          placeholder="https://example.com/rules"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full">
        {onBack && (
          <button
            onClick={onBack}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Back
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={!isFormValid()}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Create Pool
        </button>
      </div>
    </div>
  );
}
