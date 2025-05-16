// src/utils/error-handling.ts

/**
 * Represents a generic error structure that might be received from blockchain interaction libraries (e.g., Viem, Ethers).
 * This interface is used as the input for error parsing.
 */
export interface BlockchainError {
    code?: number
    message?: string
    [key: string]: unknown // Allow other properties like 'data', 'reason', etc.
}

/**
 * Enumerates the recognized types of blockchain errors after parsing.
 * This helps in categorizing errors for user feedback or specific UI handling.
 */
export enum BlockchainErrorType {
    REJECTED_BY_USER = 'rejected_by_user', // User explicitly rejected the transaction in their wallet.
    INSUFFICIENT_FUNDS = 'insufficient_funds', // User does not have enough funds for the transaction.
    GAS_PRICE_TOO_LOW = 'gas_price_too_low', // The specified gas price was too low for the network.
    CONTRACT_ERROR = 'contract_error', // The smart contract reverted the transaction (e.g., failed require).
    NETWORK_ERROR = 'network_error', // Issues with network connectivity or the RPC provider.
    UNKNOWN = 'unknown', // Any other error that doesn't fit the above categories.
}

/**
 * Output structure after parsing a BlockchainError.
 * Contains the classified error type, a user-friendly message, a suggested action,
 * and the original error object for further inspection if needed.
 */
export interface ParsedBlockchainError {
    type: BlockchainErrorType
    message: string
    suggestion: string
    originalError: BlockchainError | null | undefined
}

/**
 * Parses a raw error object from a blockchain interaction into a structured `ParsedBlockchainError`.
 *
 * It inspects the error's `code` and `message` properties to determine the `BlockchainErrorType`.
 * Provides a user-friendly message and a suggestion for each error type.
 *
 * Order of checks matters: For instance, a user rejection (code 4001) is checked before
 * an insufficient funds message, as the rejection is more specific.
 *
 * @param error The raw error object, which can be of type `BlockchainError`, null, or undefined.
 * @returns A `ParsedBlockchainError` object with classified type, message, suggestion, and the original error.
 */
export function parseBlockchainError(error: BlockchainError | null | undefined): ParsedBlockchainError {
    if (!error) {
        return {
            type: BlockchainErrorType.UNKNOWN,
            message: 'An unknown error occurred',
            suggestion: 'Please try again later',
            originalError: error,
        }
    }

    // User rejected transaction
    if (
        error.code === 4001 || // MetaMask
        error.message?.includes('User denied') ||
        error.message?.includes('User rejected')
    ) {
        return {
            type: BlockchainErrorType.REJECTED_BY_USER,
            message: 'Transaction was rejected',
            suggestion: 'You need to confirm the transaction in your wallet to proceed',
            originalError: error,
        }
    }

    // Insufficient funds
    if (error.code === -32000 || error.message?.includes('insufficient funds')) {
        return {
            type: BlockchainErrorType.INSUFFICIENT_FUNDS,
            message: 'Insufficient funds for transaction',
            suggestion: 'Please add more funds to your wallet to cover the transaction cost',
            originalError: error,
        }
    }

    // Gas price too low
    if (error.message?.includes('gas price')) {
        return {
            type: BlockchainErrorType.GAS_PRICE_TOO_LOW,
            message: 'Gas price too low',
            suggestion: 'Try increasing the gas price or wait for network congestion to decrease',
            originalError: error,
        }
    }

    // Contract error
    if (error.message?.includes('execution reverted')) {
        return {
            type: BlockchainErrorType.CONTRACT_ERROR,
            message: 'Smart contract error',
            suggestion: 'The transaction was rejected by the smart contract. Please check your inputs.',
            originalError: error,
        }
    }

    // Network error
    if (error.message?.includes('network') || error.message?.includes('connection')) {
        return {
            type: BlockchainErrorType.NETWORK_ERROR,
            message: 'Network connection error',
            suggestion: 'Please check your internet connection and try again',
            originalError: error,
        }
    }

    // Unknown error
    return {
        type: BlockchainErrorType.UNKNOWN,
        message: 'An error occurred',
        suggestion: 'Please try again or contact support if the issue persists',
        originalError: error,
    }
}

// Error notification component - This should be a React component,
// so it's better to define it in a .tsx file if it contains JSX.
// For now, keeping as a function that could be used to generate props for a UI component.
export interface BlockchainErrorMessageProps {
    type: BlockchainErrorType
    message: string
    suggestion: string
}

/**
 * A helper function that takes a raw blockchain error and returns props
 * suitable for a UI component that displays error messages.
 * It internally calls `parseBlockchainError`.
 *
 * @param error The raw blockchain error.
 * @returns An object with `type`, `message`, and `suggestion` for UI display.
 */
export function getBlockchainErrorMessageProps(error: BlockchainError | null | undefined): BlockchainErrorMessageProps {
    const parsedError = parseBlockchainError(error)
    return {
        type: parsedError.type,
        message: parsedError.message,
        suggestion: parsedError.suggestion,
    }
}

/*
  If you want a React component directly in this file (requires it to be .tsx and import React):
  import React from 'react';

  export function BlockchainErrorMessage({ error }: { error: BlockchainError | null | undefined }) {
    const parsedError = parseBlockchainError(error);

    return (
      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
        <h4 className="font-medium text-red-700">{parsedError.message}</h4>
        <p className="text-sm text-red-600">{parsedError.suggestion}</p>
      </div>
    );
  }
*/
