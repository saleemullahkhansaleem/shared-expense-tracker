import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { SettingsOverview } from '@/components/settings/SettingsOverview'

export default async function SettingsPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect('/auth/signin')
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
                <p className="text-gray-600">Manage app configuration and preferences</p>
            </div>

            <SettingsOverview />
        </div>
    )
}
