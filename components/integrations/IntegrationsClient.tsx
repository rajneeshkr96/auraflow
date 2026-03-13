"use client";

import { motion } from 'framer-motion';
import { Instagram, ExternalLink, CheckCircle2, XCircle, RefreshCw, Facebook, Youtube, MessageCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import ActiveIntegration from './active-integration';

interface IntegrationsClientProps {
    instagramIntegration: any | null;
}

const COMING_SOON = [
    { name: 'Facebook', icon: Facebook, emoji: '🔵', desc: 'Automate Facebook DMs and comment replies', color: 'text-blue-600', bg: 'from-blue-500 to-blue-600' },
    { name: 'WhatsApp Business', icon: MessageCircle, emoji: '🟢', desc: 'Auto-reply to WhatsApp Business messages', color: 'text-emerald-600', bg: 'from-emerald-500 to-teal-600' },
    { name: 'YouTube', icon: Youtube, emoji: '🔴', desc: 'Respond to YouTube comments automatically', color: 'text-red-600', bg: 'from-red-500 to-rose-600' },
];

export default function IntegrationsClient({ instagramIntegration }: IntegrationsClientProps) {
    const isConnected = !!instagramIntegration;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 w-full"
        >
            <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Integrations</h1>
                <p className="text-slate-500 text-sm mt-0.5">Connect your social accounts to start automating.</p>
            </div>

            {/* Instagram */}
            <Card className="border-0 shadow-sm overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-yellow-400 via-orange-500 to-purple-600 flex items-center justify-center">
                            <Instagram className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-base">Instagram</CardTitle>
                            <p className="text-xs text-slate-400 mt-0.5">Automate DMs and comment replies</p>
                        </div>
                    </div>
                    <Badge variant={isConnected ? 'success' : 'secondary'} className="flex items-center gap-1.5">
                        {isConnected ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {isConnected ? 'Connected' : 'Not Connected'}
                    </Badge>
                </CardHeader>
                <CardContent className="pt-0">
                    {isConnected ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                                <div className="w-10 h-10 rounded-full bg-linear-to-br from-yellow-400 via-orange-500 to-purple-600 flex items-center justify-center shrink-0">
                                    <Instagram className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-800">Instagram Connected!</p>
                                    <p className="text-xs text-slate-500">ID: {instagramIntegration?.instagramId}</p>
                                </div>
                                <Link
                                    href="/automations/new"
                                    className="text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1"
                                >
                                    Create Automation <ExternalLink className="w-3 h-3" />
                                </Link>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-slate-700">Integration Details</p>
                                    <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
                                        <Clock className="w-3 h-3" />
                                        Connected {instagramIntegration?.createdAt
                                            ? new Date(instagramIntegration.createdAt).toLocaleDateString()
                                            : 'recently'}
                                    </div>
                                </div>
                                <ActiveIntegration
                                    id={instagramIntegration.id}
                                    name="Instagram"
                                    detail={`@${instagramIntegration?.instagramId}`}
                                    type="INSTAGRAM"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-slate-500">Connect your Instagram Business account to start automating your replies and DMs.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {[
                                    { label: 'Comment Automation', desc: 'Reply to post comments' },
                                    { label: 'DM Automation', desc: 'Auto-reply to messages' },
                                    { label: 'AI Responses', desc: 'Smart AI-powered replies' },
                                ].map(f => (
                                    <div key={f.label} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                                        <p className="text-xs font-bold text-slate-700">{f.label}</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">{f.desc}</p>
                                    </div>
                                ))}
                            </div>
                            <Link
                                href="/api/integrations/instagram/install"
                                prefetch={false}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-orange-500 via-pink-500 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity w-full sm:w-auto"
                            >
                                <Instagram className="w-4 h-4" />
                                Connect Instagram
                                <ExternalLink className="w-4 h-4" />
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Coming Soon */}
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Coming Soon</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {COMING_SOON.map((platform) => (
                        <Card key={platform.name} className="border border-slate-200/60 shadow-none opacity-60">
                            <CardContent className="p-4">
                                <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${platform.bg} flex items-center justify-center mb-3`}>
                                    <platform.icon className="w-5 h-5 text-white" />
                                </div>
                                <p className="font-bold text-slate-800 text-sm">{platform.name}</p>
                                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{platform.desc}</p>
                                <Badge variant="secondary" className="mt-2 text-[10px]">Coming Soon</Badge>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
