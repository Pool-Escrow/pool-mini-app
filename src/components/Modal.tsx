import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    children: ReactNode
    title?: string
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null)

    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            // Prevent scrolling when modal is open
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.body.style.overflow = 'auto'
        }
    }, [isOpen, onClose])

    // Handle escape key press
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscKey)
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey)
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4 backdrop-blur-sm'>
            <div ref={modalRef} className='max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-xl'>
                {title && (
                    <div className='border-b border-gray-200 px-6 py-4'>
                        <h3 className='text-lg font-medium text-gray-900'>{title}</h3>
                        <button
                            type='button'
                            className='absolute top-4 right-4 text-gray-400 hover:text-gray-500'
                            onClick={onClose}>
                            <span className='sr-only'>Close</span>
                            <svg className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M6 18L18 6M6 6l12 12'
                                />
                            </svg>
                        </button>
                    </div>
                )}
                <div className={title ? '' : 'p-6'}>{children}</div>
            </div>
        </div>
    )
}
