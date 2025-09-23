import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const search = searchParams.get('search')

    const where: any = {}

    if (role && role !== 'All') {
      where.role = role
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    const members = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        contributions: {
          select: {
            amount: true
          }
        },
        expenses: {
          select: {
            amount: true
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

    // Calculate financial summaries for each member
    const membersWithSummaries = members.map(member => {
      const totalContributions = member.contributions.reduce((sum, c) => sum + c.amount, 0)
      const totalExpenses = member.expenses.reduce((sum, e) => sum + e.amount, 0)
      const currentBalance = totalContributions - totalExpenses

      return {
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        createdAt: member.createdAt,
        totalContributions,
        totalExpenses,
        currentBalance,
        _count: member._count
      }
    })

    return NextResponse.json(membersWithSummaries)
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    )
  }
}
