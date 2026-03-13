"use client";

import { useState, useRef, useEffect } from 'react';
import { Pencil, Check, X, Loader2 } from 'lucide-react';
import { updateAutomation } from '@/actions/automations';
import { toast } from 'sonner';

export default function EditableName({ automationId, initialName }: { automationId: string; initialName: string }) {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(initialName);
    const [saving, setSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editing) inputRef.current?.select();
    }, [editing]);

    const handleSave = async () => {
        const trimmed = name.trim();
        if (!trimmed) {
            setName(initialName);
            setEditing(false);
            return;
        }
        if (trimmed === initialName) {
            setEditing(false);
            return;
        }
        setSaving(true);
        const result = await updateAutomation(automationId, { name: trimmed });
        setSaving(false);
        if (result.success) {
            setEditing(false);
            toast.success('Automation renamed');
        } else {
            toast.error(result.error || 'Failed to rename');
        }
    };

    const handleCancel = () => {
        setName(initialName);
        setEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') handleCancel();
    };

    if (editing) {
        return (
            <div className="flex items-center gap-2">
                <input
                    ref={inputRef}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="text-xl font-bold text-slate-900 bg-transparent border-b-2 border-violet-400 outline-none px-0 py-0.5 min-w-0 w-64"
                    disabled={saving}
                    maxLength={100}
                    autoFocus
                />
                {saving ? (
                    <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                ) : (
                    <>
                        <button onClick={handleSave} className="p-1 rounded-md hover:bg-emerald-50 text-emerald-600 transition-colors">
                            <Check className="w-4 h-4" />
                        </button>
                        <button onClick={handleCancel} className="p-1 rounded-md hover:bg-slate-100 text-slate-400 transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </>
                )}
            </div>
        );
    }

    return (
        <button
            onClick={() => setEditing(true)}
            className="group flex items-center gap-2 text-xl font-bold text-slate-900 hover:text-violet-700 transition-colors"
            title="Click to rename"
        >
            {name}
            <Pencil className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
    );
}
