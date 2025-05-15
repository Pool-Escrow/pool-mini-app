"use client";

import { useState, ChangeEvent } from "react";

interface GiveawayInfoStepProps {
  initialData?: {
    amount?: number;
    participantLimit?: number;
    description?: string;
  };
  onNext: (data: { amount: number; participantLimit: number; description: string }) => void;
}

const MAX_DESC_LENGTH = 200;

export function GiveawayInfoStep({
  initialData,
  onNext,
}: GiveawayInfoStepProps) {
  const [amount, setAmount] = useState<number | ''>(initialData?.amount || '');
  const [participantLimit, setParticipantLimit] = useState<number | ''>(initialData?.participantLimit || '');
  const [description, setDescription] = useState(initialData?.description || "");

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      setAmount(value === '' ? '' : parseFloat(value));
    }
  };

  const handleParticipantLimitChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setParticipantLimit(value === '' ? '' : parseInt(value, 10));
    }
  };

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= MAX_DESC_LENGTH) {
      setDescription(e.target.value);
    }
  };

  const isFormValid = () => {
    return (
      amount !== '' && 
      amount > 0 && 
      participantLimit !== '' && 
      participantLimit > 0 && 
      description.trim() !== ''
    );
  };

  const handleSubmit = () => {
    if (isFormValid()) {
      onNext({ 
        amount: amount as number, 
        participantLimit: participantLimit as number, 
        description 
      });
    }
  };

  return (
    <div className="flex flex-col items-center p-4 sm:p-8 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-1 text-center text-gray-900">
        Giveaway Amount*
      </h2>
      <p className="text-sm text-gray-500 mb-6 text-center">
        Enter the amount for your giveaway
      </p>
      <div className="w-full relative mb-8">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <span className="text-gray-500">$</span>
        </div>
        <input
          type="text"
          value={amount}
          onChange={handleAmountChange}
          placeholder="0.00"
          className="w-full p-3 pl-8 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
        />
      </div>

      <h2 className="text-2xl font-semibold mb-1 text-center text-gray-900">
        Participant Limit*
      </h2>
      <p className="text-sm text-gray-500 mb-6 text-center">
        Maximum number of participants allowed
      </p>
      <input
        type="text"
        value={participantLimit}
        onChange={handleParticipantLimitChange}
        placeholder="Number of participants"
        className="w-full p-3 mb-8 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
      />

      <h2 className="text-2xl font-semibold mb-1 text-center text-gray-900">
        Description*
      </h2>
      <p className="text-sm text-gray-500 mb-4 text-center">
        Enter a description for your giveaway
      </p>
      <div className="w-full relative">
        <textarea
          value={description}
          onChange={handleDescriptionChange}
          placeholder="Giveaway Description"
          rows={5}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900 placeholder:text-gray-400"
        />
        <p className="text-xs text-gray-400 absolute bottom-2 right-2">
          {description.length}/{MAX_DESC_LENGTH}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full mt-8">
        <button
          onClick={handleSubmit}
          disabled={!isFormValid()}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
} 