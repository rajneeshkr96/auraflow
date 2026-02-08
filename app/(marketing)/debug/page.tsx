import { client } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function DebugPage() {
    try {
        const automations = await client.automation.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                trigger: true,
                listener: true,
                keywords: true,
                posts: true,
            }
        })

        return (
            <pre className="p-10 font-mono text-xs whitespace-pre-wrap bg-gray-100">
                {JSON.stringify(automations, null, 2)}
            </pre>
        )
    } catch (error) {
        return <div>Error: {JSON.stringify(error)}</div>
    }
}
