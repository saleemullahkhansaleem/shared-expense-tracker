'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    HomeIcon,
    CreditCardIcon,
    ReceiptPercentIcon,
    ChartBarIcon,
    CogIcon,
    UsersIcon,
} from '@heroicons/react/24/outline'

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Contributions', href: '/dashboard/contributions', icon: CreditCardIcon },
    { name: 'Expenses', href: '/dashboard/expenses', icon: ReceiptPercentIcon },
    { name: 'Reports', href: '/dashboard/reports', icon: ChartBarIcon },
    { name: 'Members', href: '/dashboard/members', icon: UsersIcon },
    { name: 'Settings', href: '/dashboard/settings', icon: CogIcon },
]

export function DashboardNav() {
    const pathname = usePathname()

    return (
        <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                            isActive
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                            'group flex items-center px-2 py-2 text-sm font-medium border-l-4 transition-colors'
                        )}
                    >
                        <item.icon
                            className={cn(
                                isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500',
                                'mr-3 flex-shrink-0 h-6 w-6'
                            )}
                            aria-hidden="true"
                        />
                        {item.name}
                    </Link>
                )
            })}
        </nav>
    )
}
