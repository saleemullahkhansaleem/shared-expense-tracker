'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PlusIcon } from '@heroicons/react/24/outline'
import { AddExpenseModal } from './AddExpenseModal'

export function AddExpenseButton() {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            <Button onClick={() => setIsModalOpen(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Expense
            </Button>

            <AddExpenseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    )
}
