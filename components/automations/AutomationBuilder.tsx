"use client";

import React, { useCallback, useState } from 'react';
import {
    ReactFlow, Controls, Background, useNodesState, useEdgesState,
    addEdge, Connection, Node, BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button, Input, Label, Badge } from '@codeswayam/ui';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Save, Loader2, Trash2, Zap, MessageSquare, Bot, Send, Pencil, Sparkles, Crown, Settings2, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { updateAutomation, deleteAutomation } from '@/actions/automations';
import { toast } from 'sonner';
import PostSelector from './post-selector';
import { useAuraflowAccess } from '@/lib/use-auraflow-access';
import AgentPanel from './AgentPanel';
import Link from 'next/link';

type Props = { initialData: any; automationId: string }

const buildInitialNodes = (d: any): Node[] => [
    {
        id: '1',
        position: { x: 100, y: 100 },
        type: 'input',
        data: {
            label: d.keywords?.length > 0
                ? `⚡ ${d.keywords.map((k: any) => k.word).join(', ')}`
                : '⚡ All Keywords',
            type: 'TRIGGER',
            keywords: d.keywords?.map((k: any) => k.word).join(', ') || '',
            posts: d.posts || [],
        },
        style: {
            background: '#ffffff',
            color: '#000000',
            border: '2px solid #000000',
            padding: '24px',
            borderRadius: 32,
            width: 280,
            fontSize: 16,
            fontWeight: 800,
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)'
        },
    },
    {
        id: '2',
        position: { x: 100, y: 400 },
        type: 'output',
        data: {
            label: d.listener?.listener === 'SMART_AI' ? '🤖 Smart AI Agent' : '💬 Static Reply',
            type: 'ACTION',
            listenerType: d.listener?.listener || 'MESSAGE',
            reply: d.listener?.commentReply || d.listener?.dmReply || '',
            dmReply: d.listener?.dmReply || '',
            prompt: d.listener?.prompt || '',
            sendDm: !!(d.listener?.dmReply && d.triggers?.some((t: any) => t.type === 'COMMENT')),
        },
        style: {
            background: d.listener?.listener === 'SMART_AI' ? '#000000' : '#ffffff',
            color: d.listener?.listener === 'SMART_AI' ? '#ffffff' : '#000000',
            border: '2px solid #000000',
            padding: '24px',
            borderRadius: 32,
            width: 280,
            fontSize: 16,
            fontWeight: 800,
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)'
        },
    },
];

