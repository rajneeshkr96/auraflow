'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Activity, CheckCircle2, XCircle, Clock, Filter, RefreshCw,
  ChevronDown, Search, Play, AlertTriangle, Bot, Zap, Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogEntry {
  id: string;
  automationId: string;
  automationName: string;
  trigger: string;
  action: string;
  status: 'success' | 'failed' | 'skipped' | 'running';
  triggeredAt: string;
  durationMs?: number;
  error?: string;
  metadata?: Record<string, string>;
}

const STATUS_STYLES: Record<string, string> = {
  success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  failed:  'bg-red-100 text-red-700 border-red-200',
  skipped: 'bg-slate-100 text-slate-600 border-slate-200',
  running: 'bg-blue-100 text-blue-700 border-blue-200',
};

const STATUS_ICONS: Record<string, any> = {
  success: CheckCircle2,
  failed:  XCircle,
  skipped: AlertTriangle,
  running: Play,
};

// Generate realistic demo logs
function generateDemoLogs(): LogEntry[] {
  const automations = [
    { id: 'auto-1', name: 'Instagram DM Reply Bot', trigger: 'Comment contains #freebie', action: 'Send DM template' },
    { id: 'auto-2', name: 'Story Reply Engagement', trigger: 'Story reply received', action: 'Send follow-up DM' },
    { id: 'auto-3', name: 'New Follower Welcome', trigger: 'New follower event', action: 'Send welcome message' },
    { id: 'auto-4', name: 'Keyword Comment Auto-Like', trigger: 'Comment contains keyword', action: 'Like comment + reply' },
  ];

  const statuses: Array<LogEntry['status']> = ['success', 'success', 'success', 'failed', 'skipped', 'success'];
  const logs: LogEntry[] = [];

  for (let i = 0; i < 40; i++) {
    const auto = automations[i % automations.length];
    const status = statuses[i % statuses.length];
    const minsAgo = i * 17 + Math.floor(Math.random() * 10);
    logs.push({
      id: `log-${i}`,
      automationId: auto.id,
      automationName: auto.name,
      trigger: auto.trigger,
      action: auto.action,
      status,
      triggeredAt: new Date(Date.now() - minsAgo * 60 * 1000).toISOString(),
      durationMs: status !== 'skipped' ? Math.floor(Math.random() * 1800) + 200 : undefined,
      error: status === 'failed' ? 'Instagram API rate limit exceeded (429). Retry after 60s.' : undefined,
      metadata: status === 'success' ? { user: `@user_${1000 + i}`, msgId: `dm_${Date.now() + i}` } : undefined,
    });
  }
  return logs;
}

function LogRow({ log, onClick, selected }: { log: LogEntry; onClick: () => void; selected: boolean }) {
  const StatusIcon = STATUS_ICONS[log.status];
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-start gap-4 px-4 py-3.5 border-b border-border hover:bg-secondary/40 cursor-pointer transition-colors',
        selected && 'bg-secondary/70'
      )}
    >
      {/* Status icon */}
      <div className={cn('w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 border', STATUS_STYLES[log.status])}>
        <StatusIcon size={13} />
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold truncate">{log.automationName}</p>
          <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full border capitalize', STATUS_STYLES[log.status])}>
            {log.status}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          <span className="font-medium">Trigger:</span> {log.trigger} → <span className="font-medium">Action:</span> {log.action}
        </p>
        {log.error && <p className="text-xs text-red-500 mt-1 truncate">{log.error}</p>}
      </div>

      {/* Right info */}
      <div className="text-right shrink-0">
        <p className="text-xs text-muted-foreground">{new Date(log.triggeredAt).toLocaleTimeString()}</p>
        {log.durationMs && (
          <p className="text-[10px] text-muted-foreground mt-0.5">{log.durationMs}ms</p>
        )}
      </div>
    </div>
  );
}

