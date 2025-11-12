import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { GroupSelection } from '@/components/groups/GroupSelection'

export default async function DashboardGroupsPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect('/auth/signin')
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">My Groups</h1>
                <p className="text-gray-600">
                    View all the groups you belong to, create new ones, or join with an invite code.
                </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6">
                <GroupSelection />
            </div>
        </div>
    )
}

