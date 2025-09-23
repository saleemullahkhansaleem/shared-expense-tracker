import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: any = {}

    if (month && month !== 'All') {
      where.month = month
    }

    if (search) {
      where.user = {
        name: { contains: search, mode: 'insensitive' }
      }
    }

    const contributions = await prisma.contribution.findMany({
      where,
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
        createdAt: 'desc'
      }
    })

    // Filter by status on the application level since we don't have a status field
    let filteredContributions = contributions
    if (status && status !== 'All') {
      if (status === 'PAID') {
        filteredContributions = contributions.filter(c => c.amount > 0)
      } else if (status === 'PENDING') {
        filteredContributions = contributions.filter(c => c.amount === 0)
      }
    }

    return NextResponse.json(filteredContributions)
  } catch (error) {
    console.error('Error fetching contributions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contributions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, amount, month } = body

    const contribution = await prisma.contribution.create({
      data: {
        userId,
        amount: parseFloat(amount),
        month
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(contribution, { status: 201 })
  } catch (error) {
    console.error('Error creating contribution:', error)
    return NextResponse.json(
      { error: 'Failed to create contribution' },
      { status: 500 }
    )
  }
}
