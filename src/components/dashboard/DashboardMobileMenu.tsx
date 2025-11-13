'use client'

import { useEffect, useState } from 'react'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { XMarkIcon } from '@heroicons/react/24/outline'

export function DashboardMobileMenu() {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false)
            }
        }

        window.addEventListener('keydown', handleKeyDown)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen])

    useEffect(() => {
        if (typeof document === 'undefined') return
        document.body.style.overflow = isOpen ? 'hidden' : ''
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    return (
        <div className="md:hidden">
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
                <span className="sr-only">Open sidebar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/40"
                        onClick={() => setIsOpen(false)}
                        aria-hidden="true"
                    />
                    <div className="fixed inset-y-0 left-0 z-50 w-72 max-w-full bg-white shadow-xl">
                        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Expense Tracker</h2>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="rounded-md p-2 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <span className="sr-only">Close sidebar</span>
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="h-[calc(100vh-4rem)] overflow-y-auto px-4 pb-6">
                            <DashboardNav onNavigate={() => setIsOpen(false)} />
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

