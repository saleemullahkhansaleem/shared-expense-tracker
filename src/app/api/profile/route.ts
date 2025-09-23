import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // For now, we'll get all users. In a real app, you'd get the logged-in user from session
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        contributions: {
          select: {
            id: true,
            amount: true,
            month: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        expenses: {
          select: {
            id: true,
            title: true,
            category: true,
            amount: true,
            date: true,
            paymentSource: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            contributions: true,
            expenses: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Calculate financial summaries for each user
    const usersWithSummaries = users.map(user => {
      const totalContributions = user.contributions.reduce((sum, c) => sum + c.amount, 0)
      const totalExpenses = user.expenses.reduce((sum, e) => sum + e.amount, 0)
      const currentBalance = totalContributions - totalExpenses

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        totalContributions,
        totalExpenses,
        currentBalance,
        contributions: user.contributions,
        expenses: user.expenses,
        _count: user._count
      }
    })

    return NextResponse.json(usersWithSummaries)
  } catch (error) {
    console.error('Error fetching user profiles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user profiles' },
      { status: 500 }
    )
  }
}
