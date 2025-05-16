"use client";

import React from "react";
import { Modal } from "@/app/components/Modal";
import { Button } from "@/app/components/DemoComponents";
import { Pool } from "@/app/types/pool";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  pool: Pool;
  onRegister: () => void;
}

export function RegistrationModal({
  isOpen,
  onClose,
  pool,
  onRegister,
}: RegistrationModalProps) {
  const handleConfirmRegistration = () => {
    onRegister();
    onClose();
  };

  const renderBuyInConfirmation = () => {
    if (pool.buyIn === 0) {
      return (
        <div className="text-center mb-4">
          <p className="text-gray-700">This event is free to join!</p>
        </div>
      );
    }

    return (
      <div className="text-center mb-4">
        <p className="text-gray-700 mb-2">This event has a buy-in amount of:</p>
        <p className="text-2xl font-bold text-gray-900">${pool.buyIn} USDC</p>
        <p className="text-sm text-gray-500 mt-1">
          By registering, you agree to pay this amount to participate.
        </p>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-lg overflow-hidden w-full max-w-md mx-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Join {pool.name}
          </h2>
        </div>
        
        <div className="p-6">
          {renderBuyInConfirmation()}
          
          <div className="mb-6">
            <h3 className="font-medium text-gray-800 mb-2">
              About this event:
            </h3>
            <p className="text-gray-600">
              {pool.description}
            </p>
          </div>

          <div className="flex space-x-3">
            <Button
              className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg"
              onClick={handleConfirmRegistration}
            >
              Confirm
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
} 