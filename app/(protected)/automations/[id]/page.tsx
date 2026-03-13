import React from 'react'
import { getAutomationById } from '@/actions/automations'
import { onAuthenticatedUser } from '@/actions/user'
import { redirect } from 'next/navigation'
import AutomationBuilder from '@/components/automations/AutomationBuilder'
import AutomationWizard from '@/components/automations/AutomationWizard'
import EditableName from '@/components/automations/editable-name'
import { ArrowLeft, Zap } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

type Props = {
  params: Promise<{ id: string }>
}

const Page = async ({ params }: Props) => {
  const { id } = await params
  const user = await onAuthenticatedUser()
  if (!user) return redirect('/sign-in')

  const automation = await getAutomationById(id)
  if (!automation) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-4">
        <Zap className="w-12 h-12 opacity-20" />
        <p className="font-semibold">Automation not found</p>
        <Link href="/automations" className="text-violet-600 text-sm hover:underline">← Back to Automations</Link>
      </div>
    )
  }

  // Determine if this is a fresh automation with no triggers/actions yet
  const isNew = !automation.trigger || automation.trigger.length === 0;

  const hasDm = automation.trigger?.some((t: any) => t.type === 'DM');
  const hasComment = automation.trigger?.some((t: any) => t.type === 'COMMENT');
  const isAI = automation.listener?.listener === 'SMART_AI';

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/automations" className="text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-lg hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <EditableName automationId={id} initialName={automation.name || 'Untitled Automation'} />
              {automation.active && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Live
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              {hasDm && <Badge variant="info" className="text-[10px]">DM</Badge>}
              {hasComment && <Badge variant="purple" className="text-[10px]">Comment</Badge>}
              {isAI && <Badge variant="warning" className="text-[10px]">AI Agent</Badge>}
              {isNew && <Badge variant="secondary" className="text-[10px]">Draft</Badge>}
              <span className="text-xs text-slate-400">· Last updated {new Date(automation.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content: Wizard for new, Builder for existing */}
      {isNew ? (
        <div>
          <div className="mb-6 text-center">
            <h2 className="text-lg font-bold text-slate-800">Let's set up your automation</h2>
            <p className="text-sm text-slate-500 mt-1">Follow the steps below to configure and activate it.</p>
          </div>
          <AutomationWizard automationId={id} automationName={automation.name || 'Untitled Automation'} />
        </div>
      ) : (
        <AutomationBuilder initialData={automation} automationId={id} />
      )}
    </div>
  )
}

export default Page