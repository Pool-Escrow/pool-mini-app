"use client";

import { Icon } from "@/app/components/Icon";
import { POOL_TEMPLATES, PoolTemplate } from "@/app/lib/poolTemplates";

interface TemplateSelectionStepProps {
  onTemplateSelect: (templateId: string) => void;
}

export function TemplateSelectionStep({
  onTemplateSelect,
}: TemplateSelectionStepProps) {
  return (
    <div className="flex flex-col items-center p-4 sm:p-8 w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-2 text-center text-gray-900">
        Choose Pool Type
      </h2>
      <p className="text-sm text-gray-500 mb-8 text-center">
        Select a template or start from scratch
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {POOL_TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => onTemplateSelect(template.id)}
            className="flex flex-col items-center p-6 border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all bg-white text-left w-full group"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Icon name={template.icon || "plus"} className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {template.name}
            </h3>
            <p className="text-sm text-gray-500">{template.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
