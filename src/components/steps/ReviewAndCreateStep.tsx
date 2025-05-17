import { CONTRACT_CONFIG } from '@/config/contract-config'
import { PREDEFINED_TOKENS } from '@/config/tokens'
import { useCreatePool } from '@/hooks/use-pool-contract'
import { useTransactionStatus } from '@/hooks/use-transaction-status'
import type { Pool } from '@/types/pool'
import { BlockchainErrorType } from '@/utils/error-handling'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { parseUnits, type Address, type Hash } from 'viem'
import { useChainId } from 'wagmi'
import { BlockchainErrorMessage } from '../BlockchainErrorMessage'
import { TransactionStatusDisplay } from '../TransactionStatusDisplay'

interface ReviewAndCreateStepProps {
    poolData: Partial<Pool>
    onConfirm: (txHash: string) => void // Pass txHash on successful creation
    onBack: () => void
}

export function ReviewAndCreateStep({ poolData, onConfirm, onBack }: ReviewAndCreateStepProps) {
    const chainId = useChainId()
    const poolContractAddress = CONTRACT_CONFIG.getPoolContractAddress(chainId)

    const { createPool, parsedCreatePoolError, isCreatingPool: isSubmittingCreateTx } = useCreatePool()
    const [creationError, setCreationError] = useState<string | null>(null)
    const [submittedTxHash, setSubmittedTxHash] = useState<Hash | undefined>(undefined)
    const [onConfirmCalled, setOnConfirmCalled] = useState(false) // Gate to prevent multiple calls

    const {
        error: txConfirmError,
        isLoading: isTxLoading,
        isSuccess: isTxSuccess,
    } = useTransactionStatus(submittedTxHash)

    const displayValue = (value: string | number | boolean | Date | undefined | null, placeholder = 'Not set') =>
        value !== undefined && value !== null && value !== '' ? String(value) : placeholder

    const handleConfirmAndCreate = async () => {
        if (!poolContractAddress || poolContractAddress === '0x0000000000000000000000000000000000000000') {
            setCreationError('Pool contract address is not configured for the current network.')
            return
        }

        setCreationError(null)
        setSubmittedTxHash(undefined)

        try {
            // Critical check: Ensure all necessary data for contract args is present before proceeding.
            const missingFields: string[] = []
            if (!poolData.startTime) missingFields.push('startTime (Unix timestamp)')
            if (!poolData.endTime) missingFields.push('endTime (Unix timestamp)')
            if (!poolData.name) missingFields.push('name')
            if (poolData.depositAmountPerPerson === undefined) missingFields.push('depositAmountPerPerson')
            if (!poolData.tokenContractAddress) missingFields.push('tokenContractAddress')
            if (poolData.totalWinners === undefined) missingFields.push('totalWinners')
            if (poolData.amountPerWinner === undefined) missingFields.push('amountPerWinner')
            if (!poolData.onChainTokenDecimals) missingFields.push('onChainTokenDecimals')

            if (missingFields.length > 0) {
                console.error(
                    'Critical data missing in ReviewAndCreateStep. Missing or invalid fields:',
                    missingFields.join(', '),
                    'Full data object:',
                    poolData,
                )
                setCreationError(
                    `Critical pool information is missing or incorrect: ${missingFields.join(
                        ', ',
                    )}. Please review your input or try creating the pool again.`,
                )
                return
            }

            // startTime and endTime are already Unix timestamps in the new interface
            const args = {
                timeStart: BigInt(poolData.startTime!),
                timeEnd: BigInt(poolData.endTime!),
                poolName: poolData.name!,
                depositAmountPerPerson: parseUnits(
                    poolData.depositAmountPerPerson!.toString(),
                    poolData.onChainTokenDecimals!,
                ),
                token: poolData.tokenContractAddress! as Address,
                totalWinners: poolData.totalWinners!,
                amountPerWinner: parseUnits(poolData.amountPerWinner!.toString(), poolData.onChainTokenDecimals!),
            }

            console.log('Submitting pool creation with args:', args)
            console.log('Chain ID:', chainId)
            console.log('Pool Contract Address:', poolContractAddress)
            console.log('Pool Data used for args:', poolData)

            const txHash = await createPool(poolContractAddress, args)
            if (txHash) {
                setSubmittedTxHash(txHash)
            }
        } catch (error: unknown) {
            console.error('Error during createPool call in ReviewAndCreateStep:', error)
        }
    }

    useEffect(() => {
        if (isTxSuccess && submittedTxHash && !onConfirmCalled) {
            onConfirm(submittedTxHash)
            setOnConfirmCalled(true) // Set the gate
        }
    }, [isTxSuccess, submittedTxHash, onConfirm, onConfirmCalled])

    const overallIsLoading = isSubmittingCreateTx || (submittedTxHash && isTxLoading)

    return (
        <div className='space-y-6'>
            <h2 className='text-xl font-semibold text-gray-800'>Review Your Pool Details</h2>

            <div className='space-y-4 rounded-md border border-gray-200 bg-white p-4 shadow-sm'>
                {poolData.selectedImage && (
                    <div className='mb-4'>
                        <p className='text-sm font-medium text-gray-500'>Selected Image:</p>
                        <div className='relative h-32 w-32'>
                            <Image
                                fill
                                src={poolData.selectedImage}
                                alt='Pool Preview'
                                className='mt-1 h-32 w-32 rounded-md object-cover'
                            />
                        </div>
                    </div>
                )}
                <div>
                    <p className='text-sm font-medium text-gray-500'>Name</p>
                    <p className='text-gray-700'>{displayValue(poolData.name)}</p>
                </div>
                <div>
                    <p className='text-sm font-medium text-gray-500'>Description</p>
                    <p className='text-gray-700'>{displayValue(poolData.description)}</p>
                </div>

                <hr className='my-3' />

                <div>
                    <p className='text-sm font-medium text-gray-500'>Registration Starts</p>
                    <p className='text-gray-700'>
                        {displayValue(
                            poolData.startTime ? new Date(poolData.startTime * 1000).toLocaleString() : undefined,
                        )}
                    </p>
                </div>
                <div>
                    <p className='text-sm font-medium text-gray-500'>Registration Ends</p>
                    <p className='text-gray-700'>
                        {displayValue(
                            poolData.endTime ? new Date(poolData.endTime * 1000).toLocaleString() : undefined,
                        )}
                    </p>
                </div>

                <hr className='my-3' />

                <h3 className='text-md font-semibold text-gray-700'>Pool Configuration</h3>
                <div>
                    <p className='text-sm font-medium text-gray-500'>Deposit Amount (per entry)</p>
                    <p className='text-gray-700'>{displayValue(poolData.depositAmountPerPerson)}</p>
                </div>
                <div>
                    <p className='text-sm font-medium text-gray-500'>Amount Per Winner</p>
                    <p className='text-gray-700'>{displayValue(poolData.amountPerWinner)}</p>
                </div>
                <div>
                    <p className='text-sm font-medium text-gray-500'>Max Entries (Soft Cap)</p>
                    <p className='text-gray-700'>{displayValue(poolData.softCap)}</p>
                </div>
                <div>
                    <p className='text-sm font-medium text-gray-500'>Rules Link</p>
                    <p className='text-gray-700'>
                        {poolData.rulesLink ? (
                            <a
                                href={poolData.rulesLink}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='text-blue-600 hover:underline'>
                                {poolData.rulesLink}
                            </a>
                        ) : (
                            'Not set'
                        )}
                    </p>
                </div>

                <hr className='my-3' />
                <h3 className='text-md font-semibold text-gray-700'>On-Chain Configuration</h3>
                <div>
                    <p className='text-sm font-medium text-gray-500'>Token</p>
                    {poolData.selectedTokenKey && PREDEFINED_TOKENS[poolData.selectedTokenKey] ? (
                        <p className='text-gray-700'>Token: {PREDEFINED_TOKENS[poolData.selectedTokenKey].symbol}</p>
                    ) : poolData.selectedTokenKey === 'custom' && poolData.tokenContractAddress ? (
                        <p className='text-gray-700'>Token: Custom - {poolData.tokenContractAddress}</p>
                    ) : (
                        <p className='text-gray-700'>
                            {displayValue(poolData.tokenContractAddress, 'Token not specified')}
                        </p>
                    )}
                </div>
                <div>
                    <p className='text-sm font-medium text-gray-500'>Number of Winners</p>
                    <p className='text-gray-700'>{displayValue(poolData.totalWinners)}</p>
                </div>
            </div>

            {isSubmittingCreateTx && !submittedTxHash && (
                <div className='mt-4 text-center text-indigo-600'>
                    <p>Submitting pool creation transaction...</p>
                    <p>Please confirm in your wallet.</p>
                </div>
            )}

            {submittedTxHash && (
                <TransactionStatusDisplay hash={submittedTxHash} chainId={chainId} title='Pool Creation Status' />
            )}

            {parsedCreatePoolError && !submittedTxHash && (
                <BlockchainErrorMessage error={parsedCreatePoolError} className='mt-4' />
            )}
            {txConfirmError && submittedTxHash && (
                <BlockchainErrorMessage
                    error={{
                        type: BlockchainErrorType.UNKNOWN,
                        message: txConfirmError.message,
                        suggestion:
                            'The transaction was submitted but may have failed to confirm or was reverted. Check the block explorer.',
                    }}
                    className='mt-4'
                />
            )}

            {creationError && !parsedCreatePoolError && !submittedTxHash && (
                <div className='mt-4 rounded-md bg-red-50 p-3'>
                    <p className='text-sm font-medium text-red-700'>{creationError}</p>
                </div>
            )}

            <div className='flex justify-between pt-2'>
                <button
                    onClick={onBack}
                    disabled={overallIsLoading ?? isTxSuccess}
                    className='rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'>
                    Back
                </button>
                <button
                    onClick={() => void handleConfirmAndCreate()}
                    disabled={overallIsLoading ?? isTxSuccess}
                    className='rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'>
                    {isSubmittingCreateTx
                        ? 'Submitting...'
                        : submittedTxHash && isTxLoading
                          ? 'Processing...'
                          : isTxSuccess
                            ? 'Pool Created!'
                            : 'Confirm and Create Pool'}
                </button>
            </div>
        </div>
    )
}
