import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const actorId = (session.user as any)?.id as string | undefined;
    if (!actorId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = params;
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

    const actorMembership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: actorId,
        role: "ADMIN",
      },
    });
    const isGroupAdmin = !!actorMembership;

    if (!isGroupAdmin) {
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

    const data: Prisma.ContributionUncheckedUpdateInput = {
      userId,
      amount: parsedAmount,
      month,
      groupId,
    };

    const includeNotes = Object.prototype.hasOwnProperty.call(body, "notes");

    let contribution;
    try {
      contribution = await prisma.contribution.update({
        where: { id },
        data: {
          ...data,
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
      });
    } catch (error) {
      throw error;
    }

    if (includeNotes) {
      if (trimmedNotes.length > 0) {
        await prisma.$runCommandRaw({
          update: "contributions",
          updates: [
            {
              q: { _id: { $oid: id } },
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
              q: { _id: { $oid: id } },
              u: { $unset: { notes: "" } },
            },
          ],
        });
        (contribution as any).notes = null;
      }
    }

    return NextResponse.json(contribution);
  } catch (error) {
    console.error("Error updating contribution:", error);
    return NextResponse.json(
      { error: "Failed to update contribution" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    const existing = await prisma.contribution.findUnique({
      where: { id },
      select: {
        groupId: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Contribution not found" },
        { status: 404 }
      );
    }

    const contributionGroupId = existing.groupId;

    if (!contributionGroupId) {
      return NextResponse.json(
        { error: "Contribution is not associated with a group" },
        { status: 400 }
      );
    }

    const actorMembership = await prisma.groupMember.findFirst({
      where: {
        groupId: contributionGroupId,
        userId: actorId,
        role: "ADMIN",
      },
    });
    const isGroupAdmin = !!actorMembership;

    if (!isGroupAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    await prisma.contribution.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Contribution deleted successfully" });
  } catch (error) {
    console.error("Error deleting contribution:", error);
    return NextResponse.json(
      { error: "Failed to delete contribution" },
      { status: 500 }
    );
  }
}
