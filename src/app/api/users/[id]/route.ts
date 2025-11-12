import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
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
    const { name, email, role, password, isActive } = body;

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        );
      }
    }

    if (role && existingUser.role === "ADMIN" && role !== "ADMIN") {
      const adminCount = await prisma.user.count({
        where: { role: "ADMIN", isActive: true },
      });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot remove the last active admin" },
          { status: 400 }
        );
      }
    }

    if (typeof isActive === "boolean" && existingUser.role === "ADMIN") {
      if (!isActive) {
        const adminCount = await prisma.user.count({
          where: { role: "ADMIN", isActive: true },
        });
        if (adminCount <= 1) {
          return NextResponse.json(
            { error: "Cannot deactivate the last active admin" },
            { status: 400 }
          );
        }
      }
    }

    const updateData: any = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (typeof isActive === "boolean") updateData.isActive = isActive;

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 12);
      updateData.password = hashedPassword;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            contributions: true,
            expenses: true,
          },
        },
      },
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      {
        error: "Failed to update user",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck) return adminCheck;

  try {
    const { id } = params;

    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        contributions: true,
        expenses: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (
      existingUser.contributions.length > 0 ||
      existingUser.expenses.length > 0
    ) {
      return NextResponse.json(
        {
          error:
            "Cannot delete user with existing contributions or expenses. Please remove all related data first.",
        },
        { status: 400 }
      );
    }

    if (existingUser.role === "ADMIN") {
      const adminCount = await prisma.user.count({
        where: { role: "ADMIN", isActive: true },
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot delete the last active admin user" },
          { status: 400 }
        );
      }
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
