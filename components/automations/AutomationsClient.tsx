"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Plus, Zap, MessageSquare, Send, Bot, MoreHorizontal,
    Trash2, Edit, Power, Search, Filter, Pencil
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@codeswayam/ui';
import { Input } from '@codeswayam/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toggleAutomation, deleteAutomation, updateAutomation } from '@/actions/automations';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

function getAutomationType(automation: any) {
    const hasDm = automation.triggers?.some((t: any) => t.type === 'DM');
    const hasComment = automation.triggers?.some((t: any) => t.type === 'COMMENT');
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
        <div className="space-y-12 w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-end justify-between gap-8">
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Automations List</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tighter leading-none">
                        Manage your <br />
                        <span className="text-muted-foreground">flows.</span>
                    </h1>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <div className="text-right hidden md:block">
                        <p className="text-3xl font-bold tracking-tighter">{automations.length}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Flows</p>
                    </div>
                    <Link
                        href="/automations/new"
                        className="flex items-center justify-center gap-2 h-16 px-8 bg-primary text-white text-lg font-bold rounded-full transition-all shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 w-full sm:w-auto"
                    >
                        <Plus className="w-5 h-5" />
                        New Automation
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                        className="pl-14 h-16 rounded-[24px] border-border bg-white text-lg font-medium focus:ring-primary/20 focus:border-primary/30"
                        placeholder="Search flows..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    {(['all', 'active', 'inactive'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "h-16 px-8 rounded-full text-sm font-bold uppercase tracking-widest transition-all",
                                filter === f 
                                    ? "bg-foreground text-background" 
                                    : "bg-secondary text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            {filtered.length === 0 ? (
                <EmptyState hasSearch={!!search} />
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {filtered.map((automation, i) => {
                        const { hasDm, hasComment, isAI } = getAutomationType(automation);
                        const isNew = !automation.trigger || automation.trigger.length === 0;
                        return (
                            <motion.div
                                key={automation.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={`group bg-white border rounded-[40px] p-8 hover:border-primary/30 transition-all duration-500 ${!automation.active && 'opacity-60 grayscale-[0.5]'}`}
                            >
                                <div className="flex items-start justify-between mb-10">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 ${
                                        isAI ? 'bg-primary text-white' :
                                        hasDm ? 'bg-secondary text-primary' :
                                        'bg-secondary text-muted-foreground'
                                    }`}>
                                        {isAI ? <Bot className="w-7 h-7" /> :
                                         hasDm ? <Send className="w-7 h-7" /> :
                                         <MessageSquare className="w-7 h-7" />}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={automation.active}
                                            onCheckedChange={() => handleToggle(automation.id, automation.active)}
                                            disabled={loadingId === automation.id}
                                            className="data-[state=checked]:bg-primary"
                                        />
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground bg-secondary rounded-xl transition-all">
                                                    <MoreHorizontal className="w-5 h-5" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="rounded-2xl p-2 min-w-48 shadow-xl border-border">
                                                <DropdownMenuItem asChild className="rounded-xl p-3 font-bold cursor-pointer">
                                                    <Link href={`/automations/${automation.id}`} className="flex items-center gap-3">
                                                        <Edit className="w-4 h-4 text-primary" /> Edit Flow
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => { setRenamingId(automation.id); setRenameValue(automation.name || ''); }}
                                                    className="rounded-xl p-3 font-bold cursor-pointer flex items-center gap-3"
                                                >
                                                    <Pencil className="w-4 h-4 text-primary" /> Rename
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="my-1" />
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(automation.id, automation.name)}
                                                    className="rounded-xl p-3 font-bold cursor-pointer flex items-center gap-3 text-destructive"
                                                >
                                                    <Trash2 className="w-4 h-4" /> Delete Flow
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                <Link href={`/automations/${automation.id}`} className="block">
                                    {renamingId === automation.id ? (
                                        <div className="flex items-center gap-2 mb-4" onClick={e => e.preventDefault()}>
                                            <input
                                                value={renameValue}
                                                onChange={e => setRenameValue(e.target.value)}
                                                onKeyDown={e => { if (e.key === 'Enter') handleRename(automation.id); if (e.key === 'Escape') setRenamingId(null); }}
                                                className="flex-1 text-2xl font-bold text-foreground bg-transparent border-b-2 border-primary outline-none py-1"
                                                maxLength={100}
                                                autoFocus
                                            />
                                        </div>
                                    ) : (
                                        <h3 className="text-2xl font-bold text-foreground tracking-tight group-hover:text-primary transition-colors truncate mb-4">
                                            {automation.name || 'Untitled Flow'}
                                        </h3>
                                    )}
                                    <div className="flex flex-wrap items-center gap-2 mb-8">
                                        {isNew && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold uppercase tracking-widest bg-secondary px-3 py-1 rounded-full">Draft</span>
                                                <button
                                                    onClick={e => { e.preventDefault(); handleDelete(automation.id, automation.name); }}
                                                    disabled={loadingId === automation.id}
                                                    className="text-[10px] font-bold uppercase tracking-widest bg-destructive/10 text-destructive px-3 py-1 rounded-full hover:bg-destructive hover:text-white transition-all disabled:opacity-50"
                                                >
                                                    {loadingId === automation.id ? '...' : 'Delete'}
                                                </button>
                                            </div>
                                        )}
                                        {hasDm && <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full">DM Flow</span>}
                                        {hasComment && <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full">Comments</span>}
                                        {isAI && <span className="text-[10px] font-bold uppercase tracking-widest bg-primary text-white px-3 py-1 rounded-full">Smart AI</span>}
                                    </div>
                                    {isNew && (
                                        <div onClick={e => e.preventDefault()} className="mb-6">
                                            <Link
                                                href={`/automations/${automation.id}`}
                                                className="flex items-center justify-center gap-2 w-full h-10 bg-primary text-white text-[11px] font-bold uppercase tracking-widest rounded-2xl hover:bg-primary/90 transition-all"
                                            >
                                                <Zap className="w-3.5 h-3.5" /> Setup Flow to Activate
                                            </Link>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between pt-6 border-t border-border">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${automation.active ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{automation.active ? 'Active' : 'Paused'}</span>
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">{new Date(automation.createdAt).toLocaleDateString()}</span>
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
        <div className="bg-white border border-border rounded-[48px] p-24 text-center flex flex-col items-center">
            <div className="w-24 h-24 bg-secondary rounded-[40px] flex items-center justify-center mb-8">
                <Zap className="w-10 h-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-3xl font-bold tracking-tighter text-foreground mb-4">
                {hasSearch ? 'No flows found' : 'Ready to grow?'}
            </h3>
            <p className="text-muted-foreground font-medium max-w-sm mb-10 text-lg">
                {hasSearch
                    ? 'Try adjusting your search filters to find what you are looking for.'
                    : 'Create your first automated flow and start scaling your Instagram engagement today.'}
            </p>
            {!hasSearch && (
                <Link
                    href="/automations/new"
                    className="flex items-center gap-3 h-16 px-10 bg-primary text-white font-bold rounded-full hover:scale-105 active:scale-95 transition-all text-lg shadow-xl shadow-primary/20"
                >
                    <Plus className="w-5 h-5" />
                    Start First Flow
                </Link>
            )}
        </div>
    );
}
