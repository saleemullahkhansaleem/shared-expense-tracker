'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PlusIcon } from '@heroicons/react/24/outline'
import { AddExpenseModal } from './AddExpenseModal'

interface AddExpenseButtonProps {
    onSuccess?: () => void
    groupId?: string
    groupName?: string
    members?: Array<{ id: string; name: string }>
}

export function AddExpenseButton({ onSuccess, groupId, groupName, members }: AddExpenseButtonProps) {
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
                onSuccess={onSuccess}
                groupId={groupId}
                groupName={groupName}
                members={members}
            />
        </>
    )
}
