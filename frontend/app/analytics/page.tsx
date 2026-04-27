'use client';

import React, { useEffect, useState } from 'react';
import { analyticsService } from '@/services/analytics.service';
import { AnalyticsStatsDto } from '@/types/api';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  Loader2,
  Calendar,
  Send,
  Eye,
  MousePointer2,
  AlertCircle,
  ShieldCheck,
  UserX,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStatsDto | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const data = await analyticsService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    async function loadData() {
      try {
        const data = await analyticsService.getStats();
        if (isMounted) {
          setStats(data);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch stats', error);
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const metrics = [
    { label: 'Total Sent', value: stats?.totalSent || 0, change: '+12.5%', trend: 'up', icon: Send },
    { label: 'Total Opened', value: stats?.totalOpened || 0, change: '+5.2%', trend: 'up', icon: Eye },
    { label: 'Total Clicked', value: stats?.totalClicked || 0, change: '-2.1%', trend: 'down', icon: MousePointer2 },
    { label: 'Delivery Rate', value: `${(stats?.deliveryRate || 0).toFixed(1)}%`, change: '+0.1%', trend: 'up', icon: ShieldCheck },
  ];

  const rates = [
    { label: 'Open Rate', value: stats?.openRate || 0, color: 'bg-soft-linen' },
    { label: 'Click Rate', value: stats?.clickThroughRate || 0, color: 'bg-silver' },
    { label: 'Unsubscribe Rate', value: stats?.unsubscribeRate || 0, color: 'bg-onyx-600' },
    { label: 'Bounce Rate', value: stats?.bounceRate || 0, color: 'bg-graphite' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div
           initial={{ opacity: 0, y: -10 }}
           animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-soft-linen tracking-tight">Performance Analytics</h1>
          <p className="text-silver text-sm mt-1">Monitor your campaign effectiveness and audience engagement.</p>
        </motion.div>
        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-onyx border border-onyx-400 rounded-lg">
            <button className="px-4 py-1.5 text-xs font-semibold bg-onyx-400 text-soft-linen rounded-md shadow-sm">Real-time</button>
            <button className="px-4 py-1.5 text-xs font-semibold text-silver hover:text-white-smoke transition-colors">Historical</button>
          </div>
          <Button variant="secondary" size="sm" leftIcon={<Calendar className="w-4 h-4" />}>
            Last 30 Days
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-6 bg-onyx border border-onyx-400 rounded-xl hover:border-onyx-300 transition-all shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-onyx-400 rounded-lg">
                <metric.icon className="w-4 h-4 text-soft-linen" />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border",
                metric.trend === 'up' ? "text-soft-linen bg-soft-linen/10 border-soft-linen/20" : "text-silver bg-onyx-400 border-onyx-300"
              )}>
                {metric.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {metric.change}
              </div>
            </div>
            <p className="text-xs font-semibold text-silver uppercase tracking-wider">{metric.label}</p>
            <h3 className="text-3xl font-bold text-soft-linen mt-1">{loading ? '—' : metric.value}</h3>
            <div className="mt-4 h-1 bg-onyx rounded-full overflow-hidden">
               <motion.div initial={{ width: 0 }} animate={{ width: '70%' }} className={cn("h-full", metric.trend === 'up' ? 'bg-soft-linen' : 'bg-silver')} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-onyx border border-onyx-400 rounded-xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-soft-linen">Engagement Trends</h3>
              <p className="text-xs text-silver mt-1">Daily interaction volume across all segments</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-soft-linen"></div>
                <span className="text-[10px] font-bold text-silver uppercase tracking-widest">Opens</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-onyx-600"></div>
                <span className="text-[10px] font-bold text-silver uppercase tracking-widest">Baselines</span>
              </div>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between gap-2 px-2">
            {[40, 60, 45, 90, 65, 80, 50, 70, 85, 60, 40, 75].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full">
                <div className="w-full bg-onyx/50 rounded-t-md relative group h-full flex flex-col justify-end border-x border-t border-onyx-400/50">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${val}%` }}
                    className="w-full bg-soft-linen/20 group-hover:bg-soft-linen/40 transition-all rounded-t-sm relative"
                  >
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-soft-linen/50" />
                  </motion.div>
                </div>
                <span className="text-[9px] font-bold text-silver uppercase tracking-tighter">W{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-onyx border border-onyx-400 rounded-xl p-8 shadow-sm">
          <h3 className="text-lg font-bold text-soft-linen mb-8">Health Metrics</h3>
          <div className="space-y-8">
            {rates.map((rate) => (
              <div key={rate.label} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-silver uppercase tracking-wider">{rate.label}</span>
                  <span className="text-base font-bold text-soft-linen">{loading ? '—' : `${rate.value.toFixed(1)}%`}</span>
                </div>
                <div className="h-1.5 bg-onyx rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${rate.value}%` }}
                    className={cn("h-full transition-all duration-1000", rate.color)}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 p-4 bg-onyx-100/50 rounded-lg border border-onyx-400 flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-soft-linen shrink-0 mt-0.5" />
            <p className="text-[11px] text-silver leading-relaxed italic">
              All delivery thresholds are within standard industry benchmarks. System health is optimal.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-onyx border border-onyx-400 rounded-xl p-6 relative overflow-hidden group">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-bold text-silver uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-4 h-4" /> Live System Logs
          </h4>
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-silver/50"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-silver/50 animate-pulse"></span>
          </div>
        </div>
        <div className="font-mono text-[11px] space-y-1.5 opacity-60 group-hover:opacity-100 transition-opacity h-32 overflow-y-auto scrollbar-hide">
          <p className="text-soft-linen opacity-90">[INFO] Performance metrics synchronized successfully.</p>
          <p className="text-silver">[DEBUG] Cache flushed for global analytics dashboard.</p>
          <p className="text-soft-linen">[DATA] {stats?.totalSent || 0} emails processed across all regions.</p>
          <p className="text-white-smoke">[DATA] User interaction tracking system online.</p>
          <p className="text-silver">[DEBUG] Database query optimized for high-volume logs.</p>
          <p className="text-onyx-700">[ERROR] Failed to delivery to {stats?.totalBounced || 0} recipients (Permanent Bounce).</p>
          <p className="text-soft-linen opacity-90">[INFO] Campaign tracking pixels reported 100% resolution.</p>
        </div>
      </div>
    </div>
  );
}
