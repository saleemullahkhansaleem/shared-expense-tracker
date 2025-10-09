import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { GroupSelection } from "@/components/groups/GroupSelection";

export default async function GroupsPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/signin");
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto py-8 px-4">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome to Shared Expense Tracker
                    </h1>
                    <p className="text-gray-600">
                        Create a new group or join an existing one to start managing shared expenses
                    </p>
                </div>

                <GroupSelection />
            </div>
        </div>
    );
}
