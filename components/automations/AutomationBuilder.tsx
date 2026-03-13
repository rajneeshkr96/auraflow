"use client";

import React, { useCallback, useState } from 'react';
import {
    ReactFlow, Controls, Background, useNodesState, useEdgesState,
    addEdge, Connection, Node, BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Save, Loader2, Trash2, Zap, MessageSquare, Bot, Hash, Image as ImageIcon, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { updateAutomation, deleteAutomation } from '@/actions/automations';
import { toast } from 'sonner';
import PostSelector from './post-selector';

type Props = { initialData: any; automationId: string }

const buildInitialNodes = (d: any): Node[] => [
    {
        id: '1',
        position: { x: 80, y: 80 },
        type: 'input',
        data: {
            label: d.keywords?.length > 0
                ? `⚡ Trigger: ${d.keywords.map((k: any) => k.word).join(', ')}`
                : '⚡ Trigger: Any Keyword',
            type: 'TRIGGER',
            keywords: d.keywords?.map((k: any) => k.word).join(', ') || '',
            posts: d.posts || [],
        },
        style: {
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            color: 'white', border: 'none', padding: '12px 16px',
            borderRadius: 12, width: 220, fontSize: 13, fontWeight: 600,
        },
    },
    {
        id: '2',
        position: { x: 80, y: 260 },
        type: 'output',
        data: {
            label: d.listener?.listener === 'SMART_AI' ? '🤖 Action: AI Agent' : '💬 Action: Send Reply',
            type: 'ACTION',
            listenerType: d.listener?.listener || 'MESSAGE',
            reply: d.listener?.commentReply || d.listener?.dmReply || '',
            dmReply: d.listener?.dmReply || '',
            prompt: d.listener?.prompt || '',
            sendDm: !!(d.listener?.dmReply && d.trigger?.some((t: any) => t.type === 'COMMENT')),
        },
        style: {
            background: d.listener?.listener === 'SMART_AI'
                ? 'linear-gradient(135deg, #9333ea, #ec4899)'
                : 'linear-gradient(135deg, #0ea5e9, #6366f1)',
            color: 'white', border: 'none', padding: '12px 16px',
            borderRadius: 12, width: 220, fontSize: 13, fontWeight: 600,
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
        { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#7c3aed', strokeWidth: 2 } }
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
            if (key === 'keywords') newData.label = value ? `⚡ Trigger: ${value}` : '⚡ Trigger: Any Keyword';
            if (key === 'listenerType') {
                newData.label = value === 'SMART_AI' ? '🤖 Action: AI Agent' : '💬 Action: Send Reply';
            }
            const updated = { ...nd, data: newData, style: nd.id === '2' ? {
                ...nd.style,
                background: value === 'SMART_AI' ? 'linear-gradient(135deg, #9333ea, #ec4899)' : 'linear-gradient(135deg, #0ea5e9, #6366f1)'
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
        <div className="flex gap-5 h-[calc(100vh-200px)]">
            {/* Flow canvas */}
            <div className="flex-1 rounded-2xl border border-slate-200/60 overflow-hidden bg-slate-50 relative">
                {/* Toolbar */}
                <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                    <div className="flex items-center gap-2 glass px-3 py-2 rounded-xl border border-slate-200/60 premium-shadow">
                        <div className={`w-2 h-2 rounded-full ${active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                        <span className="text-sm font-medium text-slate-700">Active</span>
                        <Switch checked={active} onCheckedChange={setActive} />
                    </div>
                    <Button onClick={handleDelete} variant="destructive" size="icon" disabled={deleting || saving} className="rounded-xl">
                        {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </Button>
                    <Button onClick={handleSave} disabled={saving || deleting} className="bg-linear-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white rounded-xl flex items-center gap-2 shadow-lg shadow-violet-500/20">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </Button>
                </div>

                <div className="absolute top-4 left-4 z-10">
                    <div className="glass text-xs text-slate-500 px-3 py-1.5 rounded-xl border border-slate-200/60">
                        Click a node to edit it
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
                    <Controls className="rounded-xl border border-slate-200 overflow-hidden shadow-sm" />
                    <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#e2e8f0" />
                </ReactFlow>
            </div>

            {/* Config Panel - always visible */}
                        <div className="w-75 shrink-0 bg-white border border-slate-200/60 rounded-2xl overflow-y-auto premium-shadow">
                <div className="p-5 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800 text-sm">Configuration</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                        {selectedNode ? `Editing: ${selectedNode.data.type === 'TRIGGER' ? 'Trigger' : 'Action'} node` : 'Select a node to configure'}
                    </p>
                </div>

                <div className="p-5">
                    {/* Global Settings */}
                    <div className="space-y-3 mb-5">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trigger Channels</p>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                                <div className="flex items-center gap-2">
                                    <Send className="w-3.5 h-3.5 text-blue-500" />
                                    <span className="text-sm font-medium text-slate-700">Direct Messages</span>
                                </div>
                                <Switch checked={runOnDms} onCheckedChange={setRunOnDms} />
                            </div>
                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="w-3.5 h-3.5 text-violet-500" />
                                    <span className="text-sm font-medium text-slate-700">Comments</span>
                                </div>
                                <Switch checked={runOnComments} onCheckedChange={setRunOnComments} />
                            </div>
                        </div>
                    </div>

                    <Separator className="mb-5" />

                    {!selectedNode && (
                        <div className="text-center py-8 text-slate-400">
                            <Zap className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-xs">Click a node in the flow to configure it</p>
                        </div>
                    )}

                    {/* TRIGGER config */}
                    {selectedNode?.data.type === 'TRIGGER' && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1.5 bg-violet-100 rounded-lg"><Zap className="w-3.5 h-3.5 text-violet-600" /></div>
                                <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Trigger Config</p>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="flex items-center gap-1.5 text-xs"><Hash className="w-3 h-3" />Keywords</Label>
                                <Input
                                    placeholder="price, info, link (or leave empty for any)"
                                    value={selectedNode.data.keywords as string}
                                    onChange={e => updateNodeData('keywords', e.target.value)}
                                    className="text-sm"
                                />
                                <p className="text-[11px] text-slate-400">Comma separated. Empty = match all.</p>
                            </div>
                            {runOnComments && (
                                <div className="space-y-1.5 pt-3 border-t border-slate-100">
                                    <Label className="flex items-center gap-1.5 text-xs"><ImageIcon className="w-3 h-3" />Specific Posts</Label>
                                    <p className="text-[11px] text-slate-400">Leave empty to run on all posts.</p>
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
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1.5 bg-blue-100 rounded-lg"><Bot className="w-3.5 h-3.5 text-blue-600" /></div>
                                <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Action Config</p>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs">Response Type</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { value: 'MESSAGE', label: 'Static', icon: '📝' },
                                        { value: 'SMART_AI', label: 'AI Agent', icon: '🤖' },
                                    ].map(t => (
                                        <button
                                            key={t.value}
                                            onClick={() => updateNodeData('listenerType', t.value)}
                                            className={`p-2.5 rounded-lg border text-center text-xs font-semibold transition-all ${
                                                selectedNode.data.listenerType === t.value
                                                    ? 'border-violet-600 bg-violet-50 text-violet-700'
                                                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                                            }`}
                                        >
                                            <div className="text-base mb-0.5">{t.icon}</div>
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {selectedNode.data.listenerType === 'MESSAGE' && (
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Reply Message</Label>
                                    <Textarea
                                        rows={4}
                                        placeholder="Enter your reply message..."
                                        value={selectedNode.data.reply as string}
                                        onChange={e => updateNodeData('reply', e.target.value)}
                                        className="text-sm resize-none"
                                    />
                                </div>
                            )}

                            {selectedNode.data.listenerType === 'SMART_AI' && (
                                <div className="space-y-1.5">
                                    <Label className="text-xs">AI System Prompt</Label>
                                    <Textarea
                                        rows={5}
                                        placeholder="You are a helpful assistant..."
                                        value={selectedNode.data.prompt as string}
                                        onChange={e => updateNodeData('prompt', e.target.value)}
                                        className="text-xs font-mono resize-none"
                                    />
                                </div>
                            )}

                            {runOnComments && selectedNode.data.listenerType === 'MESSAGE' && (
                                <div className="space-y-2 pt-3 border-t border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs">Also send DM?</Label>
                                        <Switch
                                            checked={selectedNode.data.sendDm as boolean || false}
                                            onCheckedChange={v => updateNodeData('sendDm', v)}
                                        />
                                    </div>
                                    {(selectedNode.data.sendDm as boolean) && (
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-slate-500">DM Message</Label>
                                            <Textarea
                                                rows={3}
                                                placeholder="Hey! Check your DM for the link..."
                                                value={selectedNode.data.dmReply as string || ''}
                                                onChange={e => updateNodeData('dmReply', e.target.value)}
                                                className="text-sm resize-none"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
