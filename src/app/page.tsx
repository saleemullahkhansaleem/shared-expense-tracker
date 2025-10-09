import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function HomePage() {
    const session = await getServerSession(authOptions)

    if (session) {
        redirect('/groups')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="max-w-4xl mx-auto text-center px-6">
                <h1 className="text-5xl font-bold text-gray-900 mb-6">
                    Shared Expense Tracker
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                    Manage monthly contributions, expenses, and settlements with your friends.
                    Keep track of shared finances in one place.
                </p>
                <div className="space-x-4">
                    <a
                        href="/auth/signin"
                        className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Sign In
                    </a>
                    <a
                        href="/auth/signup"
                        className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors"
                    >
                        Sign Up
                    </a>
                </div>

                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-3">Track Contributions</h3>
                        <p className="text-gray-600">Monitor monthly contributions from all members</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-3">Manage Expenses</h3>
                        <p className="text-gray-600">Record and categorize all shared expenses</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-3">Smart Settlements</h3>
                        <p className="text-gray-600">Automatically calculate who owes what to whom</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
