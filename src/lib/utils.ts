import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(date)
}

export function getCurrentMonth(): string {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function getDaysInMonth(month: string): number {
    const [year, monthNum] = month.split('-')
    return new Date(parseInt(year), parseInt(monthNum), 0).getDate()
}

export function getDaysLeftInMonth(month: string): number {
    const [year, monthNum] = month.split('-')
    const today = new Date()
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`

    if (month !== currentMonth) return 0

    const daysInMonth = getDaysInMonth(month)
    const todayDate = today.getDate()
    return Math.max(0, daysInMonth - todayDate)
}