export default function AutomationBuilder({ initialData, automationId }: Props) {
    const router = useRouter();
    const access = useAuraflowAccess();

    const initialTriggerTypes = initialData.triggers?.map((t: any) => t.type) || [];
    const [runOnDms, setRunOnDms] = useState(initialTriggerTypes.includes('DM') || initialTriggerTypes.length === 0);
    const [runOnComments, setRunOnComments] = useState(initialTriggerTypes.includes('COMMENT'));

    const [nodes, setNodes, onNodesChange] = useNodesState(buildInitialNodes(initialData));
    const [edges, setEdges, onEdgesChange] = useEdgesState([
        { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#000000', strokeWidth: 3 } }
    ]);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [active, setActive] = useState(initialData.active || false);
    // Mobile tab: 'canvas' | 'config'
    const [mobileTab, setMobileTab] = useState<'canvas' | 'config'>('canvas');

    const onConnect = useCallback((params: Connection) => setEdges(eds => addEdge(params, eds)), [setEdges]);

    const handleNodeClick = (_: any, node: Node) => setSelectedNode(node);

    const updateNodeData = (key: string, value: any) => {
        if (!selectedNode) return;
        setNodes(nds => nds.map(nd => {
            if (nd.id !== selectedNode.id) return nd;
            const newData = { ...nd.data, [key]: value };
            if (key === 'keywords') newData.label = value ? `⚡ ${value}` : '⚡ All Keywords';
            if (key === 'listenerType') {
                newData.label = value === 'SMART_AI' ? '🤖 Smart AI Agent' : '💬 Static Reply';
            }
            const updated = {
                ...nd, data: newData, style: nd.id === '2' ? {
                    ...nd.style,
                    background: value === 'SMART_AI' ? '#000000' : '#ffffff',
                    color: value === 'SMART_AI' ? '#ffffff' : '#000000',
                } : nd.style
            };
            setSelectedNode(updated);
            return updated;
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        const triggerNode = nodes.find(n => n.id === '1');
        const actionNode = nodes.find(n => n.id === '2');

        const keywords = (triggerNode?.data.keywords as string)?.split(',').map(s => s.trim()).filter(Boolean) || [];
        const listenerType = actionNode?.data.listenerType as 'MESSAGE' | 'SMART_AI';
        const reply = actionNode?.data.reply as string;
        const prompt = actionNode?.data.prompt as string;
        const posts = triggerNode?.data.posts as any[] || [];
        const sendDm = actionNode?.data.sendDm as boolean;
        const dmReply = sendDm ? (actionNode?.data.dmReply as string) : undefined;

        const triggerTypes: ('DM' | 'COMMENT')[] = [];
        if (runOnDms) triggerTypes.push('DM');
        if (runOnComments) triggerTypes.push('COMMENT');

        if (triggerTypes.length === 0) {
            toast.error('Select at least one trigger channel (DM or Comments)');
            setSaving(false); return;
        }

        const result = await updateAutomation(automationId, { active, triggerTypes, keywords, listenerType, reply, dmReply, prompt, posts });
        setSaving(false);
        if (result.success) toast.success('Automation saved!');
        else toast.error(result.error || 'Failed to save');
    };

    const handleDelete = async () => {
        if (!confirm('Delete this automation? This cannot be undone.')) return;
        setDeleting(true);
        const result = await deleteAutomation(automationId);
        if (result.success) { toast.success('Automation deleted'); router.push('/automations'); }
        else { toast.error('Failed to delete'); setDeleting(false); }
    };

    return (
        <div className="flex flex-col gap-4 h-full min-h-[500px]">
            {/* Mobile tab switcher */}
            <div className="flex lg:hidden items-center gap-2 p-1 bg-secondary rounded-2xl shrink-0">
                <button
                    onClick={() => setMobileTab('canvas')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-xs font-bold transition-all",
                        mobileTab === 'canvas'
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground"
                    )}
                >
                    <Layers className="w-3.5 h-3.5" />
                    Designer
                </button>
                <button
                    onClick={() => setMobileTab('config')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-xs font-bold transition-all",
                        mobileTab === 'config'
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground"
                    )}
                >
                    <Settings2 className="w-3.5 h-3.5" />
                    Configure
                </button>
            </div>

            {/* Main layout */}
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1 min-h-0 overflow-hidden">
                {/* Flow canvas */}
                <div className={cn(
                    "min-w-0 rounded-[28px] sm:rounded-[36px] lg:rounded-[40px] border border-border overflow-hidden bg-secondary/30 relative",
                    // On mobile: show/hide based on tab; fixed height
                    "lg:flex-1",
                    mobileTab === 'canvas' ? "flex flex-col flex-1" : "hidden lg:flex lg:flex-col"
                )} style={{ minHeight: 0 }}>
                    {/* Compact mobile toolbar */}
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 lg:top-6 lg:right-6 z-10 flex items-center gap-2">
                        {/* Status pill */}
                        <div className="flex items-center gap-2 bg-background px-3 py-2 sm:px-4 sm:py-2.5 lg:px-6 lg:py-4 rounded-full border border-border shadow-lg shadow-black/5">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${active ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'}`} />
                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-foreground hidden sm:block">Status</span>
                            <Switch checked={active} onCheckedChange={setActive} className="data-[state=checked]:bg-primary scale-90 sm:scale-100" />
                        </div>
                        {/* Save */}
                        <button
                            onClick={handleSave}
                            disabled={saving || deleting}
                            className="h-9 sm:h-11 lg:h-14 px-4 sm:px-6 lg:px-8 bg-primary text-white rounded-full flex items-center gap-2 font-bold text-xs sm:text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                        >
                            {saving ? <Loader2 className="w-3.5 h-3.5 sm:w-5 sm:h-5 animate-spin" /> : <Save className="w-3.5 h-3.5 sm:w-5 sm:h-5" />}
                            <span className="hidden sm:inline">Save Flow</span>
                            <span className="sm:hidden">Save</span>
                        </button>
                        {/* Delete */}
                        <button
                            onClick={handleDelete}
                            disabled={deleting || saving}
                            className="w-9 h-9 sm:w-11 sm:h-11 lg:w-14 lg:h-14 bg-white border border-border text-destructive rounded-full flex items-center justify-center hover:bg-destructive hover:text-white transition-all"
                        >
                            {deleting ? <Loader2 className="w-3.5 h-3.5 sm:w-5 sm:h-5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 sm:w-5 sm:h-5" />}
                        </button>
                    </div>

                    {/* Designer label */}
                    <div className="absolute top-3 left-3 sm:top-4 sm:left-4 lg:top-6 lg:left-6 z-10">
                        <div className="bg-foreground text-background text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 sm:px-4 sm:py-2 rounded-full">
                            Interactive Designer
                        </div>
                    </div>

                    {/* ReactFlow fills remaining space */}
                    <div className="flex-1 w-full h-full">
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            onNodeClick={(_, node) => { handleNodeClick(_, node); setMobileTab('config'); }}
                            fitView
                        >
                            <Controls className="rounded-2xl border border-border overflow-hidden shadow-xl" />
                            <Background variant={BackgroundVariant.Lines} gap={40} size={1} color="#00000008" />
                        </ReactFlow>
                    </div>
                </div>

                {/* Config Panel */}
                <div className={cn(
                    "shrink-0 min-w-0 bg-white border border-border rounded-[28px] sm:rounded-[36px] lg:rounded-[40px] overflow-y-auto p-4 sm:p-6 shadow-sm",
                    // Desktop styles: fixed width, block display
                    "lg:w-[360px] xl:w-[400px] lg:flex-none lg:block",
                    // Mobile styles: full width, flex-1 when active, otherwise hidden
                    mobileTab === 'config' ? "w-full flex flex-col flex-1" : "hidden"
                )}>
                    <div className="mb-6 sm:mb-8 shrink-0">
                        <h3 className="text-2xl font-bold tracking-tighter mb-1">Configuration</h3>
                        <p className="text-muted-foreground font-medium text-sm">
                            {selectedNode ? `Editing ${selectedNode.data.type === 'TRIGGER' ? 'Trigger' : 'Action'} node` : 'Select a node on the canvas to edit'}
                        </p>
                    </div>

                    <div className="space-y-8">
                        {/* Global Settings */}
                        <div className="space-y-5">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Flow Channels</p>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setRunOnDms(!runOnDms)}
                                    className={cn(
                                        "flex flex-col items-center gap-3 p-5 rounded-[24px] border transition-all shrink-0 min-w-0",
                                        runOnDms ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-secondary border-border text-muted-foreground"
                                    )}
                                >
                                    <Send className="w-5 h-5" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest truncate w-full">DMs</span>
                                </button>
                                <button
                                    onClick={() => setRunOnComments(!runOnComments)}
                                    className={cn(
                                        "flex flex-col items-center gap-3 p-5 rounded-[24px] border transition-all shrink-0 min-w-0",
                                        runOnComments ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-secondary border-border text-muted-foreground"
                                    )}
                                >
                                    <MessageSquare className="w-5 h-5" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest truncate w-full">Comments</span>
                                </button>
                            </div>
                        </div>

                        <Separator className="bg-border" />

                        {/* TRIGGER config */}
                        {selectedNode?.data.type === 'TRIGGER' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Keyword Triggers</Label>
                                    <Input
                                        placeholder="Enter keywords..."
                                        value={selectedNode.data.keywords as string}
                                        onChange={e => updateNodeData('keywords', e.target.value)}
                                        className="h-14 rounded-2xl border-border bg-secondary/50 font-bold px-6"
                                    />
                                    <p className="text-xs text-muted-foreground font-medium italic">Separate by comma. Empty matches all.</p>
                                </div>

                                {runOnComments && (
                                    <div className="space-y-4 pt-6 border-t border-border">
                                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Target Posts</Label>
                                        <PostSelector
                                            onSelect={(post) => {
                                                const current = selectedNode.data.posts as any[] || [];
                                                const exists = current.find(p => p.postid === post.postid);
                                                updateNodeData('posts', exists ? current.filter(p => p.postid !== post.postid) : [...current, post]);
                                            }}
                                            posts={selectedNode.data.posts as any[]}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ACTION config */}
                        {selectedNode?.data.type === 'ACTION' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Response Engine Selection */}
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Response Engine</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => updateNodeData('listenerType', 'MESSAGE')}
                                            className={cn(
                                                "flex flex-col items-center gap-2 p-5 rounded-[24px] border transition-all shrink-0 min-w-0",
                                                selectedNode.data.listenerType === 'MESSAGE'
                                                    ? "bg-foreground text-background border-foreground"
                                                    : "bg-secondary border-border text-muted-foreground hover:border-muted-foreground"
                                            )}
                                        >
                                            <Pencil className="w-4 h-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest truncate w-full">Static</span>
                                        </button>

                                        <button
                                            onClick={() => {
                                                if (!access.isLoaded) return;
                                                if (!access.canAffordAiCall) {
                                                    toast.error(
                                                        access.aiIncluded
                                                            ? 'AI is included in your plan but something went wrong.'
                                                            : `You need at least ${access.aiCallCost} points to use AI Agent.`,
                                                        { duration: 5000 }
                                                    );
                                                    return;
                                                }
                                                updateNodeData('listenerType', 'SMART_AI');
                                            }}
                                            className={cn(
                                                "flex flex-col items-center gap-2 p-5 rounded-[24px] border transition-all relative shrink-0 min-w-0",
                                                selectedNode.data.listenerType === 'SMART_AI'
                                                    ? "bg-foreground text-background border-foreground"
                                                    : "bg-secondary border-border text-muted-foreground hover:border-muted-foreground",
                                                !access.canAffordAiCall && "opacity-60 cursor-not-allowed"
                                            )}
                                        >
                                            <Bot className="w-4 h-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest truncate w-full">AI Agent</span>
                                            {access.isLoaded && (
                                                <span className="absolute -top-1 -right-1 bg-primary text-white text-[8px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                                    {access.aiIncluded ? <Crown className="w-2 h-2" /> : <Sparkles className="w-2 h-2" />}
                                                    {access.aiIncluded ? 'Free' : access.aiCallCost}
                                                </span>
                                            )}
                                        </button>
                                    </div>

                                    {/* Points / upgrade notice */}
                                    {access.isLoaded && !access.aiIncluded && (
                                        <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-secondary border border-border text-xs font-bold">
                                            <span className="text-muted-foreground">Balance: <span className="text-foreground">{access.creditBalance.toLocaleString()} pts</span></span>
                                            {!access.isSubscribed ? (
                                                <Link href="/subscription" className="text-primary flex items-center gap-1 hover:underline">
                                                    <Crown className="w-3 h-3" /> Upgrade
                                                </Link>
                                            ) : (
                                                <Link href="/subscription" className="text-primary flex items-center gap-1 hover:underline">
                                                    <Sparkles className="w-3 h-3" /> Buy credits
                                                </Link>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Conditional Config Panels */}
                                {selectedNode.data.listenerType === 'MESSAGE' && (
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Reply Content</Label>
                                        <Textarea
                                            rows={6}
                                            placeholder="Type your automated reply..."
                                            value={selectedNode.data.reply as string}
                                            onChange={e => updateNodeData('reply', e.target.value)}
                                            className="rounded-[32px] border-border bg-secondary/50 font-medium p-8 resize-none text-lg"
                                        />
                                    </div>
                                )}

                                {selectedNode.data.listenerType === 'SMART_AI' && initialData.listener?.id ? (
                                    <AgentPanel
                                        listenerId={initialData.listener.id}
                                        automationId={automationId}
                                        initialPrompt={selectedNode.data.prompt as string || ''}
                                    />
                                ) : selectedNode.data.listenerType === 'SMART_AI' && (
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">AI Brain Configuration</Label>
                                        <Textarea
                                            rows={6}
                                            placeholder="You are a helpful assistant..."
                                            value={selectedNode.data.prompt as string}
                                            onChange={e => updateNodeData('prompt', e.target.value)}
                                            className="rounded-[32px] border-border bg-foreground text-background font-mono p-8 resize-none text-sm"
                                        />
                                        <p className="text-xs text-muted-foreground">Save the automation first to unlock the full AI Agent panel.</p>
                                    </div>
                                )}

                                {runOnComments && selectedNode.data.listenerType === 'MESSAGE' && (
                                    <div className="space-y-6 pt-6 border-t border-border">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Upsell via DM</Label>
                                            <Switch
                                                checked={selectedNode.data.sendDm as boolean || false}
                                                onCheckedChange={v => updateNodeData('sendDm', v)}
                                                className="data-[state=checked]:bg-primary"
                                            />
                                        </div>
                                        {!!selectedNode.data.sendDm && (
                                            <Textarea
                                                rows={4}
                                                placeholder="DM message..."
                                                value={selectedNode.data.dmReply as string || ''}
                                                onChange={e => updateNodeData('dmReply', e.target.value)}
                                                className="rounded-[24px] border-border bg-secondary/50 font-medium p-6 resize-none text-sm"
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {!selectedNode && (
                            <div className="py-20 text-center animate-pulse">
                                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Zap className="w-10 h-10 text-muted-foreground/20" />
                                </div>
                                <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Select a component to configure</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
