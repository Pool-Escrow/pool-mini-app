import { createMockPool } from '@/utils/__tests__/test-utils'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import type { ImageProps } from 'next/image'
import type { DetailedHTMLProps, ImgHTMLAttributes } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { PoolCard } from '../PoolCard'

// Mock next/image
vi.mock('next/image', () => ({
    default: (props: Partial<ImageProps>) => {
        const imgProps: DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> = {
            ...props,
            alt: props.alt ?? '',
            src:
                typeof props.src === 'string'
                    ? props.src
                    : typeof props.src === 'object' && 'src' in props.src
                      ? props.src.src
                      : '',
        }
        // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
        return <img {...imgProps} />
    },
}))

// Mock next/link
vi.mock('next/link', () => ({
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href} data-testid='link'>
            {children}
        </a>
    ),
}))

describe('PoolCard', () => {
    it('renders basic pool information correctly', () => {
        const pool = createMockPool({
            name: 'Test Pool Name',
            description: 'Test Pool Description',
            onChainTokenSymbol: 'TEST',
            depositAmountPerPerson: 100,
            totalWinners: 5,
            amountPerWinner: 500,
        })
        render(<PoolCard pool={pool} />)

        // Test pool name
        expect(screen.getByText('Test Pool Name')).toBeInTheDocument()

        // Test pool description
        expect(screen.getByText('Test Pool Description')).toBeInTheDocument()

        // Test token symbol
        expect(screen.getByText('TEST')).toBeInTheDocument()

        // Test deposit amount
        expect(screen.getByText(/100/)).toBeInTheDocument()

        // Test winners count
        expect(screen.getByText(/5/)).toBeInTheDocument()

        // Test amount per winner
        expect(screen.getByText(/500/)).toBeInTheDocument()
    })

    it('displays correct status', () => {
        const pool = createMockPool({ status: 'active' })
        render(<PoolCard pool={pool} />)

        expect(screen.getByText(/active/i)).toBeInTheDocument()
    })

    it('links to the pool detail page', () => {
        const pool = createMockPool({ id: 'test-id' })
        render(<PoolCard pool={pool} />)

        const link = screen.getByTestId('link')
        expect(link).toHaveAttribute('href', '/test-id')
    })

    it('renders token information when available', () => {
        const pool = createMockPool({
            onChainTokenSymbol: 'TEST',
            tokenContractAddress: '0x1234567890123456789012345678901234567890',
        })
        render(<PoolCard pool={pool} />)

        expect(screen.getByText('TEST')).toBeDefined()
        expect(screen.getByText('0x1234...7890')).toBeDefined()
    })

    it('renders participant count when available', () => {
        const pool = createMockPool({
            participants: Array(5).fill({ address: '0x1234', joinedAt: Date.now() }),
        })
        render(<PoolCard pool={pool} />)

        expect(screen.getByText('Participants:')).toBeDefined()
        expect(screen.getByText('5')).toBeDefined()
    })

    it('renders total value locked when available', () => {
        const pool = createMockPool({
            depositAmountPerPerson: 200,
            onChainTokenSymbol: 'TEST',
            onChainTokenDecimals: 18,
        })
        render(<PoolCard pool={pool} />)

        expect(screen.getByText('Total Value Locked:')).toBeDefined()
        expect(screen.getByText(/200/)).toBeDefined()
    })

    it('renders creator information when showCreator is true', () => {
        const pool = createMockPool()
        const creatorName = 'Test Creator'
        const creatorAvatar = 'https://example.com/avatar.jpg'

        render(<PoolCard pool={pool} creatorName={creatorName} creatorAvatar={creatorAvatar} showCreator={true} />)

        expect(screen.getByText(creatorName)).toBeDefined()
        const avatarImg = screen.getByRole('img', { name: /creator avatar/i })
        expect(avatarImg).toHaveAttribute('src', creatorAvatar)
        expect(avatarImg).toHaveAttribute('alt', 'creator avatar')
    })

    it('does not render creator information when showCreator is false', () => {
        const pool = createMockPool()
        const creatorName = 'Test Creator'

        render(<PoolCard pool={pool} creatorName={creatorName} showCreator={false} />)

        expect(screen.queryByText(creatorName)).toBeNull()
    })

    it('renders blockchain explorer links when contract addresses are available', () => {
        const pool = createMockPool({
            id: '0x1234567890123456789012345678901234567890',
            tokenContractAddress: '0x0987654321098765432109876543210987654321',
            chainId: 8453, // Base mainnet
        })
        render(<PoolCard pool={pool} />)

        const links = screen.getAllByRole('link')
        expect(links.some(link => link.textContent?.includes('View Pool Contract'))).toBeTruthy()
        expect(links.some(link => link.textContent?.includes('View Token'))).toBeTruthy()
    })

    it('handles missing optional data gracefully', () => {
        const pool = createMockPool({
            description: undefined,
            onChainTokenSymbol: undefined,
            tokenContractAddress: undefined,
            participants: undefined,
        })
        render(<PoolCard pool={pool} />)

        expect(screen.getByText('No description provided.')).toBeInTheDocument()
        expect(screen.queryByText('Token:')).toBeNull()
        expect(screen.queryByText('Participants:')).toBeNull()
        expect(screen.queryByText('Total Value Locked:')).toBeNull()
    })
})
