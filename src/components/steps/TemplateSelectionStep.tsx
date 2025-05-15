'use client'

// import { POOL_TEMPLATES } from "@/lib/poolTemplates";

interface TemplateSelectionStepProps {
    onTemplateSelect: (templateId: string) => void
}

export function TemplateSelectionStep({ onTemplateSelect }: TemplateSelectionStepProps) {
    console.log('TemplateSelectionStep', onTemplateSelect)

    return (
        <div className='mx-auto flex w-full max-w-2xl flex-col items-center p-4 sm:p-8'>
            <h2 className='mb-2 text-center text-2xl font-semibold text-gray-900'>Choose Pool Type</h2>
            <p className='mb-8 text-center text-sm text-gray-500'>Select a template or start from scratch</p>

            <div className='grid w-full grid-cols-1 gap-4 sm:grid-cols-2'>
                {/* {POOL_TEMPLATES.map((template) => (
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
        ))} */}
            </div>
        </div>
    )
}
