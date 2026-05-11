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
import { Save, Loader2, Trash2, Zap, MessageSquare, Bot, Hash, Image as ImageIcon, Send, Pencil, Lock, Sparkles, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { updateAutomation, deleteAutomation } from '@/actions/automations';
import { toast } from 'sonner';
import PostSelector from './post-selector';
import { useAuraflowAccess } from '@/lib/use-auraflow-access';
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
            const updated = { ...nd, data: newData, style: nd.id === '2' ? {
                ...nd.style,
                background: value === 'SMART_AI' ? '#000000' : '#ffffff',
                color: value === 'SMART_AI' ? '#ffffff' : '#000000',
            } : nd.style };
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
        <div className="flex flex-col lg:flex-row gap-10 h-[calc(100vh-300px)]">
            {/* Flow canvas */}
            <div className="flex-1 rounded-[48px] border border-border overflow-hidden bg-secondary/30 relative">
                {/* Toolbar */}
                <div className="absolute top-6 right-6 z-10 flex items-center gap-3">
                    <div className="flex items-center gap-4 bg-background px-6 py-4 rounded-full border border-border shadow-xl shadow-black/5">
                        <div className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'}`} />
                        <span className="text-xs font-bold uppercase tracking-widest text-foreground">Status</span>
                        <Switch checked={active} onCheckedChange={setActive} className="data-[state=checked]:bg-primary" />
                    </div>
                    <button onClick={handleSave} disabled={saving || deleting} className="h-14 px-8 bg-primary text-white rounded-full flex items-center gap-3 font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20">
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Save Flow
                    </button>
                    <button onClick={handleDelete} disabled={deleting || saving} className="w-14 h-14 bg-white border border-border text-destructive rounded-full flex items-center justify-center hover:bg-destructive hover:text-white transition-all">
                        {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                    </button>
                </div>

                <div className="absolute top-6 left-6 z-10">
                    <div className="bg-foreground text-background text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full">
                        Interactive Designer
                    </div>
                </div>

                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={handleNodeClick}
                    fitView
                >
                    <Controls className="rounded-2xl border border-border overflow-hidden shadow-xl" />
                    <Background variant={BackgroundVariant.Lines} gap={40} size={1} color="#00000008" />
                </ReactFlow>
            </div>

            {/* Config Panel */}
            <div className="w-full lg:w-[450px] shrink-0 bg-white border border-border rounded-[48px] overflow-y-auto p-10">
                <div className="mb-10">
                    <h3 className="text-2xl font-bold tracking-tighter mb-1">Configuration</h3>
                    <p className="text-muted-foreground font-medium">
                        {selectedNode ? `Editing ${selectedNode.data.type === 'TRIGGER' ? 'Trigger' : 'Action'} node` : 'Select a node on the canvas to edit'}
                    </p>
                </div>

                <div className="space-y-10">
                    {/* Global Settings */}
                    <div className="space-y-6">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Flow Channels</p>
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => setRunOnDms(!runOnDms)}
                                className={cn(
                                    "flex flex-col items-center gap-4 p-6 rounded-[32px] border transition-all",
                                    runOnDms ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-secondary border-border text-muted-foreground"
                                )}
                            >
                                <Send className="w-6 h-6" />
                                <span className="text-xs font-bold uppercase tracking-widest">DMs</span>
                            </button>
                            <button 
                                onClick={() => setRunOnComments(!runOnComments)}
                                className={cn(
                                    "flex flex-col items-center gap-4 p-6 rounded-[32px] border transition-all",
                                    runOnComments ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-secondary border-border text-muted-foreground"
                                )}
                            >
                                <MessageSquare className="w-6 h-6" />
                                <span className="text-xs font-bold uppercase tracking-widest">Comments</span>
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
                            <div className="space-y-4">
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Response Engine</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => updateNodeData('listenerType', 'MESSAGE')}
                                        className={cn(
                                            "flex flex-col items-center gap-3 p-6 rounded-[32px] border transition-all",
                                            selectedNode.data.listenerType === 'MESSAGE'
                                                ? "bg-foreground text-background border-foreground"
                                                : "bg-secondary border-border text-muted-foreground hover:border-muted-foreground"
                                        )}
                                    >
                                        <Pencil className="w-5 h-5" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Static</span>
                                    </button>

                                    {/* AI Agent button — gated by plan + points */}
                                    <button
                                        onClick={() => {
                                            if (!access.isLoaded) return;
                                            if (!access.canAffordAiCall) {
                                                toast.error(
                                                    access.aiIncluded
                                                        ? 'AI is included in your plan but something went wrong.'
                                                        : `You need at least ${access.aiCallCost} points to use AI Agent. Buy credits or upgrade your plan.`,
                                                    { duration: 5000 }
                                                );
                                                return;
                                            }
                                            updateNodeData('listenerType', 'SMART_AI');
                                        }}
                                        className={cn(
                                            "flex flex-col items-center gap-3 p-6 rounded-[32px] border transition-all relative",
                                            selectedNode.data.listenerType === 'SMART_AI'
                                                ? "bg-foreground text-background border-foreground"
                                                : "bg-secondary border-border text-muted-foreground hover:border-muted-foreground",
                                            !access.canAffordAiCall && "opacity-60 cursor-not-allowed"
                                        )}
                                    >
                                        <Bot className="w-5 h-5" />
                                        <span className="text-xs font-bold uppercase tracking-widest">AI Agent</span>
                                        {access.isLoaded && !access.aiIncluded && (
                                            <span className="absolute -top-2 -right-2 bg-primary text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <Sparkles className="w-2.5 h-2.5" />{access.aiCallCost}pts
                                            </span>
                                        )}
                                        {access.isLoaded && access.aiIncluded && (
                                            <span className="absolute -top-2 -right-2 bg-primary text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <Crown className="w-2.5 h-2.5" />Free
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
                                                <Crown className="w-3 h-3" /> Upgrade for free AI
                                            </Link>
                                        ) : (
                                            <Link href="/subscription" className="text-primary flex items-center gap-1 hover:underline">
                                                <Sparkles className="w-3 h-3" /> Buy credits
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>

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

                            {selectedNode.data.listenerType === 'SMART_AI' && (
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">AI Brain Configuration</Label>
                                    <Textarea
                                        rows={8}
                                        placeholder="Instruction your AI..."
                                        value={selectedNode.data.prompt as string}
                                        onChange={e => updateNodeData('prompt', e.target.value)}
                                        className="rounded-[32px] border-border bg-foreground text-background font-mono p-8 resize-none text-sm"
                                    />
                                    <div className="bg-primary/10 p-6 rounded-[24px] flex items-start gap-4">
                                       <Bot className="w-6 h-6 text-primary shrink-0" />
                                       <p className="text-xs font-bold text-primary leading-relaxed">AI will use this prompt to generate unique, context-aware responses to every user.</p>
                                    </div>

                                    {/* Knowledge Base — deep link to neural-web */}
                                    <div className="pt-4 border-t border-border space-y-3">
                                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Knowledge Base (RAG)</Label>
                                        <div className="p-5 rounded-[24px] border border-border bg-secondary/30 space-y-3">
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                Upload your product catalog, FAQs, or business docs so the AI answers from your actual content.
                                            </p>
                                            <a
                                                href={`${process.env.NEXT_PUBLIC_NEURAL_WEB_URL || 'http://localhost:3008'}/knowledge-base`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between w-full px-5 py-3 rounded-2xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all"
                                            >
                                                <span>Manage Knowledge Base</span>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                            </a>
                                            <p className="text-[10px] text-muted-foreground text-center">
                                                After uploading docs, copy the KB ID and paste it below.
                                            </p>
                                            <input
                                                type="number"
                                                placeholder="KB ID from NeuralHub (optional)"
                                                value={selectedNode.data.kbId as string || ''}
                                                onChange={e => updateNodeData('kbId', e.target.value ? Number(e.target.value) : undefined)}
                                                className="w-full px-4 py-2.5 rounded-2xl border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                                            />
                                        </div>
                                    </div>
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
                                            placeholder="DM message for new leads..."
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
    );
}
