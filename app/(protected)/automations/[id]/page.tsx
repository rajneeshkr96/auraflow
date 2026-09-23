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
import { getSsoLoginUrl } from '@/lib/platform/sso'

type Props = {
  params: Promise<{ id: string }>
}

const Page = async ({ params }: Props) => {
  const { id } = await params
  const user = await onAuthenticatedUser()
  if (!user) return redirect(getSsoLoginUrl(`/automations/${id}`))

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
  const isNew = !automation.triggers || automation.triggers.length === 0;

  const hasDm = automation.triggers?.some((t: any) => t.type === 'DM');
  const hasComment = automation.triggers?.some((t: any) => t.type === 'COMMENT');
  const isAI = automation.listener?.listener === 'SMART_AI';

  return (
    <div className={`flex flex-col gap-4 sm:gap-6 ${isNew ? 'min-h-full' : 'h-full overflow-hidden'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 sm:pb-6 border-b border-border shrink-0">
        <div className="flex items-start gap-4 sm:gap-6">
          <Link href="/automations" className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary transition-all hover:scale-105 active:scale-95 shrink-0">
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1.5 sm:mb-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Flow Editor</span>
              {automation.active && (
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100 font-bold uppercase tracking-widest text-[8px]">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   Live
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
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
      <div className={`flex-1 ${isNew ? 'overflow-y-auto pr-1' : 'min-h-0'}`}>
        {isNew ? (
          <div className="max-w-3xl mx-auto py-2 sm:py-4 pb-12">
            <div className="mb-5 sm:mb-6 text-center">
               <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3 text-primary shadow-xs">
                  <Zap className="w-6 h-6" />
               </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-1">Let's build your flow.</h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">Follow the simple steps below to activate your automation.</p>
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