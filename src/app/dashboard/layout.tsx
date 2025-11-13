import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { UserNav } from '@/components/dashboard/UserNav'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { DashboardMobileMenu } from '@/components/dashboard/DashboardMobileMenu'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect('/auth/signin')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex">
                {/* Sidebar */}
                <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
                    <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
                        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                            <div className="flex items-center flex-shrink-0 px-4">
                                <h1 className="text-xl font-semibold text-gray-900">
                                    Expense Tracker
                                </h1>
                            </div>
                            <DashboardNav />
                        </div>
                    </div>
                </div>

                {/* Main content */}
                <div className="md:pl-64 flex flex-col flex-1">
                    {/* Top navigation */}
                    <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
                    <div className="flex-1 px-4 flex items-center justify-between">
                        <DashboardMobileMenu />
                            <div className="ml-4 flex items-center md:ml-6">
                                <UserNav user={session?.user || {}} />
                            </div>
                        </div>
                    </div>

                    {/* Page content */}
                    <main className="flex-1">
                        <div className="py-6">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                                {children}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}
