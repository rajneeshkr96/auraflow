"use client";

import { useState, useTransition, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Search, Star, Download, Zap, MessageSquare,
  Bot, TrendingUp, Users, Lock, Sparkles, Crown, Loader2,
  CheckCircle2, LayoutGrid, List,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useTransition as useT } from 'react';
import { useTemplate } from '@/actions/templates';
import Link from 'next/link';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tier: string;
  tags: string[];
  featured?: boolean;
  usageCount?: number;
}

interface Category {
  name: string;
  count: number;
  label: string;
}

interface Props {
  templates: Template[];
  categories: Category[];
  userTier?: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const TIER_ORDER = ['FREE', 'STANDARD', 'PRO', 'ENTERPRISE'];

const TIER_CONFIG: Record<string, { label: string; color: string; badgeCls: string; icon: any }> = {
  FREE:       { label: 'Free',       color: '#10b981', badgeCls: 'bg-emerald-100 text-emerald-700',     icon: CheckCircle2 },
  STANDARD:   { label: 'Standard',   color: '#3b82f6', badgeCls: 'bg-blue-100 text-blue-700',           icon: Zap },
  PRO:        { label: 'Pro',        color: '#8b5cf6', badgeCls: 'bg-violet-100 text-violet-700',       icon: Sparkles },
  ENTERPRISE: { label: 'Enterprise', color: '#f59e0b', badgeCls: 'bg-amber-100 text-amber-700',         icon: Crown },
};

const CATEGORY_CONFIG: Record<string, { icon: any; color: string }> = {
  LEAD_GENERATION:   { icon: TrendingUp,    color: 'text-emerald-600' },
  CUSTOMER_SUPPORT:  { icon: MessageSquare, color: 'text-blue-600'    },
  ENGAGEMENT:        { icon: Users,         color: 'text-violet-600'  },
  SALES:             { icon: Zap,           color: 'text-amber-600'   },
  CONTENT_PROMOTION: { icon: Star,          color: 'text-pink-600'    },
};

function canAccess(userTier: string, templateTier: string): boolean {
  const userIdx = TIER_ORDER.indexOf(userTier.toUpperCase());
  const tmplIdx = TIER_ORDER.indexOf(templateTier.toUpperCase());
  return userIdx >= tmplIdx;
}

// ─── TemplateCard ────────────────────────────────────────────────────────────

function TemplateCard({
  template, userTier, onInstalled, compact,
}: {
  template: Template;
  userTier: string;
  onInstalled: (id: string, automationId: string) => void;
  compact?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const accessible = canAccess(userTier, template.tier);
  const tierCfg = TIER_CONFIG[template.tier] || TIER_CONFIG.FREE;
  const TierIcon = tierCfg.icon;
  const catCfg = CATEGORY_CONFIG[template.category] || { icon: Package, color: 'text-foreground' };
  const CategoryIcon = catCfg.icon;

  const handleInstall = () => {
    if (!accessible) {
      toast.error(`Upgrade to ${tierCfg.label} to use this template`, { duration: 4000 });
      return;
    }
    startTransition(async () => {
      try {
        const { useTemplate } = await import('@/actions/templates');
        const result = await useTemplate(template.id);
        if (result.success) {
          toast.success('Automation created! Check your automations page.', {
            action: { label: 'View', onClick: () => window.location.href = `/automations/${result.data?.id}` },
          });
          onInstalled(template.id, result.data?.id || '');
        } else {
          toast.error(result.error || 'Failed to install template');
        }
      } catch {
        toast.error('Failed to install template');
      }
    });
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn(
          "flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all",
          !accessible && "opacity-60"
        )}
      >
        <div className={cn("w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0", catCfg.color)}>
          <CategoryIcon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate">{template.name}</p>
          <p className="text-xs text-muted-foreground truncate">{template.description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", tierCfg.badgeCls)}>{tierCfg.label}</span>
          <button
            onClick={handleInstall}
            disabled={isPending}
            className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : accessible ? <Download className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group h-full"
    >
      <div className={cn(
        "relative h-full flex flex-col rounded-[28px] border border-border bg-card p-6 transition-all duration-300",
        "hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/30",
        !accessible && "opacity-70"
      )}>
        {/* Lock overlay for higher tiers */}
        {!accessible && (
          <div className="absolute inset-0 rounded-[28px] bg-background/60 backdrop-blur-[1px] flex flex-col items-center justify-center z-10 gap-2">
            <div className="w-12 h-12 rounded-2xl bg-foreground flex items-center justify-center">
              <Lock className="w-5 h-5 text-background" />
            </div>
            <p className="text-xs font-bold text-foreground">Requires {tierCfg.label}</p>
            <Link href="/subscription" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
              <TierIcon className="w-3 h-3" /> Upgrade
            </Link>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className={cn("w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform", catCfg.color)}>
            <CategoryIcon className="w-6 h-6" />
          </div>
          <div className="flex items-center gap-2">
            {template.featured && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Featured
              </span>
            )}
            <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full", tierCfg.badgeCls)}>
              {tierCfg.label}
            </span>
          </div>
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold tracking-tight mb-2 group-hover:text-primary transition-colors">
          {template.name}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-5">
          {template.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {(template.tags || []).slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] font-semibold px-2.5 py-1 bg-secondary rounded-full text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Download className="w-3.5 h-3.5" />
            <span>{(template.usageCount || 0).toLocaleString()} installs</span>
          </div>
          <button
            onClick={handleInstall}
            disabled={isPending}
            className={cn(
              "flex items-center gap-2 h-9 px-5 rounded-full text-xs font-bold transition-all",
              accessible
                ? "bg-foreground text-background hover:bg-primary hover:scale-105 active:scale-95"
                : "bg-secondary text-muted-foreground cursor-not-allowed"
            )}
          >
            {isPending ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Installing...</>
            ) : accessible ? (
              <><Download className="w-3.5 h-3.5" /> Install</>
            ) : (
              <><Lock className="w-3.5 h-3.5" /> Locked</>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function TemplateMarketplace({ templates, categories, userTier = 'FREE' }: Props) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [installed, setInstalled] = useState<Record<string, string>>({});

  const filtered = useMemo(() => templates.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !search || t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      (t.tags || []).some(tag => tag.toLowerCase().includes(q));
    const matchCat = category === 'ALL' || t.category === category;
    const matchTier = tierFilter === 'ALL' || t.tier === tierFilter;
    return matchSearch && matchCat && matchTier;
  }), [templates, search, category, tierFilter]);

  const featured = useMemo(() => templates.filter(t => t.featured), [templates]);

  const stats = useMemo(() => ({
    total: templates.length,
    free: templates.filter(t => t.tier === 'FREE').length,
    installs: templates.reduce((s, t) => s + (t.usageCount || 0), 0),
  }), [templates]);

  return (
    <div className="space-y-10 w-full pb-10">
      {/* Hero header */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Template Library</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none text-foreground">
            Automation <br />
            <span className="text-muted-foreground">Templates.</span>
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl">
            One-click automation blueprints. Built by experts, ready to deploy.
          </p>
        </div>

        {/* Stats pills */}
        <div className="flex flex-wrap gap-3 shrink-0">
          {[
            { label: 'Templates', value: stats.total, icon: Package },
            { label: 'Free', value: stats.free, icon: CheckCircle2 },
            { label: 'Installs', value: stats.installs.toLocaleString(), icon: Download },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2 px-5 h-11 bg-secondary border border-border rounded-full text-xs font-bold text-muted-foreground">
              <s.icon className="w-3.5 h-3.5 text-primary" />
              <span className="text-foreground">{s.value}</span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tier progress bar */}
      <div className="flex items-center gap-2 p-4 rounded-2xl border border-border bg-secondary/30">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mr-2">Your Plan:</span>
        {TIER_ORDER.map((t, i) => {
          const cfg = TIER_CONFIG[t];
          const unlocked = canAccess(userTier, t);
          const active = t === userTier.toUpperCase();
          return (
            <div key={t} className="flex items-center gap-2">
              <span className={cn(
                "flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all",
                active ? "border-primary bg-primary text-white" :
                  unlocked ? "border-border bg-secondary text-foreground" :
                    "border-border/50 bg-transparent text-muted-foreground opacity-50"
              )}>
                <cfg.icon className="w-3 h-3" /> {cfg.label}
              </span>
              {i < TIER_ORDER.length - 1 && <div className="w-4 h-0.5 bg-border" />}
            </div>
          );
        })}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="w-full h-12 pl-11 pr-4 rounded-full border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 shrink-0">
          {[{ name: 'ALL', label: 'All' }, ...categories].map(cat => (
            <button
              key={cat.name}
              onClick={() => setCategory(cat.name)}
              className={cn(
                "shrink-0 h-10 px-4 rounded-full text-xs font-bold border transition-all",
                category === cat.name
                  ? "bg-foreground text-background border-foreground"
                  : "bg-secondary border-border text-muted-foreground hover:border-foreground/30"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Layout toggle */}
        <div className="flex items-center gap-1 p-1 bg-secondary rounded-xl shrink-0">
          <button
            onClick={() => setLayout('grid')}
            className={cn("p-2 rounded-lg transition-all", layout === 'grid' ? "bg-background shadow-sm" : "text-muted-foreground")}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setLayout('list')}
            className={cn("p-2 rounded-lg transition-all", layout === 'list' ? "bg-background shadow-sm" : "text-muted-foreground")}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Featured section */}
      {!search && category === 'ALL' && featured.length > 0 && (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <h2 className="text-2xl font-bold tracking-tight">Featured Templates</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.slice(0, 3).map(t => (
              <TemplateCard
                key={t.id}
                template={t}
                userTier={userTier}
                onInstalled={(id, autId) => setInstalled(prev => ({ ...prev, [id]: autId }))}
              />
            ))}
          </div>
        </div>
      )}

      {/* All templates */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">
            {search || category !== 'ALL' ? 'Search Results' : 'All Templates'}
          </h2>
          <span className="text-sm text-muted-foreground">{filtered.length} template{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
            <Package className="w-12 h-12 opacity-20" />
            <p className="font-semibold">No templates found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : layout === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filtered.map(t => (
                <TemplateCard
                  key={t.id}
                  template={t}
                  userTier={userTier}
                  onInstalled={(id, autId) => setInstalled(prev => ({ ...prev, [id]: autId }))}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filtered.map(t => (
                <TemplateCard
                  key={t.id}
                  template={t}
                  userTier={userTier}
                  onInstalled={(id, autId) => setInstalled(prev => ({ ...prev, [id]: autId }))}
                  compact
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}