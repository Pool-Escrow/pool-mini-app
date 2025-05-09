"use client";

import { useState } from "react";

interface NumericKeypadPaymentProps {
  participant: {
    id: string;
    name: string;
    address: string;
    avatar?: string;
  };
  onBack: () => void;
  onSubmit: (amount: number) => void;
}

export function NumericKeypadPayment({ participant, onBack, onSubmit }: NumericKeypadPaymentProps) {
  const [amount, setAmount] = useState<string>("0");

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and decimals
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value === "" ? "0" : value);
    }
  };

  const handleSubmit = () => {
    onSubmit(parseFloat(amount));
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F8FF]">
      {/* Header */}
      <header className="bg-white p-4 shadow-sm">
        <div className="flex items-center">
          <button onClick={onBack} className="text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-center flex-1 mr-5">User Profile</h1>
        </div>
      </header>

      {/* Profile */}
      <div className="flex flex-col items-center pt-8 pb-4">
        <div className="w-24 h-24 bg-gray-300 rounded-full mb-4 overflow-hidden">
          {participant.avatar ? (
            <img 
              src={participant.avatar} 
              alt={participant.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-500">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {participant.name || "Anonymous"}
        </h2>
        <p className="text-blue-500 mt-1">{participant.address}</p>
      </div>

      {/* Amount Input */}
      <div className="px-6 py-8">
        <div className="relative text-center">
          <input
            type="text"
            value={amount}
            onChange={handleAmountChange}
            className="text-5xl font-bold text-center w-full bg-transparent border-none focus:outline-none"
            inputMode="decimal"
          />
          <div className="absolute left-0 right-0 top-0 pointer-events-none flex justify-center items-center">
            <span className="text-5xl font-bold text-gray-500 mr-2">$</span>
          </div>
        </div>
      </div>

      {/* Pay Button */}
      <div className="flex-grow flex items-end justify-center mb-8 px-6">
        <button 
          onClick={handleSubmit}
          className="w-full py-4 bg-blue-500 text-white font-bold rounded-full text-xl hover:bg-blue-600 transition-colors"
        >
          Pay
        </button>
      </div>
      
      {/* Home Indicator for iOS-style UI */}
      <div className="flex justify-center items-center py-8">
        <div className="w-1/3 h-1 bg-gray-300 rounded-full"></div>
      </div>
    </div>
  );
} 