import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { DashboardOverview } from '@/components/dashboard/DashboardOverview'
import { DashboardCharts } from '@/components/dashboard/DashboardCharts'
import { RecentExpenses } from '@/components/dashboard/RecentExpenses'

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect('/auth/signin')
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Overview of your shared expenses and contributions</p>
            </div>

            <DashboardOverview />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DashboardCharts />
                <RecentExpenses />
            </div>
        </div>
    )
}
