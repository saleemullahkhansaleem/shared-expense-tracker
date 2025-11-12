'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface Group {
    id: string
    name: string
    description: string | null
    inviteCode: string
    monthlyAmount: number | null
}

interface GroupContextType {
    selectedGroup: Group | null
    setSelectedGroup: (group: Group | null) => void
    isLoading: boolean
}

const GroupContext = createContext<GroupContextType | undefined>(undefined)

export function GroupProvider({ children }: { children: React.ReactNode }) {
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const { data: session } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (session) {
            // Check if user has a selected group in localStorage
            const savedGroupId = localStorage.getItem('selectedGroupId')
            if (savedGroupId) {
                // Fetch group details
                fetchGroupDetails(savedGroupId)
            } else {
                // Redirect to group selection
                router.push('/dashboard/groups')
            }
        }
        setIsLoading(false)
    }, [session, router])

    const fetchGroupDetails = async (groupId: string) => {
        try {
            const response = await fetch(`/api/groups/${groupId}`)
            if (response.ok) {
                const group = await response.json()
                setSelectedGroup(group)
            } else {
                // Group not found or no access, redirect to group selection
                localStorage.removeItem('selectedGroupId')
                router.push('/dashboard/groups')
            }
        } catch (error) {
            console.error('Error fetching group:', error)
            localStorage.removeItem('selectedGroupId')
            router.push('/dashboard/groups')
        }
    }

    const handleSetSelectedGroup = (group: Group | null) => {
        setSelectedGroup(group)
        if (group) {
            localStorage.setItem('selectedGroupId', group.id)
        } else {
            localStorage.removeItem('selectedGroupId')
        }
    }

    return (
        <GroupContext.Provider
            value={{
                selectedGroup,
                setSelectedGroup: handleSetSelectedGroup,
                isLoading,
            }}
        >
            {children}
        </GroupContext.Provider>
    )
}

export function useGroup() {
    const context = useContext(GroupContext)
    if (context === undefined) {
        throw new Error('useGroup must be used within a GroupProvider')
    }
    return context
}
