import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const userEmail = session.user?.email;

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: "Invalid session data" },
        { status: 401 }
      );
    }
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");

    // Get user profile and memberships separately
    const [user, memberships] = await Promise.all([
      prisma.user.findUnique({
        where: { email: userEmail },
        include: {
          contributions: {
            orderBy: { createdAt: "desc" },
          },
          expenses: {
            orderBy: { createdAt: "desc" },
          },
        },
      }),
      (prisma as any).groupMember.findMany({
        where: { userId: userId },
        include: {
          group: true,
        },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Filter contributions and expenses by group if groupId is provided
    const filteredContributions = groupId
      ? user.contributions.filter((c: any) => c.groupId === groupId)
      : user.contributions;

    const filteredExpenses = groupId
      ? user.expenses.filter((e: any) => e.groupId === groupId)
      : user.expenses;

    // Calculate financial summaries
    const totalContributions = filteredContributions.reduce(
      (sum: number, c: any) => sum + c.amount,
      0
    );
    const totalExpenses = filteredExpenses.reduce(
      (sum: number, e: any) => sum + e.amount,
      0
    );
    const currentBalance = totalContributions - totalExpenses;

    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      totalContributions,
      totalExpenses,
      currentBalance,
      contributions: filteredContributions,
      expenses: filteredExpenses,
      groups: memberships.map((membership: any) => membership.group),
      _count: {
        contributions: filteredContributions.length,
        expenses: filteredExpenses.length,
      },
    };

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}
