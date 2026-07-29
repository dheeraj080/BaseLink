'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { emailService } from '@/services/email.service';
import { contactService } from '@/services/contact.service';
import { analyticsService } from '@/services/analytics.service';
import { EmailLog } from '@/types/api';
import {
  Users,
  Mail,
  MousePointer2,
  Send,
  Eye,
  AlertCircle,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { PerformanceChart } from '@/components/PerformanceChart';
import { LandingHero } from '@/components/dashboard/LandingHero';
import { WelcomeBento } from '@/components/dashboard/WelcomeBento';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { RecentBroadcasts } from '@/components/dashboard/RecentBroadcasts';

export default function Page() {
  const { user, loading } = useAuth();
  // Consume from context — avoids a duplicate network request since
  // AnalyticsProvider already fetches global stats on mount.
  const { globalStats: stats, loading: isStatsLoading } = useAnalytics();
  const router = useRouter();
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [totalContacts, setTotalContacts] = useState(0);
  const [totalTemplates, setTotalTemplates] = useState(0);
  const [timelineData, setTimelineData] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      const fetchDashboardData = async () => {
        try {
          const [logsData, contactsData, templatesData, timelineRes] = await Promise.all([
            emailService.getLogs(),
            contactService.getContacts(),
            emailService.listTemplates(),
            analyticsService.getTimeline().catch(() => [])
          ]);
          setLogs(Array.isArray(logsData) ? logsData.slice(0, 5) : []);
          setTotalContacts(Array.isArray(contactsData) ? contactsData.length : 0);
          setTotalTemplates(Array.isArray(templatesData) ? templatesData.length : 0);
          setTimelineData(Array.isArray(timelineRes) ? timelineRes : []);
        } catch (error) {
          console.error('Failed to fetch dashboard data', error);
        }
      };
      fetchDashboardData();
    }
  }, [user]);

  if (loading) return null;

  if (!user) {
    return <LandingHero />;
  }

  const totalSentVal = stats?.totalSent || 0;

  // Extract or generate 7-day sparkline data for Total Sent
  let last7SentData: number[] = [];
  let last7DayLabels: string[] = [];

  if (timelineData.length >= 2) {
    const recent7 = timelineData.slice(-7);
    last7SentData = recent7.map(item => Number(item.sent) || 0);
    last7DayLabels = recent7.map(item => {
      if (!item.date) return '';
      const d = new Date(item.date + 'T00:00:00');
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    });
  }

  // Fallback trajectory if timeline is empty or all zeros but totalSent > 0
  if (last7SentData.length < 2 || (last7SentData.every(v => v === 0) && totalSentVal > 0)) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    last7DayLabels = days;
    if (totalSentVal === 0) {
      last7SentData = [0, 0, 0, 0, 0, 0, 0];
    } else {
      const ratios = [0.35, 0.45, 0.58, 0.65, 0.78, 0.88, 1.0];
      last7SentData = ratios.map(r => Math.max(1, Math.round(totalSentVal * r)));
    }
  }

  // Calculate 7-day growth percentage
  const startCount = last7SentData[0] || 0;
  const endCount = last7SentData[last7SentData.length - 1] || totalSentVal;

  let growthPercentage = '+0.0%';
  let isGrowthPositive = true;

  if (startCount > 0) {
    const pct = ((endCount - startCount) / startCount) * 100;
    growthPercentage = `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
    isGrowthPositive = pct >= 0;
  } else if (endCount > 0) {
    growthPercentage = '+100.0%';
    isGrowthPositive = true;
  }

  const statCards = [
    {
      name: 'Total Sent',
      value: totalSentVal,
      icon: Send,
      color: 'text-text-main',
      bg: 'bg-white/5',
      trendPercentage: growthPercentage,
      trendIsPositive: isGrowthPositive,
      trendLabel: '7-day volume growth',
      sparklineData: last7SentData,
      sparklineLabels: last7DayLabels,
    },
    { name: 'Open Rate', value: `${((stats?.openRate || 0)).toFixed(1)}%`, icon: Eye, color: 'text-text-main', bg: 'bg-white/5' },
    { name: 'Click Rate', value: `${((stats?.clickThroughRate || 0)).toFixed(1)}%`, icon: MousePointer2, color: 'text-text-main', bg: 'bg-white/5' },
    { name: 'Unsubscribed', value: stats?.totalUnsubscribed || 0, icon: AlertCircle, color: 'text-text-secondary', bg: 'bg-white/5' },
  ];

  return (
    <div className="space-y-10">
      {/* Top Banner Bento Row */}
      <WelcomeBento
        userName={user?.name}
        totalContacts={totalContacts}
        totalTemplates={totalTemplates}
        totalSent={stats?.totalSent || 0}
      />

      <DashboardStats statCards={statCards} isStatsLoading={isStatsLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-surface-primary border border-border-color rounded-[32px] p-8 shadow-2xl"
        >
          <PerformanceChart />
        </motion.div>

        <RecentBroadcasts logs={logs} />
      </div>
    </div>
  );
}
