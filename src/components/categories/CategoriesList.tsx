'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PencilIcon, TrashIcon, PlusIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline'
import { TagIcon } from 'lucide-react'

interface Category {
    id: string
    name: string
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export function CategoriesList() {
    const [categories, setCategories] = useState<Category[]>([])
    console.log('categories', categories)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState('')
    const [isAdding, setIsAdding] = useState(false)
    const [newName, setNewName] = useState('')

    const fetchCategories = useCallback(async () => {
        try {
            setIsLoading(true)
            setError('')
            const response = await fetch('/api/categories', {
                credentials: 'include',
                cache: 'no-store',
            })

            const data = await response.json()

            // Handle different response formats
            if (Array.isArray(data)) {
                // Success: data is an array of categories
                setCategories(data)
            } else if (data.categories && Array.isArray(data.categories)) {
                // Error case: API returned object with categories array
                setCategories(data.categories)
                if (data.error) {
                    setError(data.error)
                }
            } else if (data.error) {
                // Error case: API returned error message
                setError(data.error)
                setCategories([])
            } else {
                // Fallback
                setCategories([])
            }

            // Also check response status for non-200 errors
            if (!response.ok && !data.categories) {
                throw new Error(data.error || 'Failed to fetch categories')
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load categories')
            setCategories([])
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchCategories()
    }, [fetchCategories])

    const handleAdd = async () => {
        if (!newName.trim()) {
            setError('Category name is required')
            return
        }

        try {
            setError('')
            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name: newName.trim() }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to create category')
            }

            setNewName('')
            setIsAdding(false)
            await fetchCategories()
        } catch (err: any) {
            setError(err.message || 'Failed to create category')
        }
    }

    const handleEdit = (category: Category) => {
        setEditingId(category.id)
        setEditName(category.name)
    }

    const handleSaveEdit = async (id: string) => {
        if (!editName.trim()) {
            setError('Category name is required')
            return
        }

        try {
            setError('')
            const response = await fetch(`/api/categories/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name: editName.trim() }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to update category')
            }

            setEditingId(null)
            setEditName('')
            await fetchCategories()
        } catch (err: any) {
            setError(err.message || 'Failed to update category')
        }
    }

    const handleCancelEdit = () => {
        setEditingId(null)
        setEditName('')
    }

    const handleToggleActive = async (category: Category) => {
        try {
            setError('')
            const response = await fetch(`/api/categories/${category.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ isActive: !category.isActive }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to update category')
            }

            await fetchCategories()
        } catch (err: any) {
            setError(err.message || 'Failed to update category')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to deactivate this category? It will be hidden from new expenses.')) {
            return
        }

        try {
            setError('')
            const response = await fetch(`/api/categories/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to delete category')
            }

            await fetchCategories()
        } catch (err: any) {
            setError(err.message || 'Failed to delete category')
        }
    }

    if (isLoading) {
        return (
            <Card>
                <CardContent className="py-8">
                    <div className="text-center text-gray-500">Loading categories...</div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="rounded-md bg-red-50 p-4">
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Categories</CardTitle>
                            <CardDescription>
                                Manage expense categories. Deactivated categories won't appear in expense forms.
                            </CardDescription>
                        </div>
                        <Button
                            onClick={() => {
                                setIsAdding(true)
                                setNewName('')
                                setError('')
                            }}
                            className="flex items-center gap-2"
                        >
                            <PlusIcon className="h-4 w-4" />
                            Add Category
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isAdding && (
                        <div className="mb-4 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <Input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Category name"
                                className="flex-1"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleAdd()
                                    } else if (e.key === 'Escape') {
                                        setIsAdding(false)
                                        setNewName('')
                                    }
                                }}
                                autoFocus
                            />
                            <Button onClick={handleAdd} size="sm" variant="default">
                                <CheckIcon className="h-4 w-4" />
                            </Button>
                            <Button
                                onClick={() => {
                                    setIsAdding(false)
                                    setNewName('')
                                }}
                                size="sm"
                                variant="outline"
                            >
                                <XMarkIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    {categories.length === 0 ? (
                        <div className="py-8 text-center text-gray-500">
                            <TagIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p>No categories found. Add your first category to get started.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {categories.map((category) => (
                                <div
                                    key={category.id}
                                    className={`flex items-center justify-between rounded-lg border p-4 ${category.isActive
                                        ? 'border-gray-200 bg-white'
                                        : 'border-gray-100 bg-gray-50 opacity-60'
                                        }`}
                                >
                                    {editingId === category.id ? (
                                        <div className="flex flex-1 items-center gap-2">
                                            <Input
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="flex-1"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleSaveEdit(category.id)
                                                    } else if (e.key === 'Escape') {
                                                        handleCancelEdit()
                                                    }
                                                }}
                                                autoFocus
                                            />
                                            <Button
                                                onClick={() => handleSaveEdit(category.id)}
                                                size="sm"
                                                variant="default"
                                            >
                                                <CheckIcon className="h-4 w-4" />
                                            </Button>
                                            <Button onClick={handleCancelEdit} size="sm" variant="outline">
                                                <XMarkIcon className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-3">
                                                <TagIcon className="h-5 w-5 text-gray-400" />
                                                <div>
                                                    <p className="font-medium text-gray-900">{category.name}</p>
                                                    {!category.isActive && (
                                                        <p className="text-xs text-gray-500">Inactive</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    onClick={() => handleToggleActive(category)}
                                                    size="sm"
                                                    variant="outline"
                                                    title={category.isActive ? 'Deactivate' : 'Activate'}
                                                >
                                                    {category.isActive ? 'Deactivate' : 'Activate'}
                                                </Button>
                                                <Button
                                                    onClick={() => handleEdit(category)}
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    onClick={() => handleDelete(category.id)}
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

