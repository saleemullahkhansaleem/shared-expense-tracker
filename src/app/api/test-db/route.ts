import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const contributionCount = await prisma.contribution.count();
    const expenseCount = await prisma.expense.count();

    return NextResponse.json({
      success: true,
      message: "MongoDB connection successful",
      data: {
        users: userCount,
        contributions: contributionCount,
        expenses: expenseCount,
      },
      databaseProvider: "MongoDB",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("MongoDB connection test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
