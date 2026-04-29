'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { analyticsService } from '@/services/analytics.service';
import { emailService } from '@/services/email.service';
import { contactService } from '@/services/contact.service';
import { AnalyticsStatsDto, EmailLog } from '@/types/api';
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
  const router = useRouter();
  const [stats, setStats] = useState<AnalyticsStatsDto | null>(null);
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [totalContacts, setTotalContacts] = useState(0);
  const [totalTemplates, setTotalTemplates] = useState(0);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchDashboardData = async () => {
        try {
          const [statsData, logsData, contactsData, templatesData] = await Promise.all([
            analyticsService.getStats(),
            emailService.getLogs(),
            contactService.getContacts(),
            emailService.listTemplates()
          ]);
          setStats(statsData);
          setLogs(Array.isArray(logsData) ? logsData.slice(0, 5) : []);
          setTotalContacts(Array.isArray(contactsData) ? contactsData.length : 0);
          setTotalTemplates(Array.isArray(templatesData) ? templatesData.length : 0);
        } catch (error) {
          console.error('Failed to fetch stats', error);
        } finally {
          setIsStatsLoading(false);
        }
      };
      fetchDashboardData();
    }
  }, [user]);

  if (loading) return null;

  if (!user) {
    return <LandingHero />;
  }

  const statCards = [
    { name: 'Total Sent', value: stats?.totalSent || 0, icon: Send, color: 'text-text-main', bg: 'bg-white/5' },
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
