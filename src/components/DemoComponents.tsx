import { useNotification } from '@coinbase/onchainkit/minikit'
import type { TransactionError, TransactionResponse } from '@coinbase/onchainkit/transaction'
import {
    Transaction,
    TransactionButton,
    TransactionStatus,
    TransactionStatusAction,
    TransactionStatusLabel,
    TransactionToast,
    TransactionToastAction,
    TransactionToastIcon,
    TransactionToastLabel,
} from '@coinbase/onchainkit/transaction'
import { forwardRef, type ReactNode, useCallback, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'

interface ButtonProps {
    children: ReactNode
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    className?: string
    onClick?: () => void
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
    icon?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            children,
            variant = 'primary',
            size = 'md',
            className = '',
            onClick,
            disabled = false,
            type = 'button',
            icon,
        },
        ref,
    ) => {
        const baseClasses =
            'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0052FF] disabled:opacity-50 disabled:pointer-events-none'

        const variantClasses = {
            primary: 'bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-[var(--app-background)]',
            secondary: 'bg-[var(--app-gray)] hover:bg-[var(--app-gray-dark)] text-[var(--app-foreground)]',
            outline: 'border border-[var(--app-accent)] hover:bg-[var(--app-accent-light)] text-[var(--app-accent)]',
            ghost: 'hover:bg-[var(--app-accent-light)] text-[var(--app-foreground-muted)]',
        }

        const sizeClasses = {
            sm: 'text-xs px-2.5 py-1.5 rounded-md',
            md: 'text-sm px-4 py-2 rounded-lg',
            lg: 'text-base px-6 py-3 rounded-lg',
        }

        return (
            <button
                ref={ref}
                type={type}
                className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
                onClick={onClick}
                disabled={disabled}>
                {icon && <span className='mr-2 flex items-center'>{icon}</span>}
                {children}
            </button>
        )
    },
)

Button.displayName = 'Button'

interface CardProps {
    title?: string
    children: ReactNode
    className?: string
    onClick?: () => void
}

function Card({ title, children, className = '', onClick }: CardProps) {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            onClick()
        }
    }

    return (
        <div
            className={`overflow-hidden rounded-xl border border-[var(--app-card-border)] bg-[var(--app-card-bg)] shadow-lg backdrop-blur-md transition-all hover:shadow-xl ${className} ${onClick ? 'cursor-pointer' : ''}`}
            onClick={onClick}
            onKeyDown={onClick ? handleKeyDown : undefined}
            tabIndex={onClick ? 0 : undefined}
            role={onClick ? 'button' : undefined}>
            {title && (
                <div className='border-b border-[var(--app-card-border)] px-5 py-3'>
                    <h3 className='text-lg font-medium text-[var(--app-foreground)]'>{title}</h3>
                </div>
            )}
            <div className='p-5'>{children}</div>
        </div>
    )
}

interface FeaturesProps {
    setActiveTab: (tab: string) => void
}

export function Features({ setActiveTab }: FeaturesProps) {
    return (
        <div className='animate-fade-in space-y-6'>
            <Card title='Key Features'>
                <ul className='mb-4 space-y-3'>
                    <li className='flex items-start'>
                        <Icon name='check' className='mt-1 mr-2 text-[var(--app-accent)]' />
                        <span className='text-[var(--app-foreground-muted)]'>Minimalistic and beautiful UI design</span>
                    </li>
                    <li className='flex items-start'>
                        <Icon name='check' className='mt-1 mr-2 text-[var(--app-accent)]' />
                        <span className='text-[var(--app-foreground-muted)]'>Responsive layout for all devices</span>
                    </li>
                    <li className='flex items-start'>
                        <Icon name='check' className='mt-1 mr-2 text-[var(--app-accent)]' />
                        <span className='text-[var(--app-foreground-muted)]'>Dark mode support</span>
                    </li>
                    <li className='flex items-start'>
                        <Icon name='check' className='mt-1 mr-2 text-[var(--app-accent)]' />
                        <span className='text-[var(--app-foreground-muted)]'>OnchainKit integration</span>
                    </li>
                </ul>
                <Button variant='outline' onClick={() => setActiveTab('home')}>
                    Back to Home
                </Button>
            </Card>
        </div>
    )
}

interface HomeProps {
    setActiveTab: (tab: string) => void
}

export function Home({ setActiveTab }: HomeProps) {
    return (
        <div className='animate-fade-in space-y-6'>
            <Card title='My First Mini App'>
                <p className='mb-4 text-[var(--app-foreground-muted)]'>
                    This is a minimalistic Mini App built with OnchainKit components.
                </p>
                <Button onClick={() => setActiveTab('features')} icon={<Icon name='arrow-right' size='sm' />}>
                    Explore Features
                </Button>
            </Card>

            <TodoList />

            <TransactionCard />
        </div>
    )
}

interface IconProps {
    name: 'heart' | 'star' | 'check' | 'plus' | 'arrow-right'
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export function Icon({ name, size = 'md', className = '' }: IconProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    }

