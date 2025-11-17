import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { CategoriesList } from '@/components/categories/CategoriesList'

export default async function CategoriesPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect('/auth/signin')
    }

    const userRole = (session.user as any)?.role
    if (userRole !== 'ADMIN') {
        redirect('/dashboard')
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Expense Categories</h1>
                <p className="text-gray-600">Manage expense categories for the application</p>
            </div>

            <CategoriesList />
        </div>
    )
}

