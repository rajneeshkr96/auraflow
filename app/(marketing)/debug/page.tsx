import { getAutomations } from '@/actions/automations'

export const dynamic = 'force-dynamic'

export default async function DebugPage() {
    try {
        const automations = await getAutomations()

        return (
            <pre className="p-10 font-mono text-xs whitespace-pre-wrap bg-gray-100">
                {JSON.stringify(automations, null, 2)}
            </pre>
        )
    } catch (error) {
        return <div>Error: {JSON.stringify(error)}</div>
    }
}
