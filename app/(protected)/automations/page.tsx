import { currentUser } from '@clerk/nextjs/server';
import { onAuthenticatedUser } from '@/actions/user';
import { Plus, Command, MessageSquare, Play } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { client } from '@/lib/db'

const prisma = client;

export default async function AutomationsPage() {
    const user = await onAuthenticatedUser();
    if (!user || !user.id) redirect('/sign-in'); // Should be handled by helper but safe guard

    // Automations are now available on the user object directly due to 'include' in helper? 
    // Wait, the helper includes integrations/subscriptions but NOT automations.
    // Let's modify the helper or just fetch automations here. 
    // Actually, looking at the previous code, it fetched automations with triggers/listeners.
    // The helper does NOT include automations. So we should fetch them separately or update helper.
    // To match original functionality without over-fetching in helper for all protected pages, let's fetch automations here.

    const automations = await prisma.automation.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: { trigger: true, listener: true }
    });

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Automations</h1>
                    <p className="text-slate-500 mt-2">Manage your Instagram reply flows.</p>
                </div>
                <Link
                    href="/automations/new"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-sm hover:shadow-md"
                >
                    <Plus className="w-5 h-5" />
                    Create Automation
                </Link>
            </div>

            {automations.length === 0 ? (
                <div className="bg-white border rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
                        <Play className="w-8 h-8 ml-1" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No Automations Yet</h3>
                    <p className="text-slate-500 max-w-sm mb-8">
                        Create your first automation to start responding to comments and DMs automatically.
                    </p>
                    <Link
                        href="/automations/new"
                        className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
                    >
                        Create Automation
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {automations.map((automation) => (
                        <Link
                            key={automation.id}
                            href={`/automations/${automation.id}`}
                            className="group bg-white border hover:border-blue-500 hover:ring-1 hover:ring-blue-500 rounded-2xl p-5 transition-all shadow-sm hover:shadow-md cursor-pointer block"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-2 rounded-lg ${automation.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                    <Command className="w-5 h-5" />
                                </div>
                                {automation.active && (
                                    <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                        active
                                    </span>
                                )}
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2 truncate">
                                {automation.name}
                            </h3>
                            <div className="flex items-center text-xs text-slate-500 gap-4">
                                <span className="flex items-center gap-1">
                                    <MessageSquare className="w-3 h-3" />
                                    {automation.listener ? 'Replying' : 'No action'}
                                </span>
                                <span>
                                    {new Date(automation.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
