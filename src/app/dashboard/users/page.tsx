import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { AdminUserManagement } from '@/components/admin/AdminUserManagement'

export default async function AdminUsersPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect('/auth/signin')
    }

    if ((session.user as any)?.role !== 'ADMIN') {
        redirect('/dashboard')
    }

    return <AdminUserManagement />
}

