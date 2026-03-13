"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Palette, LogOut, Trash2, Save, Check, ExternalLink } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { updateUserProfile } from '@/actions/user';

type UserProfile = {
    id?: number;
    name?: string | null;
    email?: string | null;
    subscription?: { plan?: string } | null;
}

export default function SettingsClient({ user }: { user?: UserProfile | null }) {
    const nameParts = user?.name?.split(' ') ?? [];
    const [firstName, setFirstName] = useState(nameParts[0] ?? '');
    const [lastName, setLastName] = useState(nameParts.slice(1).join(' ') ?? '');
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [notifications, setNotifications] = useState({
        emailOnTrigger: true,
        emailWeeklyReport: false,
        inAppAlerts: true,
        marketingEmails: false,
    });

    const plan = user?.subscription?.plan || 'Free';
    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : (user?.email?.[0]?.toUpperCase() || 'U');

    const handleSave = async () => {
        setSaving(true);
        const fullName = [firstName, lastName].filter(Boolean).join(' ');
        const result = await updateUserProfile({ name: fullName || undefined });
        setSaving(false);
        if (result.success) {
            setSaved(true);
            toast.success('Profile saved!');
            setTimeout(() => setSaved(false), 2000);
        } else {
            toast.error(result.error || 'Failed to save');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-6"
        >
            <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
                <p className="text-slate-500 text-sm mt-0.5">Manage your account preferences and notifications.</p>
            </div>

            <Tabs defaultValue="profile">
                <TabsList className="mb-2">
                    <TabsTrigger value="profile"><User className="w-3.5 h-3.5 mr-1.5" />Profile</TabsTrigger>
                    <TabsTrigger value="notifications"><Bell className="w-3.5 h-3.5 mr-1.5" />Notifications</TabsTrigger>
                    <TabsTrigger value="security"><Shield className="w-3.5 h-3.5 mr-1.5" />Security</TabsTrigger>
                    <TabsTrigger value="account"><Palette className="w-3.5 h-3.5 mr-1.5" />Account</TabsTrigger>
                </TabsList>

                {/* PROFILE */}
                <TabsContent value="profile">
                    <Card className="border border-slate-200/60 shadow-none">
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Update your personal details and public profile.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="flex items-center gap-5">
                                <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-lg shadow-violet-500/20">
                                    {initials}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-700">Profile Picture</p>
                                    <p className="text-xs text-slate-400 mt-0.5">JPG, PNG up to 2MB</p>
                                    <button className="mt-2 text-xs text-violet-600 hover:text-violet-700 font-semibold border border-violet-200 bg-violet-50 px-3 py-1.5 rounded-lg transition-colors">
                                        Upload Photo
                                    </button>
                                </div>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label>First Name</Label>
                                    <Input
                                        placeholder="John"
                                        value={firstName}
                                        onChange={e => setFirstName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Last Name</Label>
                                    <Input
                                        placeholder="Doe"
                                        value={lastName}
                                        onChange={e => setLastName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Email Address</Label>
                                <Input
                                    type="email"
                                    placeholder="john@example.com"
                                    value={user?.email ?? ''}
                                    disabled
                                    className="bg-slate-50 text-slate-500"
                                />
                                <p className="text-[11px] text-slate-400">Email cannot be changed here. Contact support.</p>
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="bg-violet-600 hover:bg-violet-700 text-white flex items-center gap-2"
                                >
                                    {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                                    {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* NOTIFICATIONS */}
                <TabsContent value="notifications">
                    <Card className="border border-slate-200/60 shadow-none">
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription>Choose what you want to be notified about.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-0">
                            {[
                                { key: 'emailOnTrigger', label: 'Automation Triggered', desc: 'Get an email when your automation fires' },
                                { key: 'emailWeeklyReport', label: 'Weekly Report', desc: 'Summary of your automations every Monday' },
                                { key: 'inAppAlerts', label: 'In-App Alerts', desc: 'Show notifications within Auraflow' },
                                { key: 'marketingEmails', label: 'Product Updates', desc: 'News and feature announcements' },
                            ].map((item, i) => (
                                <>
                                    <div key={item.key} className="flex items-center justify-between py-4">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-700">{item.label}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                                        </div>
                                        <Switch
                                            checked={notifications[item.key as keyof typeof notifications]}
                                            onCheckedChange={v => {
                                                setNotifications(p => ({ ...p, [item.key]: v }));
                                                toast.success(v ? `${item.label} enabled` : `${item.label} disabled`);
                                            }}
                                        />
                                    </div>
                                    {i < 3 && <Separator />}
                                </>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* SECURITY */}
                <TabsContent value="security">
                    <Card className="border border-slate-200/60 shadow-none">
                        <CardHeader>
                            <CardTitle>Security</CardTitle>
                            <CardDescription>Manage your password and login settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
                                        <Shield className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">Account Protected</p>
                                        <p className="text-xs text-slate-500">Your account is managed by Codeswayam Auth</p>
                                    </div>
                                </div>
                                <Badge variant="success">Secured</Badge>
                            </div>
                            <Separator />
                            <div className="space-y-3">
                                <p className="text-sm font-semibold text-slate-700">Change Password</p>
                                <div className="space-y-2">
                                    <Input type="password" placeholder="Current password" />
                                    <Input type="password" placeholder="New password" />
                                    <Input type="password" placeholder="Confirm new password" />
                                </div>
                                <Button className="bg-slate-900 hover:bg-slate-800 text-white">Update Password</Button>
                            </div>
                            <Separator />
                            <div>
                                <p className="text-sm font-semibold text-slate-700 mb-2">Connected Sessions</p>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-700">Current Session</p>
                                        <p className="text-[11px] text-slate-400">Chrome on Windows · Active now</p>
                                    </div>
                                    <Badge variant="success" className="text-[10px]">Active</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ACCOUNT */}
                <TabsContent value="account">
                    <div className="space-y-4">
                        <Card className="border border-slate-200/60 shadow-none">
                            <CardHeader>
                                <CardTitle>Subscription Plan</CardTitle>
                                <CardDescription>You are on the {plan} plan.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between p-4 bg-linear-to-r from-violet-50 to-blue-50 rounded-xl border border-violet-200">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-slate-800">{plan} Plan</p>
                                            <Badge variant="secondary">Current</Badge>
                                        </div>
                                        <ul className="text-xs text-slate-500 mt-1.5 space-y-0.5">
                                            <li>· Up to 3 automations</li>
                                            <li>· Static replies only</li>
                                            <li>· Basic analytics</li>
                                        </ul>
                                    </div>
                                    <button className="px-4 py-2 bg-linear-to-r from-violet-600 to-blue-600 text-white text-sm font-bold rounded-xl hover:from-violet-500 hover:to-blue-500 transition-all shadow-md shadow-violet-500/20 flex items-center gap-2">
                                        Upgrade <ExternalLink className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-red-200/60 shadow-none">
                            <CardHeader>
                                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                                <CardDescription>Irreversible actions. Proceed with caution.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between p-4 bg-red-50/50 rounded-xl border border-red-100">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">Delete Account</p>
                                        <p className="text-xs text-slate-400 mt-0.5">Permanently delete your account and all data</p>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="flex items-center gap-1.5"
                                        onClick={() => toast.error('Please contact support to delete your account.')}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Delete
                                    </Button>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">Sign Out</p>
                                        <p className="text-xs text-slate-400 mt-0.5">Sign out of your current session</p>
                                    </div>
                                    <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                                        <LogOut className="w-3.5 h-3.5" />
                                        Sign Out
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </motion.div>
    );
}
