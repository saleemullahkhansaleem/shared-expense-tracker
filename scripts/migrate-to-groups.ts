import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function migrateToGroups() {
  console.log("🚀 Starting migration to group system...");

  try {
    // Check if there are existing users
    const existingUsers = await prisma.user.findMany();
    console.log(`Found ${existingUsers.length} existing users`);

    if (existingUsers.length === 0) {
      console.log("No existing users found. Migration not needed.");
      return;
    }

    // Check if there are existing contributions or expenses without groupId
    const existingContributions = await prisma.contribution.findMany({
      where: { groupId: null },
    });
    const existingExpenses = await prisma.expense.findMany({
      where: { groupId: null },
    });

    console.log(
      `Found ${existingContributions.length} contributions without group`
    );
    console.log(`Found ${existingExpenses.length} expenses without group`);

    if (existingContributions.length === 0 && existingExpenses.length === 0) {
      console.log("No existing data to migrate. Migration completed.");
      return;
    }

    // Create a default group for existing data
    const defaultGroup = await prisma.group.create({
      data: {
        name: "Default Group",
        description: "Automatically created group for existing data",
        inviteCode: "LEGACY",
        monthlyAmount: 12000, // Set default monthly amount based on existing data
        creatorId: existingUsers[0].id, // First user becomes the creator
      },
    });

    console.log(
      `✅ Created default group: ${defaultGroup.name} (${defaultGroup.id})`
    );

    // Add all existing users to the default group
    const memberPromises = existingUsers.map((user, index) =>
      prisma.groupMember.create({
        data: {
          userId: user.id,
          groupId: defaultGroup.id,
          role: index === 0 ? "ADMIN" : "MEMBER", // First user is admin
        },
      })
    );

    await Promise.all(memberPromises);
    console.log(`✅ Added ${existingUsers.length} users to the default group`);

    // Update existing contributions to belong to the default group
    if (existingContributions.length > 0) {
      await prisma.contribution.updateMany({
        where: { groupId: null },
        data: { groupId: defaultGroup.id },
      });
      console.log(`✅ Updated ${existingContributions.length} contributions`);
    }

    // Update existing expenses to belong to the default group
    if (existingExpenses.length > 0) {
      await prisma.expense.updateMany({
        where: { groupId: null },
        data: { groupId: defaultGroup.id },
      });
      console.log(`✅ Updated ${existingExpenses.length} expenses`);
    }

    console.log("🎉 Migration to group system completed successfully!");
    console.log(`Default group invite code: ${defaultGroup.inviteCode}`);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateToGroups();
