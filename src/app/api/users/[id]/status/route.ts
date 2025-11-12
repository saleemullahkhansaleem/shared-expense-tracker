import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck) return adminCheck;

  try {
    const { id } = params;
    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "isActive boolean value required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!isActive) {
      const adminCount = await prisma.user.count({
        where: { role: "ADMIN", isActive: true },
      });

      if (existingUser.role === "ADMIN" && adminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot deactivate the last active admin user" },
          { status: 400 }
        );
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        isActive,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("Error updating user status:", error);
    return NextResponse.json(
      {
        error: "Failed to update user status",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

