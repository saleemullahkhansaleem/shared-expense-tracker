import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { ReportsOverview } from '@/components/reports/ReportsOverview'

export default async function ReportsPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect('/auth/signin')
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
                <p className="text-gray-600">Financial summaries and monthly reports</p>
            </div>

            <ReportsOverview />
        </div>
    )
}
