import { Skeleton } from './skeleton'
import { Card, CardContent, CardHeader } from './card'

// Dashboard Overview Skeletons
export function DashboardOverviewSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
                <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-20 mb-2" />
                        <Skeleton className="h-3 w-32" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

// Chart Skeletons
export function ChartSkeleton() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                    <div className="h-64 flex items-center justify-center">
                        <Skeleton className="h-48 w-48 rounded-full" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-36" />
                    <Skeleton className="h-4 w-44" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <Skeleton className="h-4 w-8" />
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <Skeleton className="h-3 w-3 rounded-full" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Skeleton className="h-3 w-3 rounded-full" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// Recent Expenses Skeleton
export function RecentExpensesSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-5 w-16 rounded-full" />
                                </div>
                                <div className="flex items-center space-x-4">
                                    <Skeleton className="h-3 w-12" />
                                    <Skeleton className="h-3 w-1" />
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-3 w-1" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            </div>
                            <Skeleton className="h-5 w-16" />
                        </div>
                    ))}
                </div>
                <div className="mt-4 text-center">
                    <Skeleton className="h-4 w-32 mx-auto" />
                </div>
            </CardContent>
        </Card>
    )
}

// List Item Skeleton (for expenses, contributions, members)
export function ListItemSkeleton() {
    return (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <div className="flex items-center space-x-4">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-1" />
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-1" />
                    <Skeleton className="h-3 w-20" />
                </div>
                <div className="flex items-center space-x-6 mt-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-18" />
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-20" />
            </div>
        </div>
    )
}

// Expenses List Skeleton
export function ExpensesListSkeleton() {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>
            </CardHeader>
            <CardContent>
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>

                {/* Summary */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-6 w-24" />
                    </div>
                </div>

                {/* List */}
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <ListItemSkeleton key={i} />
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

// Contributions List Skeleton
export function ContributionsListSkeleton() {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-10 w-36" />
                </div>
            </CardHeader>
            <CardContent>
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>

                {/* Summary */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div>
                            <Skeleton className="h-8 w-20 mx-auto mb-1" />
                            <Skeleton className="h-3 w-24 mx-auto" />
                        </div>
                        <div>
                            <Skeleton className="h-8 w-8 mx-auto mb-1" />
                            <Skeleton className="h-3 w-20 mx-auto" />
                        </div>
                        <div>
                            <Skeleton className="h-8 w-8 mx-auto mb-1" />
                            <Skeleton className="h-3 w-16 mx-auto" />
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="space-y-3">
                    {[...Array(6)].map((_, i) => (
                        <ListItemSkeleton key={i} />
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

// Members List Skeleton
export function MembersListSkeleton() {
    return (
        <div className="space-y-6">
            {/* Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Members List */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[...Array(6)].map((_, i) => (
                            <ListItemSkeleton key={i} />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// Page Skeleton (for full page loading)
export function PageSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
            <div className="space-y-6">
                <DashboardOverviewSkeleton />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <RecentExpensesSkeleton />
                    <ChartSkeleton />
                </div>
            </div>
        </div>
    )
}
