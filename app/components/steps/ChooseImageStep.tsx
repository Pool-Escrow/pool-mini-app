"use client";

import { useState } from "react";

interface ChooseImageStepProps {
  onNext: (data: { selectedImage: string }) => void;
}

const imageTemplates = Array.from({ length: 8 }, (_, i) => `template-${i + 1}`);

export function ChooseImageStep({ onNext }: ChooseImageStepProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageSelect = (imageName: string) => {
    setSelectedImage(imageName);
  };

  const handleSubmit = () => {
    if (selectedImage) {
      onNext({ selectedImage });
    }
  };

  return (
    <div className="flex flex-col items-center p-4 sm:p-8">
      <h2 className="text-2xl font-semibold mb-2 text-center">Choose Image*</h2>
      <p className="text-sm text-gray-500 mb-8 text-center">
        Choose from one of our 8 templates
      </p>

      <div className="grid grid-cols-4 gap-4 mb-8 w-full max-w-md">
        {imageTemplates.map((template) => (
          <button
            key={template}
            onClick={() => handleImageSelect(template)}
            className={`aspect-video bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors
                        ${selectedImage === template ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}
            aria-label={`Select image ${template}`}
          >
            {/* Placeholder for image content or name */}
            {/* <span className="text-xs text-gray-500">{template}</span> */}
          </button>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selectedImage}
        className="w-full max-w-xs bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg 
                   disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        Continue
      </button>
    </div>
  );
}
