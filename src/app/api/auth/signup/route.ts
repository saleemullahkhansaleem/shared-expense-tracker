import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    try {
        const { name, email, password } = await request.json()

        // Validate input
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters long' },
                { status: 400 }
            )
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 400 }
            )
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12)

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'USER', // Default role
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            }
        })

        return NextResponse.json(
            { message: 'User created successfully', user },
            { status: 201 }
        )
    } catch (error: any) {
        console.error('Signup error:', error)
        
        // Check if it's a database connection error
        if (error.code === 'P1001') {
            return NextResponse.json(
                { error: 'Database connection failed. Please try again later.' },
                { status: 503 }
            )
        }
        
        // Check if it's a unique constraint error
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 400 }
            )
        }
        
        return NextResponse.json(
            { 
                error: 'Internal server error',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        )
    }
}
