import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'ahmed@example.com' },
      update: {},
      create: {
        name: 'Ahmed',
        email: 'ahmed@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'ADMIN',
      },
    }),
    prisma.user.upsert({
      where: { email: 'fatima@example.com' },
      update: {},
      create: {
        name: 'Fatima',
        email: 'fatima@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'USER',
      },
    }),
    prisma.user.upsert({
      where: { email: 'hassan@example.com' },
      update: {},
      create: {
        name: 'Hassan',
        email: 'hassan@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'USER',
      },
    }),
    prisma.user.upsert({
      where: { email: 'aisha@example.com' },
      update: {},
      create: {
        name: 'Aisha',
        email: 'aisha@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'USER',
      },
    }),
    prisma.user.upsert({
      where: { email: 'omar@example.com' },
      update: {},
      create: {
        name: 'Omar',
        email: 'omar@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'USER',
      },
    }),
    prisma.user.upsert({
      where: { email: 'zara@example.com' },
      update: {},
      create: {
        name: 'Zara',
        email: 'zara@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'USER',
      },
    }),
  ])

  console.log(`✅ Created ${users.length} users`)

  // Create contributions for current month (2025-01)
  const contributions = await Promise.all([
    prisma.contribution.upsert({
      where: { id: 'contrib-1' },
      update: {},
      create: {
        id: 'contrib-1',
        userId: users[0].id, // Ahmed
        amount: 12000,
        month: '2025-01',
      },
    }),
    prisma.contribution.upsert({
      where: { id: 'contrib-2' },
      update: {},
      create: {
        id: 'contrib-2',
        userId: users[1].id, // Fatima
        amount: 12000,
        month: '2025-01',
      },
    }),
    prisma.contribution.upsert({
      where: { id: 'contrib-3' },
      update: {},
      create: {
        id: 'contrib-3',
        userId: users[2].id, // Hassan
        amount: 12000,
        month: '2025-01',
      },
    }),
    prisma.contribution.upsert({
      where: { id: 'contrib-4' },
      update: {},
      create: {
        id: 'contrib-4',
        userId: users[3].id, // Aisha
        amount: 12000,
        month: '2025-01',
      },
    }),
    prisma.contribution.upsert({
      where: { id: 'contrib-5' },
      update: {},
      create: {
        id: 'contrib-5',
        userId: users[4].id, // Omar
        amount: 12000,
        month: '2025-01',
      },
    }),
    // Zara hasn't paid yet (no contribution record)
  ])

  console.log(`✅ Created ${contributions.length} contributions`)

  // Create expenses
  const expenses = await Promise.all([
    prisma.expense.upsert({
      where: { id: 'expense-1' },
      update: {},
      create: {
        id: 'expense-1',
        userId: users[0].id, // Ahmed
        title: 'Bought Milk',
        category: 'Milk',
        amount: 1200,
        date: new Date('2025-01-15'),
        paymentSource: 'COLLECTED',
      },
    }),
    prisma.expense.upsert({
      where: { id: 'expense-2' },
      update: {},
      create: {
        id: 'expense-2',
        userId: users[1].id, // Fatima
        title: 'Chicken for dinner',
        category: 'Chicken',
        amount: 2500,
        date: new Date('2025-01-14'),
        paymentSource: 'COLLECTED',
      },
    }),
    prisma.expense.upsert({
      where: { id: 'expense-3' },
      update: {},
      create: {
        id: 'expense-3',
        userId: users[2].id, // Hassan
        title: 'Fresh vegetables',
        category: 'Vegetables',
        amount: 800,
        date: new Date('2025-01-13'),
        paymentSource: 'POCKET',
      },
    }),
    prisma.expense.upsert({
      where: { id: 'expense-4' },
      update: {},
      create: {
        id: 'expense-4',
        userId: users[3].id, // Aisha
        title: 'Bread and eggs',
        category: 'Other',
        amount: 450,
        date: new Date('2025-01-12'),
        paymentSource: 'COLLECTED',
      },
    }),
    prisma.expense.upsert({
      where: { id: 'expense-5' },
      update: {},
      create: {
        id: 'expense-5',
        userId: users[4].id, // Omar
        title: 'Rice and lentils',
        category: 'Other',
        amount: 1200,
        date: new Date('2025-01-11'),
        paymentSource: 'COLLECTED',
      },
    }),
    // Add more expenses for better data
    prisma.expense.upsert({
      where: { id: 'expense-6' },
      update: {},
      create: {
        id: 'expense-6',
        userId: users[0].id, // Ahmed
        title: 'More milk',
        category: 'Milk',
        amount: 1000,
        date: new Date('2025-01-10'),
        paymentSource: 'COLLECTED',
      },
    }),
    prisma.expense.upsert({
      where: { id: 'expense-7' },
      update: {},
      create: {
        id: 'expense-7',
        userId: users[1].id, // Fatima
        title: 'Beef for curry',
        category: 'Chicken',
        amount: 3000,
        date: new Date('2025-01-09'),
        paymentSource: 'COLLECTED',
      },
    }),
    prisma.expense.upsert({
      where: { id: 'expense-8' },
      update: {},
      create: {
        id: 'expense-8',
        userId: users[2].id, // Hassan
        title: 'Mixed vegetables',
        category: 'Vegetables',
        amount: 600,
        date: new Date('2025-01-08'),
        paymentSource: 'POCKET',
      },
    }),
  ])

  console.log(`✅ Created ${expenses.length} expenses`)

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
