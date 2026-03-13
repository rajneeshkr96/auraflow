"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Plus, Zap, MessageSquare, Send, Bot, MoreHorizontal,
    Trash2, Edit, Power, Search, Filter, Pencil
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toggleAutomation, deleteAutomation, updateAutomation } from '@/actions/automations';
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
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');

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

    const handleRename = async (id: string) => {
        const trimmed = renameValue.trim();
        if (!trimmed) { setRenamingId(null); return; }
        setLoadingId(id);
        const result = await updateAutomation(id, { name: trimmed });
        if (result.success) {
            setAutomations(prev => prev.map(a => a.id === id ? { ...a, name: trimmed } : a));
            toast.success('Automation renamed');
        } else {
            toast.error(result.error || 'Failed to rename');
        }
        setRenamingId(null);
        setLoadingId(null);
    };

    const activeCount = automations.filter(a => a.active).length;

    return (
        <div className="space-y-6 w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Automations</h1>
                    <p className="text-slate-500 text-sm mt-0.5">
                        {automations.length} total · <span className="text-emerald-600 font-semibold">{activeCount} live</span>
                    </p>
                </div>
                <Link
                    href="/automations/new"
                    className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/25 active:scale-[0.98]"
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
                                className={`bg-white border rounded-2xl p-5 group hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 ${automation.active ? 'border-slate-200/60' : 'border-slate-100 opacity-70 hover:opacity-100'}`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 ${
                                        isAI ? 'bg-linear-to-br from-violet-500 to-purple-600 shadow-md shadow-violet-500/20' :
                                        hasDm ? 'bg-linear-to-br from-blue-500 to-cyan-600 shadow-md shadow-blue-500/20' :
                                        'bg-linear-to-br from-orange-500 to-pink-600 shadow-md shadow-orange-500/20'
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
                                                <DropdownMenuItem
                                                    onClick={() => { setRenamingId(automation.id); setRenameValue(automation.name || ''); }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" /> Rename
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
                                    {renamingId === automation.id ? (
                                        <div className="flex items-center gap-2 mb-2" onClick={e => e.preventDefault()}>
                                            <input
                                                value={renameValue}
                                                onChange={e => setRenameValue(e.target.value)}
                                                onKeyDown={e => { if (e.key === 'Enter') handleRename(automation.id); if (e.key === 'Escape') setRenamingId(null); }}
                                                className="flex-1 text-sm font-bold text-slate-900 bg-transparent border-b-2 border-violet-400 outline-none py-0.5 min-w-0"
                                                maxLength={100}
                                                autoFocus
                                            />
                                            <button onClick={e => { e.preventDefault(); handleRename(automation.id); }} className="p-0.5 text-emerald-600 hover:bg-emerald-50 rounded">
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <h3 className="font-bold text-slate-900 group-hover:text-violet-700 transition-colors truncate mb-2">
                                            {automation.name || 'Untitled Automation'}
                                        </h3>
                                    )}
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
        <div className="bg-white border border-slate-200/60 rounded-2xl p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-linear-to-br from-violet-100 to-blue-100 rounded-2xl flex items-center justify-center mb-5">
                <Zap className="w-8 h-8 text-violet-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
                {hasSearch ? 'No results found' : 'No automations yet'}
            </h3>
            <p className="text-slate-400 text-sm max-w-xs mb-6">
                {hasSearch
                    ? 'Try adjusting your search or filters.'
                    : 'Create your first automation to start responding to Instagram comments and DMs automatically.'}
            </p>
            {!hasSearch && (
                <Link
                    href="/automations/new"
                    className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-violet-600 to-blue-600 text-white font-bold rounded-xl hover:from-violet-500 hover:to-blue-500 transition-all text-sm shadow-lg shadow-violet-500/20"
                >
                    <Plus className="w-4 h-4" />
                    Create Automation
                </Link>
            )}
        </div>
    );
}
