import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '5')

    const recentExpenses = await prisma.expense.findMany({
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json(recentExpenses)
  } catch (error) {
    console.error('Error fetching recent expenses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent expenses' },
      { status: 500 }
    )
  }
}
