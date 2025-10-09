'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface JoinGroupModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function JoinGroupModal({ isOpen, onClose, onSuccess }: JoinGroupModalProps) {
    const [inviteCode, setInviteCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await fetch('/api/groups/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inviteCode: inviteCode.trim(),
                }),
            })

            if (response.ok) {
                const group = await response.json()
                setInviteCode('')
                onSuccess()
                alert(`Successfully joined "${group.name}"!`)
            } else {
                const errorData = await response.json()
                setError(errorData.error || 'Failed to join group')
            }
        } catch (error) {
            setError('Failed to join group')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Join Group</CardTitle>
                    <CardDescription>
                        Enter the invite code shared by your friend
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}

                        <div>
                            <Label htmlFor="inviteCode">Invite Code</Label>
                            <Input
                                id="inviteCode"
                                type="text"
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                placeholder="e.g., ABC123"
                                required
                                className="uppercase"
                                maxLength={6}
                            />
                            <p className="text-sm text-gray-600 mt-1">
                                Enter the 6-character code provided by your friend
                            </p>
                        </div>

                        <div className="flex space-x-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading || !inviteCode.trim()}
                                className="flex-1"
                            >
                                {loading ? 'Joining...' : 'Join Group'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
