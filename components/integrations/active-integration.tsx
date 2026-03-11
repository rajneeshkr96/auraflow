"use client";

import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface ActiveIntegrationProps {
    id: string;
    name: string;
    detail: string;
    type: string;
}

export default function ActiveIntegration({ id, name, detail, type }: ActiveIntegrationProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleDisconnect = async () => {
        if (!confirm(`Disconnect ${name}? Your automations using this integration will stop working.`)) return;
        setLoading(true);
        try {
            toast.info(`To reconnect ${name}, use the connect button above.`);
        } catch (e) {
            toast.error(`Failed to disconnect ${name}`);
        }
        setLoading(false);
    };

    return (
        <button
            onClick={handleDisconnect}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 border border-red-200 hover:border-red-300 bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
        >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Disconnect
        </button>
    );
}
