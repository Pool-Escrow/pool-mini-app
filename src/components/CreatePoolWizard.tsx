import { ChooseImageStep } from '@/components/steps/ChooseImageStep'
import { NameDescriptionStep } from '@/components/steps/NameDescriptionStep'
import { PoolConfigStep } from '@/components/steps/PoolConfigStep'
import { RegistrationTimeStep } from '@/components/steps/RegistrationTimeStep'
import { ReviewAndCreateStep } from '@/components/steps/ReviewAndCreateStep'
import {
    type ChooseImageStepValues,
    type NameDescriptionStepValues,
    type PoolConfigStepValues,
    type RegistrationTimeStepValues,
} from '@/lib/validators/poolCreationSchemas'
import type { Pool } from '@/types/pool'

export type StepData =
    | ChooseImageStepValues
    | NameDescriptionStepValues
    | RegistrationTimeStepValues
    | PoolConfigStepValues

export const TOTAL_STEPS_WIZARD = 5

interface CreatePoolWizardProps {
    currentStep: number
    poolData: Partial<Pool>
    onStepChange: (step: number, data?: StepData) => void
    onComplete: (completedPoolData: Omit<Pool, 'id' | 'createdAt'> & { txHash: string }) => void
}

export function CreatePoolWizard({ currentStep, poolData, onStepChange, onComplete }: CreatePoolWizardProps) {
    const handleNext = (stepSpecificData: StepData) => {
        if (currentStep < TOTAL_STEPS_WIZARD) {
            onStepChange(currentStep + 1, stepSpecificData)
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            onStepChange(currentStep - 1)
        }
    }

    return (
        <div className='flex-grow overflow-y-auto p-4 sm:p-6'>
            {currentStep === 1 && <ChooseImageStep onNext={data => handleNext(data)} />}
            {currentStep === 2 && (
                <NameDescriptionStep
                    initialData={{
                        name: poolData.name,
                        description: poolData.description,
                    }}
                    onNext={data => handleNext(data)}
                    onBack={handleBack}
                />
            )}
            {currentStep === 3 && (
                <RegistrationTimeStep
                    initialData={{
                        registrationEnd: poolData.endTime ? new Date(poolData.endTime) : undefined,
                    }}
                    onNext={data => handleNext(data)}
                    onBack={handleBack}
                />
            )}
            {currentStep === 4 && (
                <PoolConfigStep
                    initialData={{
                        depositAmount: poolData.depositAmountPerPerson,
                        limit: poolData.softCap,
                        rulesLink: poolData.rulesLink,
                        selectedTokenKey: poolData.selectedTokenKey,
                        customTokenAddress: poolData.customTokenAddress,
                        customTokenSymbol: poolData.customTokenSymbol,
                        customTokenDecimals: poolData.customTokenDecimals,
                        winnerCount: poolData.totalWinners,
                        amountPerWinner: poolData.amountPerWinner,
                    }}
                    onNext={data => handleNext(data)}
                    onBack={handleBack}
                />
            )}
            {currentStep === 5 && (
                <ReviewAndCreateStep
                    poolData={poolData}
                    onConfirm={txHash => {
                        const finalPoolData = {
                            ...poolData,
                            txHash,
                        } as Omit<Pool, 'id' | 'createdAt'> & { txHash: string }
                        onComplete(finalPoolData)
                    }}
                    onBack={handleBack}
                />
            )}
        </div>
    )
}
