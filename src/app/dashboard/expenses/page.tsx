import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { ExpensesList } from '@/components/expenses/ExpensesList'
import { AddExpenseButton } from '@/components/expenses/AddExpenseButton'

export default async function ExpensesPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect('/auth/signin')
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Expenses</h1>
                    <p className="text-gray-600">Track all shared and personal expenses</p>
                </div>
                <AddExpenseButton />
            </div>

            <ExpensesList />
        </div>
    )
}
