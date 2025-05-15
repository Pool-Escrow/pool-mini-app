interface Eip1193Provider {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    on: (eventName: string, listener: (...args: any[]) => void) => void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    removeListener: (eventName: string, listener: (...args: any[]) => void) => void
    networkVersion?: string
    isMetaMask?: boolean
    // Add other common methods/properties if used, e.g., selectedAddress
}

declare global {
    interface Window {
        ethereum?: Eip1193Provider
    }
}

// This export {} is important to make this file a module
// and ensure the `declare global` works correctly.
export {}
