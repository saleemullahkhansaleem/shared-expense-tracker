import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { ContributionsList } from '@/components/contributions/ContributionsList'

export default async function ContributionsPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect('/auth/signin')
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Contributions</h1>
                <p className="text-gray-600">Track monthly contributions from all members</p>
            </div>

            <ContributionsList />
        </div>
    )
}
