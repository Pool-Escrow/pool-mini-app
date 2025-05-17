import '@testing-library/jest-dom'
// The import `import "@testing-library/jest-dom/vitest"` in vitest.d.ts handles extending expect
// import * as matchers from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Cleanup after each test
afterEach(() => {
    cleanup()
})
