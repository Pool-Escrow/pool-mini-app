'use client'

import { PREDEFINED_TOKENS } from '@/config/tokens'
import { useEffect, useState } from 'react'

interface PoolConfigStepProps {
    initialData?: {
        depositAmount?: number
        maxEntries?: number
        rulesLink?: string
        // Fields to store the final token details, regardless of selection method
        tokenAddress?: string
        tokenSymbol?: string
        tokenDecimals?: number
        // Field to store which predefined token was selected, or 'custom'
        selectedTokenKey?: string
        winnerCount?: number
        amountPerWinner?: number
    }
    onNext: (data: {
        depositAmount: number
        maxEntries: number
        rulesLink: string
        tokenAddress: string
        tokenSymbol: string
        tokenDecimals: number
        winnerCount: number
        amountPerWinner: number
        selectedTokenKey: string // Pass the selected key for continuity
    }) => void
    onBack?: () => void
}

const CUSTOM_TOKEN_KEY = 'custom'

export function PoolConfigStep({ initialData, onNext, onBack }: PoolConfigStepProps) {
    const [depositAmount, setDepositAmount] = useState<string>(initialData?.depositAmount?.toString() || '')
    const [maxEntries, setMaxEntries] = useState<string>(initialData?.maxEntries?.toString() || '')
    const [rulesLink, setRulesLink] = useState(initialData?.rulesLink || '')
    const [winnerCount, setWinnerCount] = useState<string>(initialData?.winnerCount?.toString() || '')
    const [amountPerWinner, setAmountPerWinner] = useState<string>(initialData?.amountPerWinner?.toString() || '')

    // Token selection state
    const [selectedTokenKey, setSelectedTokenKey] = useState<string>(
        initialData?.selectedTokenKey || Object.keys(PREDEFINED_TOKENS)[0] || CUSTOM_TOKEN_KEY,
    )

    // State for custom token inputs - only used if selectedTokenKey is 'custom'
    const [customTokenAddress, setCustomTokenAddress] = useState(
        initialData?.selectedTokenKey === CUSTOM_TOKEN_KEY ? initialData?.tokenAddress || '' : '',
    )
    const [customTokenSymbol, setCustomTokenSymbol] = useState(
        initialData?.selectedTokenKey === CUSTOM_TOKEN_KEY ? initialData?.tokenSymbol || '' : '',
    )
    const [customTokenDecimals, setCustomTokenDecimals] = useState<string>(
        initialData?.selectedTokenKey === CUSTOM_TOKEN_KEY ? initialData?.tokenDecimals?.toString() || '' : '',
    )

    // Effect to update custom fields if initialData changes and custom is selected
    useEffect(() => {
        if (initialData?.selectedTokenKey === CUSTOM_TOKEN_KEY) {
            setCustomTokenAddress(initialData.tokenAddress || '')
            setCustomTokenSymbol(initialData.tokenSymbol || '')
            setCustomTokenDecimals(initialData.tokenDecimals?.toString() || '')
        } else if (initialData?.selectedTokenKey && PREDEFINED_TOKENS[initialData.selectedTokenKey]) {
            // If a predefined token was initially set, ensure custom fields are cleared
            setCustomTokenAddress('')
            setCustomTokenSymbol('')
            setCustomTokenDecimals('')
        }
    }, [initialData])

    const handleTokenSelectionChange = (key: string) => {
        setSelectedTokenKey(key)
        if (key !== CUSTOM_TOKEN_KEY) {
            // Clear custom fields when a predefined token is selected
            setCustomTokenAddress('')
            setCustomTokenSymbol('')
            setCustomTokenDecimals('')
        }
    }

    const handleSubmit = () => {
        const depositAmountNum = parseFloat(depositAmount)
        const maxEntriesNum = parseFloat(maxEntries)
        const winnerCountNum = parseInt(winnerCount, 10)
        const amountPerWinnerNum = parseFloat(amountPerWinner)

        let finalTokenAddress = ''
        let finalTokenSymbol = ''
        let finalTokenDecimalsNum = NaN

        if (selectedTokenKey === CUSTOM_TOKEN_KEY) {
            finalTokenAddress = customTokenAddress.trim()
            finalTokenSymbol = customTokenSymbol.trim()
            finalTokenDecimalsNum = parseInt(customTokenDecimals, 10)
        } else if (PREDEFINED_TOKENS[selectedTokenKey]) {
            const predefined = PREDEFINED_TOKENS[selectedTokenKey]
            finalTokenAddress = predefined.address
            finalTokenSymbol = predefined.symbol
            finalTokenDecimalsNum = predefined.decimals
        }

        if (
            !isNaN(depositAmountNum) &&
            depositAmountNum > 0 &&
            !isNaN(maxEntriesNum) &&
            maxEntriesNum > 0 &&
            rulesLink.trim() &&
            finalTokenAddress && // Basic check for address
            finalTokenSymbol && // Basic check for symbol
            !isNaN(finalTokenDecimalsNum) &&
            finalTokenDecimalsNum >= 0 &&
            !isNaN(winnerCountNum) &&
            winnerCountNum > 0 &&
            !isNaN(amountPerWinnerNum) &&
            amountPerWinnerNum > 0
        ) {
            onNext({
                depositAmount: depositAmountNum,
                maxEntries: maxEntriesNum,
                rulesLink,
                tokenAddress: finalTokenAddress,
                tokenSymbol: finalTokenSymbol,
                tokenDecimals: finalTokenDecimalsNum,
                winnerCount: winnerCountNum,
                amountPerWinner: amountPerWinnerNum,
                selectedTokenKey: selectedTokenKey,
            })
        }
    }

    const isFormValid = () => {
        const depositAmountNum = parseFloat(depositAmount)
        const maxEntriesNum = parseFloat(maxEntries)
        const winnerCountNum = parseInt(winnerCount, 10)
        const amountPerWinnerNum = parseFloat(amountPerWinner)

        let currentTokenAddress = ''
        let currentTokenSymbol = ''
        let currentTokenDecimalsNum = NaN

        if (selectedTokenKey === CUSTOM_TOKEN_KEY) {
            currentTokenAddress = customTokenAddress.trim()
            currentTokenSymbol = customTokenSymbol.trim()
            currentTokenDecimalsNum = parseInt(customTokenDecimals, 10)
        } else if (PREDEFINED_TOKENS[selectedTokenKey]) {
            const predefined = PREDEFINED_TOKENS[selectedTokenKey]
            currentTokenAddress = predefined.address
            currentTokenSymbol = predefined.symbol
            currentTokenDecimalsNum = predefined.decimals
        }

        return (
            !isNaN(depositAmountNum) &&
            depositAmountNum > 0 &&
            !isNaN(maxEntriesNum) &&
            maxEntriesNum > 0 &&
            rulesLink.trim() !== '' &&
            currentTokenAddress.trim() !== '' && // Validate resolved address
            (selectedTokenKey !== CUSTOM_TOKEN_KEY || /^0x[a-fA-F0-9]{40}$/.test(currentTokenAddress)) && // Basic address format for custom
            currentTokenSymbol.trim() !== '' && // Validate resolved symbol
            !isNaN(currentTokenDecimalsNum) &&
            currentTokenDecimalsNum >= 0 &&
            currentTokenDecimalsNum <= 18 &&
            !isNaN(winnerCountNum) &&
            winnerCountNum > 0 &&
            !isNaN(amountPerWinnerNum) &&
            amountPerWinnerNum > 0
        )
    }

    return (
        <div className='mx-auto flex w-full max-w-md flex-col items-center p-4 sm:p-8'>
            <div className='mb-6 w-full'>
                <label htmlFor='depositAmount' className='mb-1 block text-center text-xl font-semibold text-gray-900'>
                    Deposit Amount (per entry)*
                </label>
                <p className='mb-3 text-center text-sm text-gray-500'>
                    Set the required token amount for one entry (e.g., 10 for 10 Tokens).
                </p>
                <input
                    id='depositAmount'
                    type='number'
                    value={depositAmount}
                    onChange={e => setDepositAmount(e.target.value)}
                    placeholder='e.g., 10'
                    className='w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500'
                />
            </div>

            <div className='mb-6 w-full'>
                <label htmlFor='tokenSelection' className='mb-1 block text-center text-xl font-semibold text-gray-900'>
                    Choose Token*
                </label>
                <select
                    id='tokenSelection'
                    value={selectedTokenKey}
                    onChange={e => handleTokenSelectionChange(e.target.value)}
                    className='w-full rounded-lg border border-gray-300 p-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500'>
                    {Object.entries(PREDEFINED_TOKENS).map(([key, token]) => (
                        <option key={key} value={key}>
                            {token.symbol}
                        </option>
                    ))}
                    <option value={CUSTOM_TOKEN_KEY}>Custom Token</option>
                </select>
            </div>

            {selectedTokenKey === CUSTOM_TOKEN_KEY && (
                <>
                    <div className='mb-6 w-full'>
                        <label
                            htmlFor='customTokenAddress'
                            className='mb-1 block text-center text-xl font-semibold text-gray-900'>
                            Custom Token Contract Address*
                        </label>
                        <input
                            id='customTokenAddress'
                            type='text'
                            value={customTokenAddress}
                            onChange={e => setCustomTokenAddress(e.target.value)}
                            placeholder='0x...'
                            className='w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500'
                        />
                    </div>
                    <div className='mb-6 w-full'>
                        <label
                            htmlFor='customTokenSymbol'
                            className='mb-1 block text-center text-xl font-semibold text-gray-900'>
                            Custom Token Symbol*
                        </label>
                        <input
                            id='customTokenSymbol'
                            type='text'
                            value={customTokenSymbol}
                            onChange={e => setCustomTokenSymbol(e.target.value)}
                            placeholder='e.g., MYT'
                            className='w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500'
                        />
                    </div>
                    <div className='mb-6 w-full'>
                        <label
                            htmlFor='customTokenDecimals'
                            className='mb-1 block text-center text-xl font-semibold text-gray-900'>
                            Custom Token Decimals*
                        </label>
                        <input
                            id='customTokenDecimals'
                            type='number'
                            value={customTokenDecimals}
                            onChange={e => setCustomTokenDecimals(e.target.value)}
                            placeholder='e.g., 18'
                            className='w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500'
                        />
                    </div>
                </>
            )}

            {selectedTokenKey !== CUSTOM_TOKEN_KEY && PREDEFINED_TOKENS[selectedTokenKey] && (
                <div className='mb-6 w-full rounded-md border border-gray-200 bg-gray-50 p-3'>
                    <p className='text-sm text-gray-600'>
                        Selected Token: {PREDEFINED_TOKENS[selectedTokenKey].symbol}
                    </p>
                    <p className='truncate text-xs text-gray-500'>
                        Address: {PREDEFINED_TOKENS[selectedTokenKey].address}
                    </p>
                    <p className='text-xs text-gray-500'>Decimals: {PREDEFINED_TOKENS[selectedTokenKey].decimals}</p>
                </div>
            )}

            <div className='mb-6 w-full'>
                <label htmlFor='winnerCount' className='mb-1 block text-center text-xl font-semibold text-gray-900'>
                    Number of Winners*
                </label>
                <p className='mb-3 text-center text-sm text-gray-500'>How many winners will the pool have?</p>
                <input
                    id='winnerCount'
                    type='number'
                    value={winnerCount}
                    onChange={e => setWinnerCount(e.target.value)}
                    placeholder='e.g., 1'
                    className='w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500'
                />
            </div>

            <div className='mb-6 w-full'>
                <label htmlFor='amountPerWinner' className='mb-1 block text-center text-xl font-semibold text-gray-900'>
                    Amount Per Winner*
                </label>
                <p className='mb-3 text-center text-sm text-gray-500'>
                    Set the token amount each winner will receive (e.g., 50 for 50 Tokens).
                </p>
                <input
                    id='amountPerWinner'
                    type='number'
                    value={amountPerWinner}
                    onChange={e => setAmountPerWinner(e.target.value)}
                    placeholder='e.g., 50'
                    className='w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500'
                />
            </div>

            <div className='mb-6 w-full'>
                <label htmlFor='maxEntries' className='mb-1 block text-center text-xl font-semibold text-gray-900'>
                    Max Entries (Soft Cap)*
                </label>
                <p className='mb-3 text-center text-sm text-gray-500'>Max number of paid entries allowed.</p>
                <input
                    id='maxEntries'
                    type='number'
                    value={maxEntries}
                    onChange={e => setMaxEntries(e.target.value)}
                    placeholder='e.g., 100'
                    className='w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500'
                />
            </div>

            <div className='mb-8 w-full'>
                <label htmlFor='rulesLink' className='mb-1 block text-center text-xl font-semibold text-gray-900'>
                    Link To Rules, Terms, and Conditions*
                </label>
                <p className='mb-3 text-center text-sm text-gray-500'>Paste a link to your rules.</p>
                <input
                    id='rulesLink'
                    type='url'
                    value={rulesLink}
                    onChange={e => setRulesLink(e.target.value)}
                    placeholder='https://example.com/rules'
                    className='w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500'
                />
            </div>

            <div className='flex w-full flex-col gap-4 sm:flex-row'>
                {onBack && (
                    <button
                        onClick={onBack}
                        className='w-full rounded-lg bg-gray-200 px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-300'>
                        Back
                    </button>
                )}
                <button
                    onClick={handleSubmit}
                    disabled={!isFormValid()}
                    className='w-full rounded-lg bg-blue-500 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300'>
                    Next: Review Pool
                </button>
            </div>
        </div>
    )
}
