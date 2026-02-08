import React from 'react'
import { client } from '@/lib/db'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import AutomationBuilder from '@/components/automations/AutomationBuilder'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type Props = {
  params: Promise<{ id: string }>
}

const Page = async ({ params }: Props) => {
  const { id } = await params
  const user = await currentUser()

  if (!user) return redirect('/sign-in')

  const automation = await client.automation.findUnique({
    where: { id: id },
    include: { trigger: true, listener: true, keywords: true, posts: true }
  })

  // If new (e.g. check "new" id or handle creation via separate route /automations/new)
  // For now assuming existing ID or 404. 
  // If we want /automations/new to work, we need a separate route or handle "new" here.
  // The folder structure had a "new" folder, so /automations/new is likely a separate page.
  // If id is not found, returning 404 is correct.

  if (!automation) return <div>Automation not found</div>

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-4 border-b pb-4">
        <Link href="/automations" className="text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">{automation.name || 'Untitled Automation'}</h1>
          <p className="text-xs text-slate-500">Edited {new Date(automation.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Visual Builder */}
      <AutomationBuilder initialData={automation} automationId={id} />
    </div>
  )
}

export default Page