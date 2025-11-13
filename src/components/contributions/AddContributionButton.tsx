'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PlusIcon } from '@heroicons/react/24/outline'
import { AddContributionModal } from './AddContributionModal'

interface AddContributionButtonProps {
    onSuccess?: () => void
    groupId?: string
    groupName?: string
    members?: Array<{ id: string; name: string }>
    disabled?: boolean
}

export function AddContributionButton({ onSuccess, groupId, groupName, members, disabled }: AddContributionButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            <Button variant="outline" onClick={() => setIsModalOpen(true)} disabled={disabled}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Contribution
            </Button>

            <AddContributionModal
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
