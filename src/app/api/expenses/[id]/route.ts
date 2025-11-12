import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const actorId = (session.user as any)?.id as string | undefined

    const { id } = params
    const body = await request.json()
    const { title, category, amount, date, paymentSource, userId, groupId } = body

    if (!groupId) {
      return NextResponse.json({ error: 'groupId is required' }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const expense = await prisma.expense.findUnique({
      where: { id },
      select: {
        userId: true,
        groupId: true,
      },
    })

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    const expenseGroupId = expense.groupId

    if (!expenseGroupId) {
      return NextResponse.json(
        { error: 'Expense is not associated with a group' },
        { status: 400 }
      )
    }

    let hasPermission = expense.userId === actorId

    if (!hasPermission && actorId) {
      const actorMembership = await prisma.groupMember.findFirst({
        where: {
          groupId: expenseGroupId,
          userId: actorId,
          role: 'ADMIN',
        },
      })
      hasPermission = !!actorMembership
    }

    if (!hasPermission) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId,
      },
    })

    if (!membership) {
      return NextResponse.json({ error: 'User is not a member of this group' }, { status: 403 })
    }

    const parsedAmount = typeof amount === 'number' ? amount : parseFloat(amount)

    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: {
        title,
        category,
        amount: parsedAmount,
        date: new Date(date),
        paymentSource,
        userId,
        groupId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(updatedExpense)
  } catch (error) {
    console.error('Error updating expense:', error)
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const actorId = (session.user as any)?.id as string | undefined

    const { id } = params

    const expense = await prisma.expense.findUnique({
      where: { id },
      select: {
        userId: true,
        groupId: true,
      },
    })

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    const expenseGroupId = expense.groupId

    if (!expenseGroupId) {
      return NextResponse.json(
        { error: 'Expense is not associated with a group' },
        { status: 400 }
      )
    }

    let hasPermission = expense.userId === actorId

    if (!hasPermission && actorId) {
      const actorMembership = await prisma.groupMember.findFirst({
        where: {
          groupId: expenseGroupId,
          userId: actorId,
          role: 'ADMIN',
        },
      })
      hasPermission = !!actorMembership
    }

    if (!hasPermission) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    await prisma.expense.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Expense deleted successfully' })
  } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    )
  }
}
