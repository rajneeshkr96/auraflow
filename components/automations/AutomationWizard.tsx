"use client";

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    MessageSquare, Send, Bot, Sparkles, ArrowRight, ArrowLeft,
    Hash, Image as ImageIcon, CheckCircle2, Loader2, Save, Globe, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { updateAutomation } from '@/actions/automations';
import { toast } from 'sonner';
import PostSelector from './post-selector';

type AutomationType = 'COMMENT' | 'DM' | null;
type ActionType = 'MESSAGE' | 'SMART_AI';

interface WizardState {
    automationType: AutomationType;
    // Trigger config
    keywords: string;
    triggerAll: boolean;
    selectedPosts: any[];
    // Action config
    actionType: ActionType;
    replyText: string;
    aiPrompt: string;
    sendDmOnComment: boolean;
    dmText: string;
}

const STEPS = ['Type', 'Trigger', 'Action', 'Review'];

export default function AutomationWizard({
    automationId,
    automationName,
}: {
    automationId: string;
    automationName: string;
}) {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<WizardState>({
        automationType: null,
        keywords: '',
        triggerAll: true,
        selectedPosts: [],
        actionType: 'MESSAGE',
        replyText: '',
        aiPrompt: '',
        sendDmOnComment: false,
        dmText: '',
    });

    const update = (key: keyof WizardState, value: any) => setForm(p => ({ ...p, [key]: value }));
    const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
    const back = () => setStep(s => Math.max(s - 1, 0));

    const canNext = () => {
        if (step === 0) return form.automationType !== null;
        if (step === 1) return true; // keywords optional
        if (step === 2) {
            if (form.actionType === 'MESSAGE') return form.replyText.trim().length > 0;
            if (form.actionType === 'SMART_AI') return form.aiPrompt.trim().length > 0;
        }
        return true;
    };

    const handleSave = async () => {
        setSaving(true);
        const keywords = form.keywords.split(',').map(s => s.trim()).filter(Boolean);
        const triggerTypes: ('DM' | 'COMMENT')[] = form.automationType === 'DM' ? ['DM'] : ['COMMENT'];

        const result = await updateAutomation(automationId, {
            active: true,
            triggerTypes,
            keywords,
            listenerType: form.actionType,
            reply: form.replyText || undefined,
            dmReply: form.sendDmOnComment ? form.dmText : undefined,
            prompt: form.aiPrompt || undefined,
            posts: form.selectedPosts,
        });

        setSaving(false);
        if (result.success) {
            toast.success('Automation created and activated!');
            router.push('/automations');
        } else {
            toast.error(result.error || 'Failed to save automation');
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Progress indicator */}
            <div className="flex items-center gap-0 mb-8">
                {STEPS.map((s, i) => (
                    <div key={s} className="flex items-center flex-1">
                        <div className="flex flex-col items-center gap-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                                i < step ? 'bg-violet-600 border-violet-600 text-white' :
                                i === step ? 'border-violet-600 text-violet-600 bg-white' :
                                'border-slate-200 text-slate-400 bg-white'
                            }`}>
                                {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                            </div>
                            <span className={`text-[10px] font-semibold ${i === step ? 'text-violet-700' : 'text-slate-400'}`}>{s}</span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-2 -mt-3.5 transition-all ${i < step ? 'bg-violet-600' : 'bg-slate-200'}`} />
                        )}
                    </div>
                ))}
            </div>

            {/* Step Content */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm min-h-105 flex flex-col">
                {step === 0 && <StepType form={form} update={update} />}
                {step === 1 && <StepTrigger form={form} update={update} />}
                {step === 2 && <StepAction form={form} update={update} />}
                {step === 3 && <StepReview form={form} automationName={automationName} />}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-auto pt-8 border-t border-slate-100">
                    <Button variant="outline" onClick={back} disabled={step === 0} className="flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </Button>
                    {step < STEPS.length - 1 ? (
                        <Button onClick={next} disabled={!canNext()} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white">
                            Continue <ArrowRight className="w-4 h-4" />
                        </Button>
                    ) : (
                        <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-linear-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                            {saving ? 'Activating...' : 'Activate Automation'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Step Components ────────────────────────────────────────────────────────

function StepType({ form, update }: { form: WizardState; update: (k: keyof WizardState, v: any) => void }) {
    const types = [
        {
            id: 'COMMENT' as AutomationType,
            title: 'Comment Automation',
            description: 'Auto-reply when someone comments on your posts. Optionally send them a DM too.',
            icon: MessageSquare,
            emoji: '💬',
            gradient: 'from-violet-500 to-purple-600',
            tags: ['Post Comments', 'Optional DM', 'Keyword Match'],
        },
        {
            id: 'DM' as AutomationType,
            title: 'DM Automation',
            description: 'Automatically reply to incoming Direct Messages based on keywords or any message.',
            icon: Send,
            emoji: '📩',
            gradient: 'from-blue-500 to-cyan-600',
            tags: ['Direct Messages', 'Smart Reply', 'AI Support'],
        },
    ];

    return (
        <div className="flex-1">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">Choose Automation Type</h2>
                <p className="text-slate-500 text-sm mt-1">What kind of Instagram interaction do you want to automate?</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {types.map((type) => (
                    <button
                        key={type.id}
                        onClick={() => update('automationType', type.id)}
                        className={`relative text-left p-5 rounded-xl border-2 transition-all group ${
                            form.automationType === type.id
                                ? 'border-violet-600 bg-violet-50'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                        {form.automationType === type.id && (
                            <div className="absolute top-3 right-3">
                                <CheckCircle2 className="w-5 h-5 text-violet-600" />
                            </div>
                        )}
                        <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${type.gradient} flex items-center justify-center mb-4 text-xl`}>
                            {type.emoji}
                        </div>
                        <h3 className="font-bold text-slate-900 mb-1.5">{type.title}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed mb-3">{type.description}</p>
                        <div className="flex flex-wrap gap-1.5">
                            {type.tags.map(tag => (
                                <span key={tag} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">{tag}</span>
                            ))}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

function StepTrigger({ form, update }: { form: WizardState; update: (k: keyof WizardState, v: any) => void }) {
    return (
        <div className="flex-1 space-y-6">
            <div>
                <h2 className="text-xl font-bold text-slate-900">Configure Trigger</h2>
                <p className="text-slate-500 text-sm mt-1">
                    {form.automationType === 'COMMENT'
                        ? 'Define which comments will trigger your automation.'
                        : 'Define which DMs will trigger your automation.'}
                </p>
            </div>

            {/* Keyword section */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="font-semibold text-slate-700 flex items-center gap-2">
                        <Hash className="w-4 h-4 text-slate-400" /> Trigger Keywords
                    </Label>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Match any message</span>
                        <Switch checked={form.triggerAll} onCheckedChange={v => update('triggerAll', v)} />
                    </div>
                </div>
                <Input
                    disabled={form.triggerAll}
                    placeholder="price, info, link, buy (comma-separated)"
                    value={form.keywords}
                    onChange={e => update('keywords', e.target.value)}
                    className={form.triggerAll ? 'opacity-40' : ''}
                />
                <p className="text-xs text-slate-400">
                    {form.triggerAll
                        ? '✓ Will respond to ANY message or comment.'
                        : 'Will only trigger when these keywords are detected.'}
                </p>
            </div>

            {/* Posts selection for Comment */}
            {form.automationType === 'COMMENT' && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                    <Label className="font-semibold text-slate-700 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-slate-400" /> Specific Posts (Optional)
                    </Label>
                    <p className="text-xs text-slate-400">Leave empty to trigger on all posts, or select specific posts to target.</p>
                    <PostSelector
                        onSelect={(post) => {
                            const exists = form.selectedPosts.find(p => p.postid === post.postid);
                            update('selectedPosts', exists
                                ? form.selectedPosts.filter(p => p.postid !== post.postid)
                                : [...form.selectedPosts, post]
                            );
                        }}
                        posts={form.selectedPosts}
                    />
                </div>
            )}
        </div>
    );
}

function StepAction({ form, update }: { form: WizardState; update: (k: keyof WizardState, v: any) => void }) {
    return (
        <div className="flex-1 space-y-5">
            <div>
                <h2 className="text-xl font-bold text-slate-900">Configure Action</h2>
                <p className="text-slate-500 text-sm mt-1">How should Auraflow respond when this automation triggers?</p>
            </div>

            {/* Action Type Cards */}
            <div className="grid grid-cols-2 gap-3">
                {[
                    { id: 'MESSAGE' as ActionType, title: 'Static Reply', desc: 'Always send the same message', icon: '📝', gradient: 'from-blue-500 to-cyan-500' },
                    { id: 'SMART_AI' as ActionType, title: 'AI Agent', desc: 'Smart contexual AI replies', icon: '🤖', gradient: 'from-violet-500 to-purple-500' },
                ].map(t => (
                    <button
                        key={t.id}
                        onClick={() => update('actionType', t.id)}
                        className={`text-left p-4 rounded-xl border-2 transition-all ${
                            form.actionType === t.id ? 'border-violet-600 bg-violet-50' : 'border-slate-200 hover:border-slate-300'
                        }`}
                    >
                        <div className="text-xl mb-2">{t.icon}</div>
                        <p className="font-bold text-sm text-slate-800">{t.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{t.desc}</p>
                    </button>
                ))}
            </div>

            {/* Static reply fields */}
            {form.actionType === 'MESSAGE' && (
                <div className="space-y-3">
                    <Label className="font-semibold text-slate-700">
                        {form.automationType === 'COMMENT' ? 'Comment Reply *' : 'DM Reply *'}
                    </Label>
                    <Textarea
                        rows={3}
                        placeholder={form.automationType === 'COMMENT'
                            ? "Thanks for your comment! 👋 Check your DMs for the link."
                            : "Hey! Thanks for reaching out. Here's the info you asked for..."}
                        value={form.replyText}
                        onChange={e => update('replyText', e.target.value)}
                        className="resize-none"
                    />
                    <p className="text-[11px] text-slate-400">{form.replyText.length} characters</p>
                </div>
            )}

            {/* AI fields */}
            {form.actionType === 'SMART_AI' && (
                <div className="space-y-3">
                    <Label className="font-semibold text-slate-700 flex items-center gap-2">
                        <Bot className="w-4 h-4 text-violet-500" /> AI System Prompt *
                    </Label>
                    <Textarea
                        rows={4}
                        placeholder={"You are a friendly sales assistant for [Your Brand]. When someone asks about pricing, share our packages: Starter $29/mo, Pro $79/mo. Always be concise and end with a question to keep the conversation going."}
                        value={form.aiPrompt}
                        onChange={e => update('aiPrompt', e.target.value)}
                        className="resize-none font-mono text-xs"
                    />
                    <div className="flex items-start gap-2 p-3 bg-violet-50 rounded-lg">
                        <Sparkles className="w-4 h-4 text-violet-600 mt-0.5 shrink-0" />
                        <p className="text-xs text-violet-700">The AI will use this prompt as context to craft personalized, intelligent responses to every message.</p>
                    </div>
                </div>
            )}

            {/* Send DM on Comment toggle */}
            {form.automationType === 'COMMENT' && form.actionType === 'MESSAGE' && (
                <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-slate-700">Also send a DM to the commenter?</p>
                            <p className="text-xs text-slate-400 mt-0.5">Powerful for sending links or resources privately</p>
                        </div>
                        <Switch checked={form.sendDmOnComment} onCheckedChange={v => update('sendDmOnComment', v)} />
                    </div>
                    {form.sendDmOnComment && (
                        <div className="space-y-2 mt-2 animate-in fade-in slide-in-from-top-2">
                            <Label className="text-xs font-medium text-slate-600">DM Message *</Label>
                            <Textarea
                                rows={3}
                                placeholder="Hey! I saw your comment. Here's the link you asked for: ..."
                                value={form.dmText}
                                onChange={e => update('dmText', e.target.value)}
                                className="resize-none text-sm"
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function StepReview({ form, automationName }: { form: WizardState; automationName: string }) {
    const typeLabel = form.automationType === 'DM' ? 'DM Automation' : 'Comment Automation';
    const actionLabel = form.actionType === 'SMART_AI' ? 'AI Agent Response' : 'Static Reply';
    const keywords = form.keywords.split(',').map(s => s.trim()).filter(Boolean);

    return (
        <div className="flex-1 space-y-5">
            <div>
                <h2 className="text-xl font-bold text-slate-900">Review & Activate</h2>
                <p className="text-slate-500 text-sm mt-1">Everything look good? Activate your automation!</p>
            </div>

            <div className="space-y-3">
                <ReviewRow label="Name" value={automationName} />
                <ReviewRow label="Type" value={typeLabel} />
                <ReviewRow
                    label="Triggers on"
                    value={form.triggerAll ? 'Any message / comment' : (keywords.length > 0 ? keywords.join(', ') : 'Any')}
                />
                {form.automationType === 'COMMENT' && form.selectedPosts.length > 0 && (
                    <ReviewRow label="Posts" value={`${form.selectedPosts.length} specific post(s)`} />
                )}
                <ReviewRow label="Action" value={actionLabel} />
                {form.actionType === 'MESSAGE' && form.replyText && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Reply Preview</p>
                        <p className="text-sm text-slate-700">{form.replyText}</p>
                    </div>
                )}
                {form.sendDmOnComment && form.dmText && (
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">DM Preview</p>
                        <p className="text-sm text-slate-700">{form.dmText}</p>
                    </div>
                )}
            </div>

            <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-bold text-emerald-800">Ready to go live!</p>
                    <p className="text-xs text-emerald-600 mt-0.5">Your automation will start responding to {form.automationType === 'DM' ? 'DMs' : 'comments'} immediately after activation.</p>
                </div>
            </div>
        </div>
    );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between py-2.5 border-b border-slate-100 last:border-0">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
            <span className="text-sm font-medium text-slate-800 text-right max-w-[65%]">{value}</span>
        </div>
    );
}
