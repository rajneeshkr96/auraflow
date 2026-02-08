
"use client";

import PostSelector from './post-selector';

import React, { useCallback, useState, useEffect } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Save, Loader2, Settings2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { updateAutomation } from '@/actions/automations';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';

type Props = {
    initialData: any;
    automationId: string;
}

export default function AutomationBuilder({ initialData, automationId }: Props) {
    // Initialize Nodes from Data
    const initialNodesState: Node[] = [
        {
            id: '1',
            position: { x: 100, y: 100 },
            data: {
                label: initialData.keywords?.length > 0 ? `Trigger: ${initialData.keywords.map((k: any) => k.word).join(', ')}` : 'Trigger: Any Keyword',
                type: 'TRIGGER',
                keywords: initialData.keywords?.map((k: any) => k.word).join(', ') || '',
                posts: initialData.posts || []
            },
            type: 'input',
            style: { background: '#fff', border: '1px solid #777', padding: 10, borderRadius: 5, width: 200 }
        },
        {
            id: '2',
            position: { x: 100, y: 300 },
            data: {
                label: initialData.listener?.listener === 'SMART_AI' ? 'Action: Smart AI' : 'Action: Send Reply',
                type: 'ACTION',
                listenerType: initialData.listener?.listener || 'MESSAGE',
                reply: initialData.listener?.dmReply || initialData.listener?.commentReply || '',
                prompt: initialData.listener?.prompt || ''
            },
            type: 'output',
            style: { background: '#fff', border: '1px solid #777', padding: 10, borderRadius: 5, width: 200 }
        },
    ];

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodesState);
    const [edges, setEdges, onEdgesChange] = useEdgesState([
        { id: 'e1-2', source: '1', target: '2', animated: true } // Static edge for MVP
    ]);
    const [saving, setSaving] = useState(false);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [active, setActive] = useState(initialData.active || false);

    // Initial Trigger States
    const initialTriggerTypes = initialData.trigger?.map((t: any) => t.type) || [];
    const [runOnDms, setRunOnDms] = useState<boolean>(initialTriggerTypes.includes('DM') || initialTriggerTypes.length === 0);
    const [runOnComments, setRunOnComments] = useState<boolean>(initialTriggerTypes.includes('COMMENT') || (initialData.posts && initialData.posts.length > 0));

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const handleNodeClick = (event: any, node: Node) => {
        setSelectedNode(node);
    };

    const updateNodeData = (key: string, value: any) => {
        if (!selectedNode) return;
        setNodes((nds) => nds.map((node) => {
            if (node.id === selectedNode.id) {
                const newData = { ...node.data, [key]: value };
                // Update label dynamically
                if (key === 'keywords') newData.label = value ? `Trigger: ${value}` : 'Trigger: Any Keyword';
                if (key === 'listenerType') newData.label = value === 'SMART_AI' ? 'Action: Smart AI' : 'Action: Send Reply';

                const updatedNode = { ...node, data: newData };
                setSelectedNode(updatedNode); // Update selected node state as well
                return updatedNode;
            }
            return node;
        }));
    };

    const handleSave = async () => {
        setSaving(true);

        // Extract data from nodes
        const triggerNode = nodes.find(n => n.id === '1');
        const actionNode = nodes.find(n => n.id === '2');

        const keywords = (triggerNode?.data.keywords as string)?.split(',').map(s => s.trim()).filter(Boolean) || [];
        const listenerType = actionNode?.data.listenerType as 'MESSAGE' | 'SMART_AI';
        const reply = actionNode?.data.reply as string;
        const prompt = actionNode?.data.prompt as string;
        const posts = triggerNode?.data.posts as any[] || [];

        const triggerTypes = [];
        if (runOnDms) triggerTypes.push('DM');
        if (runOnComments) triggerTypes.push('COMMENT');

        // Fallback or Alert? If neither selected, automation won't run.
        // For now, let's allow it but maybe warn user? 
        // Or default to DM if nothing. But explicit is better.

        const result = await updateAutomation(automationId, {
            active: active,
            triggerTypes: triggerTypes as ('DM' | 'COMMENT')[],
            keywords,
            listenerType,
            reply,
            prompt,
            posts
        });

        if (result.success) {
            toast.success("Automation saved successfully");
        } else {
            toast.error("Failed to save automation");
        }

        setSaving(false);
    }



    return (
        <div className="flex h-[calc(100vh-120px)] w-full border rounded-xl overflow-hidden bg-slate-50 relative">
            <div className="flex-1 relative">
                <div className="absolute top-4 right-4 z-10 flex gap-4 items-center">
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border shadow-sm">
                        <span className="text-sm font-medium text-slate-700">Active</span>
                        <Switch
                            checked={active}
                            onCheckedChange={setActive}
                        />
                    </div>
                    <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                        {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                    </Button>
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
                    <Controls />
                    <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                </ReactFlow>
            </div>

            {/* Property Panel */}
            {selectedNode && (
                <div className="w-[300px] border-l bg-white p-6 overflow-y-auto shadow-xl z-20">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b">
                        <Settings2 className="w-5 h-5 text-slate-500" />
                        <h3 className="font-bold text-lg">Configuration</h3>
                    </div>

                    {selectedNode.data.type === 'TRIGGER' && (
                        <>
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-slate-700">Trigger Keywords</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded-md"
                                    placeholder="hello, price, info"
                                    value={selectedNode.data.keywords as string}
                                    onChange={(e) => updateNodeData('keywords', e.target.value)}
                                />
                                <p className="text-xs text-slate-500">Comma separated keywords. Leave empty to match all.</p>
                            </div>

                            <div className="space-y-4 pt-4 border-t">
                                <label className="block text-sm font-medium text-slate-700">Trigger Channels</label>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">Run on DMs</span>
                                    <Switch checked={runOnDms} onCheckedChange={setRunOnDms} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">Run on Comments</span>
                                    <Switch checked={runOnComments} onCheckedChange={setRunOnComments} />
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t">
                                <label className="block text-sm font-medium text-slate-700">Attached Posts (Optional)</label>
                                <p className="text-xs text-slate-500 mb-2">Select posts to restrict comment automation to specific posts only. Leave empty for global comments.</p>
                                <PostSelector
                                    onSelect={(post) => {
                                        const currentPosts = selectedNode.data.posts as any[] || [];
                                        const exists = currentPosts.find(p => p.postid === post.postid);
                                        let newPosts;
                                        if (exists) {
                                            newPosts = currentPosts.filter(p => p.postid !== post.postid);
                                        } else {
                                            newPosts = [...currentPosts, post];
                                        }
                                        updateNodeData('posts', newPosts);
                                    }}
                                    posts={selectedNode.data.posts as any[]}
                                />
                            </div>
                        </>
                    )}

                    {selectedNode.data.type === 'ACTION' && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700">Action Type</label>
                                <select
                                    className="w-full p-2 border rounded-md"
                                    value={selectedNode.data.listenerType as string}
                                    onChange={(e) => updateNodeData('listenerType', e.target.value)}
                                >
                                    <option value="MESSAGE">Static Reply</option>
                                    <option value="SMART_AI">Smart AI Agent</option>
                                </select>
                            </div>

                            {selectedNode.data.listenerType === 'MESSAGE' && (
                                <div className="space-y-4">
                                    <label className="block text-sm font-medium text-slate-700">Reply Message</label>
                                    <textarea
                                        className="w-full p-2 border rounded-md h-32"
                                        placeholder="Enter your reply message..."
                                        value={selectedNode.data.reply as string}
                                        onChange={(e) => updateNodeData('reply', e.target.value)}
                                    />
                                </div>
                            )}

                            {selectedNode.data.listenerType === 'SMART_AI' && (
                                <div className="space-y-4">
                                    <label className="block text-sm font-medium text-slate-700">Agent System Prompt</label>
                                    <textarea
                                        className="w-full p-2 border rounded-md h-40 font-mono text-sm"
                                        placeholder="You are a helpful assistant..."
                                        value={selectedNode.data.prompt as string}
                                        onChange={(e) => updateNodeData('prompt', e.target.value)}
                                    />
                                    <p className="text-xs text-slate-500">This prompt guides the AI behavior.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
