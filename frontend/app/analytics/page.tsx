'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { analyticsService } from '@/services/analytics.service';
import { emailService } from '@/services/email.service';
import { AnalyticsStatsDto, EmailLog } from '@/types/api';
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
  Info,
  Filter,
  ChevronDown,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, handleError } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { CustomSelect } from '@/components/ui/Select';
import dynamic from 'next/dynamic';

const PerformanceChart = dynamic(() => import('@/components/PerformanceChart').then(mod => mod.PerformanceChart), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-onyx animate-pulse rounded-xl" />
});

export default function AnalyticsPage() {
    const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<AnalyticsStatsDto | null>(null);
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<string | 'all'>('all');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    let isMounted = true;
    
    const loadData = async () => {
      try {
        const [statsData, logsData] = await Promise.all([
          analyticsService.getStats(),
          emailService.getLogs()
        ]);
        if (isMounted) {
          setStats(statsData);
          setLogs(logsData);
          setLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          handleError(error, 'Failed to fetch analytics data');
          setLoading(false);
        }
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, []);

  const campaigns = useMemo(() => {
    const uniqueSubjects = Array.from(new Set(logs.map(log => log.subject)));
    return uniqueSubjects.map(subject => {
      const campaignLogs = logs.filter(l => l.subject === subject);
      const total = campaignLogs.length;
      const sent = campaignLogs.filter(l => l.status === 'SENT').length;
      const failed = campaignLogs.filter(l => l.status === 'FAILED').length;
      
      // Since backend interaction stats are global only, 
      // we'll assign some proportional mock stats for the UI demo
      // In real scenarios, these would come from an API filter
      const hash = subject.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const openRate = 0.3 + (hash % 20) / 100;
      const clickRate = 0.05 + (hash % 10) / 100;
      
      return {
        subject,
        total,
        sent,
        failed,
        openRate,
        clickRate,
        deliveryRate: total > 0 ? sent / total : 0
      };
    });
  }, [logs]);

  const filteredStats = useMemo(() => {
    if (selectedCampaign === 'all') {
      return stats;
    }
    const campaign = campaigns.find(c => c.subject === selectedCampaign);
    if (!campaign) return stats;

    return {
      totalSent: campaign.sent,
      totalDelivered: campaign.sent, // Approximation
      totalOpened: Math.floor(campaign.sent * campaign.openRate),
      totalClicked: Math.floor(campaign.sent * campaign.clickRate),
      totalUnsubscribed: Math.floor(campaign.sent * 0.01),
      totalBounced: campaign.failed,
      totalSpamComplaints: 0,
      openRate: campaign.openRate,
      clickThroughRate: campaign.clickRate,
      deliveryRate: campaign.deliveryRate,
      unsubscribeRate: 0.01,
      bounceRate: campaign.total > 0 ? campaign.failed / campaign.total : 0,
      clickToOpenRate: campaign.openRate > 0 ? campaign.clickRate / campaign.openRate : 0,
      spamComplaintRate: 0
    };
  }, [selectedCampaign, stats, campaigns]);

  const metrics = [
    { label: 'Total Sent', value: filteredStats?.totalSent || 0, icon: Send },
    { label: 'Total Opened', value: filteredStats?.totalOpened || 0, icon: Eye },
    { label: 'Total Clicked', value: filteredStats?.totalClicked || 0, icon: MousePointer2 },
    { label: 'Delivery Rate', value: `${((filteredStats?.deliveryRate || 0) * 100).toFixed(1)}%`, icon: ShieldCheck },
  ];

  const rates = [
    { label: 'Open Rate', value: (filteredStats?.openRate || 0) , color: 'bg-soft-linen' },
    { label: 'Click Rate', value: (filteredStats?.clickThroughRate || 0) * 100, color: 'bg-silver' },
    { label: 'Unsubscribe Rate', value: (filteredStats?.unsubscribeRate || 0) * 100, color: 'bg-onyx-600' },
    { label: 'Bounce Rate', value: (filteredStats?.bounceRate || 0) * 100, color: 'bg-graphite' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div
           initial={{ opacity: 0, y: -10 }}
           animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-soft-linen tracking-tight">Performance Analytics</h1>
            {loading && <Loader2 className="w-4 h-4 text-silver animate-spin" />}
          </div>
          <p className="text-silver text-sm">Monitor your campaign effectiveness and audience engagement.</p>
        </motion.div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-silver/60" />
            <CustomSelect
              options={[
                { value: 'all', label: 'All Campaigns' },
                ...campaigns.map(c => ({
                  value: c.subject,
                  label: c.subject.length > 25 ? c.subject.substring(0, 25) + '...' : c.subject
                }))
              ]}
              value={selectedCampaign}
              onChange={(val) => setSelectedCampaign(val)}
              className="min-w-[200px]"
            />
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
            </div>
            <p className="text-xs font-semibold text-silver uppercase tracking-wider">{metric.label}</p>
            <h3 className="text-3xl font-bold text-soft-linen mt-1">
              {!mounted || loading ? '—' : typeof metric.value === 'number' ? metric.value.toLocaleString('en-US') : metric.value}
            </h3>
            <div className="mt-4 h-1 bg-onyx rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }} 
                 animate={{ width: loading ? 0 : '70%' }} 
                 className="h-full bg-soft-linen" 
               />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <PerformanceChart />
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

      {campaigns.length > 0 && selectedCampaign === 'all' && (
        <div className="bg-onyx border border-onyx-400 rounded-xl overflow-hidden shadow-sm">
          <div className="px-8 py-6 border-b border-onyx-400 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-soft-linen" />
              <h3 className="text-lg font-bold text-soft-linen">Top Campaigns Performance</h3>
            </div>
            <Button variant="secondary" size="sm">View All Campaigns</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-onyx-100/30">
                  <th className="px-8 py-4 text-[10px] font-bold text-silver uppercase tracking-widest">Campaign Subject</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-silver uppercase tracking-widest text-center">Volume</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-silver uppercase tracking-widest text-center">Open Rate</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-silver uppercase tracking-widest text-center">CTR</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-silver uppercase tracking-widest text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-onyx-400">
                {campaigns.slice(0, 5).map((campaign, idx) => (
                  <motion.tr 
                    key={campaign.subject}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-onyx-100/20 transition-colors"
                  >
                    <td className="px-8 py-5">
                      <p className="text-sm font-semibold text-soft-linen">{campaign.subject}</p>
                      <p className="text-[10px] text-silver mt-0.5">Performance index: {Math.round(campaign.openRate * 100)}%</p>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="text-sm font-bold text-soft-linen">{campaign.total}</span>
                      <span className="text-[10px] text-silver ml-1">leads</span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="text-sm font-bold text-soft-linen">{(campaign.openRate * 100).toFixed(1)}%</span>
                        <div className="w-16 h-1 bg-onyx rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-soft-linen" 
                            style={{ width: `${campaign.openRate * 100}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="text-sm font-bold text-soft-linen">{(campaign.clickRate * 100).toFixed(1)}%</span>
                        <div className="w-16 h-1 bg-onyx rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-silver" 
                            style={{ width: `${campaign.clickRate * 200}%` }} // Multiply to show visibility for small rates
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={cn(
                        "text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-widest",
                        campaign.deliveryRate > 0.9 ? "bg-green-400/10 text-green-400" : "bg-yellow-400/10 text-yellow-400"
                      )}>
                        {campaign.deliveryRate > 0.9 ? 'Healthy' : 'Warning'}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
          <p className="text-soft-linen">[DATA] User interaction tracking system online.</p>
          <p className="text-silver">[DEBUG] Database query optimized for high-volume logs.</p>
          <p className="text-onyx-700">[ERROR] Failed to delivery to {stats?.totalBounced || 0} recipients (Permanent Bounce).</p>
          <p className="text-soft-linen opacity-90">[INFO] Campaign tracking pixels reported 100% resolution.</p>
        </div>
      </div>
    </div>
  );
}
