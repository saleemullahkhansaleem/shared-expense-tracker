'use client'

import { CardDescription } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

type CategoryChartDatum = {
    name: string
    value: number
}

const COLORS = ['#6366F1', '#F97316', '#10B981', '#EF4444', '#8B5CF6', '#FACC15', '#14B8A6', '#F472B6']

interface GroupExpenseCategoryChartProps {
    data: CategoryChartDatum[]
}

export function GroupExpenseCategoryChart({ data }: GroupExpenseCategoryChartProps) {
    if (!data || data.length === 0) {
        return <CardDescription className="text-gray-500">No expenses recorded yet.</CardDescription>
    }

    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`slice-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value as number)} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}

