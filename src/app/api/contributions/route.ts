import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const groupId = searchParams.get("groupId");

    const where: any = {};

    if (month && month !== "All") {
      where.month = month;
    }

    if (groupId) {
      where.groupId = groupId;
    }

    if (search) {
      where.user = {
        name: { contains: search, mode: "insensitive" },
      };
    }

    const contributions = await prisma.contribution.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    let filteredContributions = contributions;
    if (status && status !== "All") {
      if (status === "PAID") {
        filteredContributions = contributions.filter((c) => c.amount > 0);
      } else if (status === "PENDING") {
        filteredContributions = contributions.filter((c) => c.amount === 0);
      }
    }

    return NextResponse.json(filteredContributions);
  } catch (error) {
    console.error("Error fetching contributions:", error);
    return NextResponse.json(
      { error: "Failed to fetch contributions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const actorId = (session.user as any)?.id as string | undefined;
    const actorRole = (session.user as any)?.role;

    const body = await request.json();
    const { userId, amount, month, groupId, notes } = body;

    if (!groupId) {
      return NextResponse.json(
        { error: "groupId is required" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    let hasPermission = actorRole === "ADMIN";

    if (!hasPermission && actorId) {
      const actorMembership = await prisma.groupMember.findFirst({
        where: {
          groupId,
          userId: actorId,
          role: "ADMIN",
        },
      });
      hasPermission = !!actorMembership;
    }

    if (!hasPermission) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "User is not a member of this group" },
        { status: 400 }
      );
    }

    const parsedAmount =
      typeof amount === "number" ? amount : parseFloat(amount);

    if (Number.isNaN(parsedAmount)) {
      return NextResponse.json(
        { error: "Amount must be a valid number" },
        { status: 400 }
      );
    }

    const trimmedNotes = typeof notes === "string" ? notes.trim() : "";

    const data: Prisma.ContributionUncheckedCreateInput = {
      userId,
      amount: parsedAmount,
      month,
      groupId,
    };

    const includeNotes = Object.prototype.hasOwnProperty.call(body, "notes");

    const contribution = await prisma.contribution.create({
      data,
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
    });

    if (includeNotes) {
      if (trimmedNotes.length > 0) {
        await prisma.$runCommandRaw({
          update: "contributions",
          updates: [
            {
              q: { _id: { $oid: contribution.id } },
              u: { $set: { notes: trimmedNotes } },
            },
          ],
        });
        (contribution as any).notes = trimmedNotes;
      } else {
        await prisma.$runCommandRaw({
          update: "contributions",
          updates: [
            {
              q: { _id: { $oid: contribution.id } },
              u: { $unset: { notes: "" } },
            },
          ],
        });
        (contribution as any).notes = null;
      }
    }

    return NextResponse.json(contribution, { status: 201 });
  } catch (error) {
    console.error("Error creating contribution:", error);
    return NextResponse.json(
      { error: "Failed to create contribution" },
      { status: 500 }
    );
  }
}
