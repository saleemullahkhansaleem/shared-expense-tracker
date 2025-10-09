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
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    if (!groupId) {
      return NextResponse.json(
        { error: "Group ID is required" },
        { status: 400 }
      );
    }

    // Check if user is a member of this group
    const membership = await prisma.groupMember.findFirst({
      where: {
        userId: userId,
        groupId: groupId,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this group" },
        { status: 403 }
      );
    }

    // Get all members of the group
    const groupMembers = await prisma.groupMember.findMany({
      where: {
        groupId: groupId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            contributions: {
              where: { groupId },
              select: {
                amount: true,
              },
            },
            expenses: {
              where: { groupId },
              select: {
                amount: true,
              },
            },
            _count: {
              select: {
                contributions: { where: { groupId } },
                expenses: { where: { groupId } },
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: "asc",
      },
    });

    // Filter by role if specified
    let filteredMembers = groupMembers;
    if (role && role !== "All") {
      filteredMembers = groupMembers.filter((member) => member.role === role);
    }

    // Filter by search if specified
    if (search) {
      filteredMembers = filteredMembers.filter(
        (member) =>
          member.user.name.toLowerCase().includes(search.toLowerCase()) ||
          member.user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Calculate financial summaries for each member
    const membersWithSummaries = filteredMembers.map((member) => {
      const totalContributions = member.user.contributions.reduce(
        (sum, c) => sum + c.amount,
        0
      );
      const totalExpenses = member.user.expenses.reduce(
        (sum, e) => sum + e.amount,
        0
      );
      const currentBalance = totalContributions - totalExpenses;

      return {
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        role: member.role, // Group role, not system role
        joinedAt: member.joinedAt,
        createdAt: member.user.createdAt,
        totalContributions,
        totalExpenses,
        currentBalance,
        _count: member.user._count,
      };
    });

    return NextResponse.json(membersWithSummaries);
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}
