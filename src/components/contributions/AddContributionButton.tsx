'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PlusIcon } from '@heroicons/react/24/outline'
import { AddContributionModal } from './AddContributionModal'

export function AddContributionButton() {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            <Button onClick={() => setIsModalOpen(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Contribution
            </Button>

            <AddContributionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    )
}
