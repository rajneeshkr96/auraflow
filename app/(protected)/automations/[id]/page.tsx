import React from 'react'
import { getAutomationById } from '@/actions/automations'
import { onAuthenticatedUser } from '@/actions/user'
import { redirect } from 'next/navigation'
import AutomationBuilder from '@/components/automations/AutomationBuilder'
import AutomationWizard from '@/components/automations/AutomationWizard'
import EditableName from '@/components/automations/editable-name'
import { ArrowLeft, Zap } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@codeswayam/ui'

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
        <Link href="/automations" className="text-primary font-bold text-sm hover:underline">← Back to Automations</Link>
      </div>
    )
  }

  // Determine if this is a fresh automation with no triggers/actions yet
  const isNew = !automation.trigger || automation.trigger.length === 0;

  const hasDm = automation.trigger?.some((t: any) => t.type === 'DM');
  const hasComment = automation.trigger?.some((t: any) => t.type === 'COMMENT');
  const isAI = automation.listener?.listener === 'SMART_AI';

  return (
    <div className="flex flex-col gap-12 h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-border">
        <div className="flex items-start gap-6">
          <Link href="/automations" className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary transition-all hover:scale-105 active:scale-95 shrink-0">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Flow Editor</span>
              {automation.active && (
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100 font-bold uppercase tracking-widest text-[8px]">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   Live
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4">
               <EditableName automationId={id} initialName={automation.name || 'Untitled Automation'} />
               <div className="flex items-center gap-2">
                  {hasDm && <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full">DM</span>}
                  {hasComment && <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full">Comments</span>}
                  {isAI && <span className="text-[10px] font-bold uppercase tracking-widest bg-primary text-white px-3 py-1 rounded-full">AI Agent</span>}
                  {isNew && <span className="text-[10px] font-bold uppercase tracking-widest bg-secondary px-3 py-1 rounded-full">Draft</span>}
               </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Saved {new Date(automation.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Content: Wizard for new, Builder for existing */}
      <div className="flex-1">
        {isNew ? (
          <div className="max-w-4xl mx-auto py-10">
            <div className="mb-16 text-center">
               <div className="w-20 h-20 bg-primary/10 rounded-[32px] flex items-center justify-center mx-auto mb-8 text-primary">
                  <Zap className="w-10 h-10" />
               </div>
              <h2 className="text-5xl font-bold tracking-tighter text-foreground mb-4">Let's build your flow.</h2>
              <p className="text-xl text-muted-foreground font-medium">Follow the simple steps below to activate your automation.</p>
            </div>
            <AutomationWizard automationId={id} automationName={automation.name || 'Untitled Automation'} />
          </div>
        ) : (
          <AutomationBuilder initialData={automation} automationId={id} />
        )}
      </div>
    </div>
  )
}

export default Page