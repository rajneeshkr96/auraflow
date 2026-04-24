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
import { Save, Loader2, Trash2, Zap, MessageSquare, Bot, Hash, Image as ImageIcon, Send, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { updateAutomation, deleteAutomation } from '@/actions/automations';
import { toast } from 'sonner';
import PostSelector from './post-selector';

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
            sendDm: !!(d.listener?.dmReply && d.trigger?.some((t: any) => t.type === 'COMMENT')),
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

    const initialTriggerTypes = initialData.trigger?.map((t: any) => t.type) || [];
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
                                    {[
                                        { value: 'MESSAGE', label: 'Static', icon: <Pencil className="w-5 h-5" /> },
                                        { value: 'SMART_AI', label: 'AI Agent', icon: <Bot className="w-5 h-5" /> },
                                    ].map(t => (
                                        <button
                                            key={t.value}
                                            onClick={() => updateNodeData('listenerType', t.value)}
                                            className={cn(
                                                "flex flex-col items-center gap-3 p-6 rounded-[32px] border transition-all",
                                                selectedNode.data.listenerType === t.value
                                                    ? "bg-foreground text-background border-foreground"
                                                    : "bg-secondary border-border text-muted-foreground hover:border-muted-foreground"
                                            )}
                                        >
                                            {t.icon}
                                            <span className="text-xs font-bold uppercase tracking-widest">{t.label}</span>
                                        </button>
                                    ))}
                                </div>
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
                                    {selectedNode.data.sendDm && (
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
