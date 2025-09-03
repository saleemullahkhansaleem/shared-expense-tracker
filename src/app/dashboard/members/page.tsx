import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { MembersList } from '@/components/members/MembersList'

export default async function MembersPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect('/auth/signin')
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Members</h1>
                <p className="text-gray-600">Manage group members and their roles</p>
            </div>

            <MembersList />
        </div>
    )
}