    const icons = {
        'heart': (
            <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                aria-hidden='true'>
                <title>Heart</title>
                <path d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' />
            </svg>
        ),
        'star': (
            <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                aria-hidden='true'>
                <title>Star</title>
                <polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' />
            </svg>
        ),
        'check': (
            <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                aria-hidden='true'>
                <title>Check</title>
                <polyline points='20 6 9 17 4 12' />
            </svg>
        ),
        'plus': (
            <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                aria-hidden='true'>
                <title>Plus</title>
                <line x1='12' y1='5' x2='12' y2='19' />
                <line x1='5' y1='12' x2='19' y2='12' />
            </svg>
        ),
        'arrow-right': (
            <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                aria-hidden='true'>
                <title>Arrow Right</title>
                <line x1='5' y1='12' x2='19' y2='12' />
                <polyline points='12 5 19 12 12 19' />
            </svg>
        ),
    }

    return <span className={`inline-block ${sizeClasses[size]} ${className}`}>{icons[name]}</span>
}

interface Todo {
    id: number
    text: string
    completed: boolean
}

function TodoList() {
    const [todos, setTodos] = useState<Todo[]>([
        { id: 1, text: 'Learn about MiniKit', completed: false },
        { id: 2, text: 'Build a Mini App', completed: true },
        { id: 3, text: 'Deploy to Base and go viral', completed: false },
    ])
    const [newTodo, setNewTodo] = useState('')

    const addTodo = () => {
        if (newTodo.trim() === '') return

        const newId = todos.length > 0 ? Math.max(...todos.map(t => t.id)) + 1 : 1
        setTodos([...todos, { id: newId, text: newTodo, completed: false }])
        setNewTodo('')
    }

    const toggleTodo = (id: number) => {
        setTodos(todos.map(todo => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)))
    }

    const deleteTodo = (id: number) => {
        setTodos(todos.filter(todo => todo.id !== id))
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            addTodo()
        }
    }

    return (
        <Card title='Get started'>
            <div className='space-y-4'>
                <div className='flex items-center space-x-2'>
                    <input
                        type='text'
                        value={newTodo}
                        onChange={e => setNewTodo(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder='Add a new task...'
                        className='flex-1 rounded-lg border border-[var(--app-card-border)] bg-[var(--app-card-bg)] px-3 py-2 text-[var(--app-foreground)] placeholder-[var(--app-foreground-muted)] focus:ring-1 focus:ring-[var(--app-accent)] focus:outline-none'
                    />
                    <Button variant='primary' size='md' onClick={addTodo} icon={<Icon name='plus' size='sm' />}>
                        Add
                    </Button>
                </div>

                <ul className='space-y-2'>
                    {todos.map(todo => (
                        <li key={todo.id} className='flex items-center justify-between'>
                            <div className='flex items-center space-x-2'>
                                <button
                                    type='button'
                                    id={`todo-${todo.id}`}
                                    onClick={() => toggleTodo(todo.id)}
                                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                        todo.completed
                                            ? 'border-[var(--app-accent)] bg-[var(--app-accent)]'
                                            : 'border-[var(--app-foreground-muted)] bg-transparent'
                                    }`}>
                                    {todo.completed && (
                                        <Icon name='check' size='sm' className='text-[var(--app-background)]' />
                                    )}
                                </button>
                                <label
                                    htmlFor={`todo-${todo.id}`}
                                    className={`cursor-pointer text-[var(--app-foreground-muted)] ${todo.completed ? 'line-through opacity-70' : ''}`}>
                                    {todo.text}
                                </label>
                            </div>
                            <button
                                type='button'
                                onClick={() => deleteTodo(todo.id)}
                                className='text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)]'>
                                ×
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </Card>
    )
}

function TransactionCard() {
    const { address } = useAccount()

    // Example transaction call - sending 0 ETH to self
    const calls = useMemo(
        () =>
            address
                ? [
                      {
                          to: address,
                          data: '0x' as `0x${string}`,
                          value: BigInt(0),
                      },
                  ]
                : [],
        [address],
    )

    const sendNotification = useNotification()

    const handleSuccess = useCallback(
        async (response: TransactionResponse) => {
            const transactionHash = response.transactionReceipts[0].transactionHash

            console.log(`Transaction successful: ${transactionHash}`)

            await sendNotification({
                title: 'Congratulations!',
                body: `You sent your a transaction, ${transactionHash}!`,
            })
        },
        [sendNotification],
    )

    return (
        <Card title='Make Your First Transaction'>
            <div className='space-y-4'>
                <p className='mb-4 text-[var(--app-foreground-muted)]'>
                    Experience the power of seamless sponsored transactions with{' '}
                    <a
                        href='https://onchainkit.xyz'
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-[#0052FF] hover:underline'>
                        OnchainKit
                    </a>
                    .
                </p>

                <div className='flex flex-col items-center'>
                    {address ? (
                        <Transaction
                            calls={calls}
                            onSuccess={response => void handleSuccess(response)}
                            onError={(error: TransactionError) => console.error('Transaction failed:', error)}>
                            <TransactionButton className='text-md text-white' />
                            <TransactionStatus>
                                <TransactionStatusAction />
                                <TransactionStatusLabel />
                            </TransactionStatus>
                            <TransactionToast className='mb-4'>
                                <TransactionToastIcon />
                                <TransactionToastLabel />
                                <TransactionToastAction />
                            </TransactionToast>
                        </Transaction>
                    ) : (
                        <p className='mt-2 text-center text-sm text-yellow-400'>
                            Connect your wallet to send a transaction
                        </p>
                    )}
                </div>
            </div>
        </Card>
    )
}
