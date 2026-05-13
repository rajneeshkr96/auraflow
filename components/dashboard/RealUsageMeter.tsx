"use client";

import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@codeswayam/ui';
import { Button } from '@/components/ui/button';
import { Zap, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getSubscriptionLimits } from '@/lib/subscription-limits';

interface UsageStats {
  automations: number;
  dmsThisMonth: number;
  commentsThisMonth: number;
  triggersThisMonth: number;
  resetDate: Date;
}

export default function RealUsageMeter() {
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  // TODO: Get actual user tier from subscription
  const userTier = 'free';
  const limits = getSubscriptionLimits(userTier);

  useEffect(() => {
    async function loadUsage() {
      try {
        // Simulate API call for now
        const mockUsage: UsageStats = {
          automations: 3,
          dmsThisMonth: 47,
          commentsThisMonth: 12,
          triggersThisMonth: 89,
          resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
        };
        setUsage(mockUsage);
      } catch (error) {
        console.error('Failed to load usage stats:', error);
      } finally {
        setLoading(false);
      }
    }
    loadUsage();
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-border rounded-[32px] p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-secondary rounded w-1/3" />
          <div className="h-8 bg-secondary rounded w-1/2" />
          <div className="h-2 bg-secondary rounded" />
        </div>
      </div>
    );
  }

  if (!usage) return null;

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((current / limit) * 100, 100);
  };

  const isNearLimit = (current: number, limit: number) => {
    if (limit === -1) return false;
    return current / limit >= 0.8;
  };

  const isOverLimit = (current: number, limit: number) => {
    if (limit === -1) return false;
    return current >= limit;
  };

  const usageItems = [
    {
      label: 'Automations',
      current: usage.automations,
      limit: limits.automations,
      icon: Zap
    },
    {
      label: 'DMs This Month',
      current: usage.dmsThisMonth,
      limit: limits.dmsPerMonth,
      icon: Zap
    },
    {
      label: 'Comments This Month',
      current: usage.commentsThisMonth,
      limit: limits.commentsPerMonth,
      icon: Zap
    }
  ];

  const hasWarnings = usageItems.some(item => isNearLimit(item.current, item.limit));
  const hasErrors = usageItems.some(item => isOverLimit(item.current, item.limit));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-border rounded-[32px] p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold tracking-tight">Usage This Month</h3>
          <p className="text-sm text-muted-foreground">
            Resets on {new Date(usage.resetDate).toLocaleDateString()}
          </p>
        </div>
        
        {(hasWarnings || hasErrors) && (
          <Badge variant={hasErrors ? "destructive" : "secondary"} className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {hasErrors ? 'Limit Reached' : 'Near Limit'}
          </Badge>
        )}
      </div>

      <div className="space-y-4">
        {usageItems.map((item) => {
          const percentage = getUsagePercentage(item.current, item.limit);
          const isWarning = isNearLimit(item.current, item.limit);
          const isError = isOverLimit(item.current, item.limit);
          
          return (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.label}</span>
                <span className={`font-bold ${
                  isError ? 'text-red-600' : isWarning ? 'text-orange-600' : 'text-muted-foreground'
                }`}>
                  {item.current}{item.limit !== -1 ? ` / ${item.limit}` : ' (Unlimited)'}
                </span>
              </div>
              
              {item.limit !== -1 && (
                <Progress 
                  value={percentage} 
                  className={`h-2 ${
                    isError ? '[&>div]:bg-red-500' : 
                    isWarning ? '[&>div]:bg-orange-500' : 
                    '[&>div]:bg-primary'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {(hasWarnings || hasErrors) && (
        <div className="pt-4 border-t border-border">
          <Button 
            size="sm" 
            className="w-full rounded-full"
            onClick={() => window.open('/subscription', '_blank')}
          >
            Upgrade Plan
            <ArrowUpRight className="w-3 h-3 ml-2" />
          </Button>
        </div>
      )}
    </motion.div>
  );
}