function LogDetail({ log, onClose }: { log: LogEntry; onClose: () => void }) {
  const StatusIcon = STATUS_ICONS[log.status];
  return (
    <div className="border-l border-border h-full flex flex-col bg-background">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Execution Detail</p>
        <button onClick={onClose} className="w-6 h-6 rounded flex items-center justify-center hover:bg-secondary text-muted-foreground text-sm">✕</button>
      </div>
      <div className="p-4 space-y-4 overflow-y-auto flex-1">
        {/* Status */}
        <div className={cn('flex items-center gap-2.5 px-4 py-3 rounded-xl border', STATUS_STYLES[log.status])}>
          <StatusIcon size={16} />
          <div>
            <p className="font-bold text-sm capitalize">{log.status}</p>
            {log.durationMs && <p className="text-xs opacity-70">{log.durationMs}ms execution time</p>}
          </div>
        </div>

        {/* Metadata rows */}
        {[
          { label: 'Automation', value: log.automationName },
          { label: 'Trigger', value: log.trigger },
          { label: 'Action', value: log.action },
          { label: 'Time', value: new Date(log.triggeredAt).toLocaleString() },
          { label: 'Log ID', value: log.id },
        ].map(row => (
          <div key={row.label}>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{row.label}</p>
            <p className="text-sm font-medium bg-secondary rounded-lg px-3 py-2">{row.value}</p>
          </div>
        ))}

        {/* Error */}
        {log.error && (
          <div>
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1">Error</p>
            <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-sm text-red-700 font-mono">{log.error}</div>
          </div>
        )}

        {/* Metadata */}
        {log.metadata && Object.keys(log.metadata).length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Payload</p>
            <div className="bg-secondary rounded-xl p-3 space-y-1">
              {Object.entries(log.metadata).map(([k, v]) => (
                <div key={k} className="flex gap-2 text-xs font-mono">
                  <span className="text-primary font-bold">{k}:</span>
                  <span className="text-muted-foreground">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExecutionLogsPage() {
  const [logs] = useState<LogEntry[]>(generateDemoLogs);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selected, setSelected] = useState<LogEntry | null>(null);

  const stats = {
    total: logs.length,
    success: logs.filter(l => l.status === 'success').length,
    failed:  logs.filter(l => l.status === 'failed').length,
    skipped: logs.filter(l => l.status === 'skipped').length,
  };

  const filtered = logs.filter(log => {
    const matchSearch = !search ||
      log.automationName.toLowerCase().includes(search.toLowerCase()) ||
      log.trigger.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Monitoring</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Execution Logs</h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time log of every automation trigger and action</p>
        </div>
        <button className="h-10 px-5 rounded-full border border-border bg-background text-sm font-bold flex items-center gap-2 hover:bg-secondary transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Runs', value: stats.total, icon: Activity, color: 'bg-violet-100 text-violet-600' },
          { label: 'Successful', value: stats.success, icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-600' },
          { label: 'Failed', value: stats.failed, icon: XCircle, color: 'bg-red-100 text-red-600' },
          { label: 'Skipped', value: stats.skipped, icon: AlertTriangle, color: 'bg-amber-100 text-amber-600' },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3">
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', s.color)}>
              <s.icon size={16} />
            </div>
            <div>
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main panel */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 p-3 border-b border-border flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search automations…"
              className="w-full h-9 pl-8 pr-4 text-sm bg-secondary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex gap-1 p-1 bg-secondary rounded-xl border border-border">
            {(['all', 'success', 'failed', 'skipped'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all',
                  statusFilter === s ? 'bg-background shadow-sm text-foreground border border-border' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {s === 'all' ? `All (${stats.total})` : s}
              </button>
            ))}
          </div>
        </div>

        {/* Split view */}
        <div className={cn('grid', selected ? 'grid-cols-1 md:grid-cols-[1fr_340px]' : 'grid-cols-1')}>
          {/* Log list */}
          <div className="overflow-y-auto max-h-[560px]">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                <Activity size={36} className="opacity-20" />
                <p className="text-sm font-semibold">No logs found</p>
              </div>
            ) : (
              filtered.map(log => (
                <LogRow key={log.id} log={log} selected={selected?.id === log.id} onClick={() => setSelected(selected?.id === log.id ? null : log)} />
              ))
            )}
          </div>

          {/* Detail pane */}
          {selected && <LogDetail log={selected} onClose={() => setSelected(null)} />}
        </div>
      </div>
    </div>
  );
}
