interface ProgressBarProps {
    currentStep: number
    totalSteps: number
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
    return (
        <div className='w-full px-4 py-4 sm:px-8'>
            <div className='mb-1 flex items-center justify-between'>
                <span className='text-xs text-gray-600'>
                    Step {currentStep} of {totalSteps}
                </span>
            </div>
            <div className='h-2 w-full rounded-full bg-gray-200'>
                <div
                    className='h-2 rounded-full bg-blue-500 transition-all duration-300 ease-in-out'
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
            </div>
        </div>
    )
}
