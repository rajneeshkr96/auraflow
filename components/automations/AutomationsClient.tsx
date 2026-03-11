"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Plus, Zap, MessageSquare, Send, Bot, MoreHorizontal,
    Trash2, Edit, Power, Search, Filter
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toggleAutomation, deleteAutomation } from '@/actions/automations';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

function getAutomationType(automation: any) {
    const hasDm = automation.trigger?.some((t: any) => t.type === 'DM');
    const hasComment = automation.trigger?.some((t: any) => t.type === 'COMMENT');
    const isAI = automation.listener?.listener === 'SMART_AI';
    return { hasDm, hasComment, isAI };
}

export default function AutomationsClient({ automations: initial }: { automations: any[] }) {
    const router = useRouter();
    const [automations, setAutomations] = useState(initial);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const filtered = automations.filter(a => {
        const matchSearch = a.name?.toLowerCase().includes(search.toLowerCase());
        if (filter === 'active') return matchSearch && a.active;
        if (filter === 'inactive') return matchSearch && !a.active;
        return matchSearch;
    });

    const handleToggle = async (id: string, currentActive: boolean) => {
        setLoadingId(id);
        setAutomations(prev => prev.map(a => a.id === id ? { ...a, active: !currentActive } : a));
        const result = await toggleAutomation(id, !currentActive);
        if (!result.success) {
            setAutomations(prev => prev.map(a => a.id === id ? { ...a, active: currentActive } : a));
            toast.error('Failed to update automation');
        } else {
            toast.success(!currentActive ? 'Automation activated' : 'Automation paused');
        }
        setLoadingId(null);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
        setLoadingId(id);
        const result = await deleteAutomation(id);
        if (result.success) {
            setAutomations(prev => prev.filter(a => a.id !== id));
            toast.success('Automation deleted');
        } else {
            toast.error('Failed to delete');
            setLoadingId(null);
        }
    };

    const activeCount = automations.filter(a => a.active).length;

    return (
        <div className="space-y-6 w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Automations</h1>
                    <p className="text-slate-500 text-sm mt-0.5">
                        {automations.length} total · <span className="text-emerald-600 font-medium">{activeCount} live</span>
                    </p>
                </div>
                <Link
                    href="/automations/new"
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md"
                >
                    <Plus className="w-4 h-4" />
                    New Automation
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        className="pl-9"
                        placeholder="Search automations..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-36">
                        <Filter className="w-3.5 h-3.5 mr-2 text-slate-400" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* List */}
            {filtered.length === 0 ? (
                <EmptyState hasSearch={!!search} />
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                >
                    {filtered.map((automation, i) => {
                        const { hasDm, hasComment, isAI } = getAutomationType(automation);
                        const isNew = !automation.trigger || automation.trigger.length === 0;
                        return (
                            <motion.div
                                key={automation.id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={`bg-white border rounded-2xl p-5 group hover:shadow-md transition-all ${automation.active ? 'border-slate-200' : 'border-slate-100 opacity-75 hover:opacity-100'}`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                        isAI ? 'bg-gradient-to-br from-violet-500 to-purple-600' :
                                        hasDm ? 'bg-gradient-to-br from-blue-500 to-cyan-600' :
                                        'bg-gradient-to-br from-orange-500 to-pink-600'
                                    }`}>
                                        {isAI ? <Bot className="w-5 h-5 text-white" /> :
                                         hasDm ? <Send className="w-5 h-5 text-white" /> :
                                         <MessageSquare className="w-5 h-5 text-white" />}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={automation.active}
                                            onCheckedChange={() => handleToggle(automation.id, automation.active)}
                                            disabled={loadingId === automation.id}
                                        />
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/automations/${automation.id}`} className="flex items-center gap-2">
                                                        <Edit className="w-3.5 h-3.5" /> Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleToggle(automation.id, automation.active)} className="flex items-center gap-2">
                                                    <Power className="w-3.5 h-3.5" />
                                                    {automation.active ? 'Pause' : 'Activate'}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(automation.id, automation.name)}
                                                    className="flex items-center gap-2 text-red-600 focus:text-red-600 focus:bg-red-50"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                <Link href={`/automations/${automation.id}`} className="block">
                                    <h3 className="font-bold text-slate-900 group-hover:text-violet-700 transition-colors truncate mb-2">
                                        {automation.name || 'Untitled Automation'}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                                        {isNew && <Badge variant="secondary" className="text-[10px]">Draft</Badge>}
                                        {hasDm && <Badge variant="info" className="text-[10px]">DM</Badge>}
                                        {hasComment && <Badge variant="purple" className="text-[10px]">Comment</Badge>}
                                        {isAI && <Badge variant="warning" className="text-[10px]">AI Agent</Badge>}
                                        {!isNew && !hasDm && !hasComment && <Badge variant="secondary" className="text-[10px]">Configured</Badge>}
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-slate-400">
                                        <span>{automation.listener ? 'Has action' : 'No action set'}</span>
                                        <span>{new Date(automation.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}
        </div>
    );
}

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-blue-100 rounded-2xl flex items-center justify-center mb-5">
                <Zap className="w-8 h-8 text-violet-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
                {hasSearch ? 'No results found' : 'No automaions yet'}
            </h3>
            <p className="text-slate-400 text-sm max-w-xs mb-6">
                {hasSearch
                    ? 'Try adjusting your search or filters.'
                    : 'Create your first automation to start responding to Instagram comments and DMs automatically.'}
            </p>
            {!hasSearch && (
                <Link
                    href="/automations/new"
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold rounded-xl hover:from-violet-500 hover:to-blue-500 transition-all text-sm"
                >
                    <Plus className="w-4 h-4" />
                    Create Automation
                </Link>
            )}
        </div>
    );
}
