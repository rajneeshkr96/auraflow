import { client } from '@/lib/db'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function CreateAutomation() {
    const user = await currentUser()
    if (!user) return redirect('/sign-in')

    // Check if user exists in DB
    const dbUser = await client.user.findUnique({ where: { clerkId: user.id } })

    // If not found, maybe they skipped onboarding or webhook failed. 
    // Ideally redirect to Integrations to connect.
    if (!dbUser) return redirect('/integrations')

    // Create Automation
    const automation = await client.automation.create({
        data: {
            name: 'Untitled Automation',
            userId: dbUser.id,
            active: false
        }
    })

    redirect(`/automations/${automation.id}`)
}
