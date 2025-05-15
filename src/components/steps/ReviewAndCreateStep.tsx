'use client'

import { CONTRACT_CONFIG } from '@/config/contract-config'
import { PREDEFINED_TOKENS } from '@/config/tokens'
import { useCreatePool } from '@/hooks/use-pool-contract'
import { Pool } from '@/types/pool'
import Image from 'next/image'
import { useState } from 'react'
import { parseUnits, type Address } from 'viem'
import { useChainId } from 'wagmi'

interface ReviewAndCreateStepProps {
    poolData: Partial<Pool>
    onConfirm: (txHash: string) => void // Pass txHash on successful creation
    onBack: () => void
}

export function ReviewAndCreateStep({ poolData, onConfirm, onBack }: ReviewAndCreateStepProps) {
    const chainId = useChainId()
    const poolContractAddress = CONTRACT_CONFIG.getPoolContractAddress(chainId)

    const { createPool, createPoolData, rawCreatePoolError, parsedCreatePoolError, isCreatingPool } = useCreatePool()
    const [creationError, setCreationError] = useState<string | null>(null)

    const displayValue = (value: string | number | boolean | Date | undefined | null, placeholder = 'Not set') =>
        value !== undefined && value !== null && value !== '' ? String(value) : placeholder

    const handleConfirmAndCreate = async () => {
        if (!poolContractAddress || poolContractAddress === '0x0000000000000000000000000000000000000000') {
            setCreationError('Pool contract address is not configured for the current network.')
            return
        }
        if (
            !poolData.registrationStart ||
            !poolData.registrationEnd ||
            !poolData.name ||
            poolData.depositAmount === undefined ||
            poolData.tokenAddress === undefined ||
            poolData.tokenDecimals === undefined ||
            poolData.winnerCount === undefined ||
            poolData.amountPerWinner === undefined
        ) {
            setCreationError(
                'One or more required pool data fields are missing. Please go back and complete all steps.',
            )
            return
        }

        setCreationError(null)

        try {
            const timeStart = BigInt(Math.floor(new Date(poolData.registrationStart).getTime() / 1000))
            const timeEnd = BigInt(Math.floor(new Date(poolData.registrationEnd).getTime() / 1000)) // Assuming registrationEnd is a full date string

            const args = {
                timeStart,
                timeEnd,
                poolName: poolData.name,
                depositAmountPerPerson: parseUnits(poolData.depositAmount.toString(), poolData.tokenDecimals),
                token: poolData.tokenAddress as Address,
                totalWinners: poolData.winnerCount,
                amountPerWinner: parseUnits(poolData.amountPerWinner.toString(), poolData.tokenDecimals),
            }

            const txHash = await createPool(poolContractAddress, args)
            if (txHash) {
                onConfirm(txHash)
            }
        } catch (error: unknown) {
            // The useCreatePool hook already catches, parses, and sets parsedCreatePoolError.
            // It then re-throws the parsed error. We can log it here if needed.
            console.error('Error during createPool call in ReviewAndCreateStep:', error)
            // No need to setCreationError here for errors from createPool,
            // as parsedCreatePoolError will be updated by the hook and trigger UI changes.
            // The local `creationError` state is primarily for client-side pre-flight checks.
        }
    }

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
                            poolData.registrationStart
                                ? new Date(poolData.registrationStart).toLocaleString()
                                : undefined,
                        )}
                    </p>
                </div>
                <div>
                    <p className='text-sm font-medium text-gray-500'>Registration Ends</p>
                    <p className='text-gray-700'>
                        {displayValue(
                            poolData.registrationEnd ? new Date(poolData.registrationEnd).toLocaleString() : undefined,
                        )}
                    </p>
                </div>
                {/* Registration Enabled display can be kept if it's still relevant for off-chain logic */}
                {/* <div>
                    <p className='text-sm font-medium text-gray-500'>Registration Enabled</p>
                    <p className='text-gray-700'>{displayValue(poolData.registrationEnabled)}</p>
                </div> */}

                <hr className='my-3' />

                <h3 className='text-md font-semibold text-gray-700'>Pool Configuration</h3>
                <div>
                    <p className='text-sm font-medium text-gray-500'>Deposit Amount (per entry)</p>
                    <p className='text-gray-700'>{displayValue(poolData.depositAmount)}</p>
                </div>
                <div>
                    <p className='text-sm font-medium text-gray-500'>Amount Per Winner</p>
                    <p className='text-gray-700'>{displayValue(poolData.amountPerWinner)}</p>
                </div>
                <div>
                    <p className='text-sm font-medium text-gray-500'>Max Entries (Soft Cap)</p>
                    <p className='text-gray-700'>{displayValue(poolData.maxEntries)}</p>
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
                    ) : poolData.selectedTokenKey === 'custom' && poolData.tokenAddress ? (
                        <p className='text-gray-700'>Token: Custom - {poolData.tokenAddress}</p>
                    ) : (
                        // Fallback display if selectedTokenKey is not set or tokenAddress is missing for custom
                        <p className='text-gray-700'>{displayValue(poolData.tokenAddress, 'Token not specified')}</p>
                    )}
                </div>
                <div>
                    <p className='text-sm font-medium text-gray-500'>Number of Winners</p>
                    <p className='text-gray-700'>{displayValue(poolData.winnerCount)}</p>
                </div>
            </div>

            {isCreatingPool && (
                <div className='mt-4 text-center text-indigo-600'>
                    <p>Processing pool creation...</p>
                    <p>Please confirm the transaction in your wallet.</p>
                </div>
            )}

            {rawCreatePoolError && !parsedCreatePoolError && (
                <div className='mt-4 rounded-md bg-red-50 p-3'>
                    <p className='text-sm font-medium text-red-700'>
                        An error occurred. Please check your wallet and try again.
                    </p>
                    <p className='text-xs text-red-600'>{rawCreatePoolError.message.split('Details:')[0]}</p>
                </div>
            )}
            {parsedCreatePoolError && (
                <div className='mt-4 rounded-md bg-red-50 p-3'>
                    <p className='text-sm font-semibold text-red-700 capitalize'>
                        {parsedCreatePoolError.type.replace(/_/g, ' ')}
                    </p>
                    <p className='text-sm text-red-600'>{parsedCreatePoolError.message}</p>
                    <p className='mt-1 text-xs text-red-500'>{parsedCreatePoolError.suggestion}</p>
                </div>
            )}
            {creationError && !parsedCreatePoolError && !rawCreatePoolError && (
                <div className='mt-4 rounded-md bg-red-50 p-3'>
                    <p className='text-sm font-medium text-red-700'>{creationError}</p>
                </div>
            )}

            {createPoolData && (
                <div className='mt-4 rounded-md bg-green-50 p-3'>
                    <p className='text-sm font-medium text-green-700'>Pool creation transaction submitted!</p>
                    <p className='truncate text-xs text-green-600'>Transaction Hash: {createPoolData}</p>
                    {/* Optionally, add a link to a block explorer */}
                    {/* <a href={`https://etherscan.io/tx/${createPoolData}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">View on Etherscan</a> */}
                </div>
            )}

            <div className='flex justify-between pt-2'>
                <button
                    onClick={onBack}
                    disabled={isCreatingPool || !!createPoolData}
                    className='rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'>
                    Back
                </button>
                <button
                    onClick={handleConfirmAndCreate}
                    disabled={isCreatingPool || !!createPoolData}
                    className='rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'>
                    {isCreatingPool ? 'Creating...' : createPoolData ? 'Created!' : 'Confirm and Create Pool'}
                </button>
            </div>
        </div>
    )
}
