"use client";

import { useState, ChangeEvent } from "react";

interface NameDescriptionStepProps {
  initialData?: {
    name?: string;
    description?: string;
  };
  onNext: (data: { name: string; description: string }) => void;
  onBack?: () => void; // Optional: if you want a back button on this step
}

const MAX_DESC_LENGTH = 200;

export function NameDescriptionStep({
  initialData,
  onNext,
  onBack,
}: NameDescriptionStepProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= MAX_DESC_LENGTH) {
      setDescription(e.target.value);
    }
  };

  const handleSubmit = () => {
    // Basic validation, can be expanded
    if (name.trim() && description.trim()) {
      onNext({ name, description });
    }
  };

  return (
    <div className="flex flex-col items-center p-4 sm:p-8 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-1 text-center text-gray-900">
        Name of Pool*
      </h2>
      <p className="text-sm text-gray-500 mb-6 text-center">
        Enter a name for your Pool
      </p>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Pool Name"
        className="w-full p-3 mb-8 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
      />

      <h2 className="text-2xl font-semibold mb-1 text-center text-gray-900">
        Description*
      </h2>
      <p className="text-sm text-gray-500 mb-4 text-center">
        Enter a description for your Pool
      </p>
      <div className="w-full relative">
        <textarea
          value={description}
          onChange={handleDescriptionChange}
          placeholder="Pool Description"
          rows={5}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900 placeholder:text-gray-400"
        />
        <p className="text-xs text-gray-400 absolute bottom-2 right-2">
          {description.length}/{MAX_DESC_LENGTH}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full mt-8">
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
          disabled={!name.trim() || !description.trim()}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
