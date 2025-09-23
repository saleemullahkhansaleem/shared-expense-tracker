import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') || '2025-01'

    // Get current month's contributions
    const contributions = await prisma.contribution.findMany({
      where: { month },
      select: { amount: true }
    })

    // Get current month's expenses
    const expenses = await prisma.expense.findMany({
      where: {
        date: {
          gte: new Date(`${month}-01`),
          lt: new Date(`${month}-31`)
        }
      },
      select: { amount: true }
    })

    // Calculate totals
    const totalCollected = contributions.reduce((sum, c) => sum + c.amount, 0)
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    const remainingBalance = totalCollected - totalExpenses

    // Calculate days left in month
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()
    const daysLeft = Math.max(0, daysInMonth - now.getDate())

    // Calculate average daily spend
    const daysPassed = daysInMonth - daysLeft
    const averageDailySpend = daysPassed > 0 ? totalExpenses / daysPassed : 0

    // Check if balance is low (less than 10% of collected amount)
    const lowBalanceWarning = remainingBalance < (totalCollected * 0.1)

    // Get expense breakdown by category
    const expenseBreakdown = await prisma.expense.groupBy({
      by: ['category'],
      where: {
        date: {
          gte: new Date(`${month}-01`),
          lt: new Date(`${month}-31`)
        }
      },
      _sum: {
        amount: true
      }
    })

    // Get monthly data for the last 6 months
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      const monthContributions = await prisma.contribution.findMany({
        where: { month: monthStr },
        select: { amount: true }
      })

      const monthExpenses = await prisma.expense.findMany({
        where: {
          date: {
            gte: new Date(`${monthStr}-01`),
            lt: new Date(`${monthStr}-31`)
          }
        },
        select: { amount: true }
      })

      monthlyData.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        collected: monthContributions.reduce((sum, c) => sum + c.amount, 0),
        expenses: monthExpenses.reduce((sum, e) => sum + e.amount, 0)
      })
    }

    return NextResponse.json({
      totalCollected,
      totalExpenses,
      remainingBalance,
      daysLeft,
      averageDailySpend,
      lowBalanceWarning,
      expenseBreakdown: expenseBreakdown.map(item => ({
        name: item.category,
        value: item._sum.amount || 0
      })),
      monthlyData
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
