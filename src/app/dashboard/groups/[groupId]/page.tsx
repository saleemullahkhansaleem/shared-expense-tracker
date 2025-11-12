import { redirect } from 'next/navigation'

export default function GroupIndexPage({
    params,
}: {
    params: { groupId: string }
}) {
    redirect(`/dashboard/groups/${params.groupId}/overview`)
}

