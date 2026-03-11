// Fix for /automations/new — replaced broken Clerk auth() with onAuthenticatedUser()
import { onAuthenticatedUser } from '@/actions/user'
import { redirect } from 'next/navigation'
import axios from 'axios'
import { cookies } from 'next/headers'

export default async function CreateAutomation() {
    const user = await onAuthenticatedUser()
    if (!user || !user.id) return redirect('/sign-in')

    const cookieStore = await cookies()
    const authToken = cookieStore.get('Authentication')?.value
    const AURA_API = process.env.NEXT_PUBLIC_AURA_API_URL || 'http://localhost:3005'

    let automationId = null
    try {
        const response = await axios.post(`${AURA_API}/automations`, {
            name: 'Untitled Automation',
            active: false
        }, {
            headers: { Cookie: `Authentication=${authToken}` }
        })
        automationId = response.data.id
    } catch (e) {
        console.error("Failed to create automation", e)
        return redirect('/automations')
    }

    if (automationId) {
        redirect(`/automations/${automationId}`)
    } else {
        redirect('/automations')
    }
}
