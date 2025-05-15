import { BlockchainErrorType, parseBlockchainError, type BlockchainError } from '../error-handling'

describe('parseBlockchainError', () => {
    it('should return UNKNOWN for null input', () => {
        const result = parseBlockchainError(null)
        expect(result.type).toBe(BlockchainErrorType.UNKNOWN)
        expect(result.message).toBe('An unknown error occurred')
        expect(result.suggestion).toBe('Please try again later')
        expect(result.originalError).toBeNull()
    })

    it('should return UNKNOWN for undefined input', () => {
        const result = parseBlockchainError(undefined)
        expect(result.type).toBe(BlockchainErrorType.UNKNOWN)
        expect(result.message).toBe('An unknown error occurred')
        expect(result.suggestion).toBe('Please try again later')
        expect(result.originalError).toBeUndefined()
    })

    it('should identify REJECTED_BY_USER by code 4001', () => {
        const error: BlockchainError = { code: 4001, message: 'User rejected the request.' }
        const result = parseBlockchainError(error)
        expect(result.type).toBe(BlockchainErrorType.REJECTED_BY_USER)
        expect(result.message).toBe('Transaction was rejected')
        expect(result.suggestion).toBe('You need to confirm the transaction in your wallet to proceed')
        expect(result.originalError).toBe(error)
    })

    it('should identify REJECTED_BY_USER by message "User denied"', () => {
        const error: BlockchainError = { message: 'User denied transaction signature.' }
        const result = parseBlockchainError(error)
        expect(result.type).toBe(BlockchainErrorType.REJECTED_BY_USER)
    })

    it('should identify REJECTED_BY_USER by message "User rejected"', () => {
        const error: BlockchainError = { message: 'User rejected the transaction' }
        const result = parseBlockchainError(error)
        expect(result.type).toBe(BlockchainErrorType.REJECTED_BY_USER)
    })

    it('should identify INSUFFICIENT_FUNDS by code -32000', () => {
        const error: BlockchainError = { code: -32000, message: 'Insufficient funds for gas * price + value' }
        const result = parseBlockchainError(error)
        expect(result.type).toBe(BlockchainErrorType.INSUFFICIENT_FUNDS)
        expect(result.message).toBe('Insufficient funds for transaction')
        expect(result.suggestion).toBe('Please add more funds to your wallet to cover the transaction cost')
    })

    it('should identify INSUFFICIENT_FUNDS by message "insufficient funds"', () => {
        const error: BlockchainError = { message: "sender doesn't have enough funds to send tx" }
        const result = parseBlockchainError(error)
        expect(result.type).toBe(BlockchainErrorType.INSUFFICIENT_FUNDS)
    })

    it('should identify GAS_PRICE_TOO_LOW by message "gas price"', () => {
        const error: BlockchainError = { message: 'gas price too low' }
        const result = parseBlockchainError(error)
        expect(result.type).toBe(BlockchainErrorType.GAS_PRICE_TOO_LOW)
        expect(result.message).toBe('Gas price too low')
        expect(result.suggestion).toBe('Try increasing the gas price or wait for network congestion to decrease')
    })

    it('should identify CONTRACT_ERROR by message "execution reverted"', () => {
        const error: BlockchainError = { message: 'execution reverted: ERC20: transfer amount exceeds balance' }
        const result = parseBlockchainError(error)
        expect(result.type).toBe(BlockchainErrorType.CONTRACT_ERROR)
        expect(result.message).toBe('Smart contract error')
        expect(result.suggestion).toBe('The transaction was rejected by the smart contract. Please check your inputs.')
    })

    it('should identify NETWORK_ERROR by message "network"', () => {
        const error: BlockchainError = { message: 'network error' }
        const result = parseBlockchainError(error)
        expect(result.type).toBe(BlockchainErrorType.NETWORK_ERROR)
        expect(result.message).toBe('Network connection error')
        expect(result.suggestion).toBe('Please check your internet connection and try again')
    })

    it('should identify NETWORK_ERROR by message "connection"', () => {
        const error: BlockchainError = { message: 'connection refused' }
        const result = parseBlockchainError(error)
        expect(result.type).toBe(BlockchainErrorType.NETWORK_ERROR)
    })

    it('should return UNKNOWN for a generic error object', () => {
        const error: BlockchainError = { message: 'Something else went wrong' }
        const result = parseBlockchainError(error)
        expect(result.type).toBe(BlockchainErrorType.UNKNOWN)
        expect(result.message).toBe('An error occurred')
        expect(result.suggestion).toBe('Please try again or contact support if the issue persists')
    })

    it('should return UNKNOWN for an empty error object', () => {
        const error: BlockchainError = {}
        const result = parseBlockchainError(error)
        expect(result.type).toBe(BlockchainErrorType.UNKNOWN)
    })

    it('should prioritize REJECTED_BY_USER over other conditions if code 4001 is present', () => {
        const error: BlockchainError = { code: 4001, message: 'Insufficient funds but user rejected' }
        const result = parseBlockchainError(error)
        expect(result.type).toBe(BlockchainErrorType.REJECTED_BY_USER)
    })

    it('should prioritize INSUFFICIENT_FUNDS over other message conditions if code -32000 is present (after user rejection)', () => {
        const error: BlockchainError = { code: -32000, message: 'gas price too low but also insufficient funds' }
        const result = parseBlockchainError(error)
        expect(result.type).toBe(BlockchainErrorType.INSUFFICIENT_FUNDS)
    })
})
