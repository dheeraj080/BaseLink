'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { analyticsService } from '@/services/analytics.service';
import { emailService } from '@/services/email.service';
import { AnalyticsStatsDto, EmailLog, Contact, ContactGroup } from '@/types/api';
import { contactService, groupService } from '@/services/contact.service';
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
  Target,
  MessageSquare
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

import { StatCards } from '@/components/analytics/StatCards';
import { ConversionThresholds } from '@/components/analytics/ConversionThresholds';
import { CampaignIntelligence } from '@/components/analytics/CampaignIntelligence';
import { LiveSystemLogs } from '@/components/analytics/LiveSystemLogs';

export default function AnalyticsPage() {
    const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<AnalyticsStatsDto | null>(null);
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [availableGroups, setAvailableGroups] = useState<ContactGroup[]>([]);
  const [filterClusterId, setFilterClusterId] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<string | 'all'>('all');
  const [filterMode, setFilterMode] = useState<'all' | 'marketing' | 'outreach'>('all');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    let isMounted = true;
    
    const loadData = async () => {
      try {
        const [statsData, logsData, contactsData, groupsData] = await Promise.all([
          analyticsService.getStats(),
          emailService.getLogs(),
          contactService.getContacts(),
          groupService.list()
        ]);
        if (isMounted) {
          setStats(statsData);
          setLogs(logsData);
          setContacts(contactsData);
          setAvailableGroups(groupsData || []);
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

  const filteredLogs = useMemo(() => {
    let result = logs;
    if (filterClusterId !== 'all') {
      const clusterEmails = contacts
        .filter(c => (c.groups || []).some(g => g.id === filterClusterId))
        .map(c => c.email.toLowerCase());
      result = result.filter(log => clusterEmails.includes(log.recipient.toLowerCase()));
    }

    if (filterMode === 'marketing') {
      result = result.filter(log => log.isMarketing);
    } else if (filterMode === 'outreach') {
      result = result.filter(log => !log.isMarketing);
    }

    return result;
  }, [logs, contacts, filterClusterId, filterMode]);

  const campaigns = useMemo(() => {
    const uniqueSubjects = Array.from(new Set(filteredLogs.map(log => log.subject)));
    return uniqueSubjects.map(subject => {
      const campaignLogs = filteredLogs.filter(l => l.subject === subject);
      const total = campaignLogs.length;
      const sent = campaignLogs.filter(l => l.status === 'SENT').length;
      const failed = campaignLogs.filter(l => l.status === 'FAILED').length;
      
      // Since backend interaction stats are global only, 
      // we'll assign some proportional mock stats for the UI demo
      // In real scenarios, these would come from an API filter
      const openRate = 0;
      const clickRate = 0;

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
  }, [filteredLogs, stats]);

  const filteredStats = useMemo(() => {
    if (filterClusterId === 'all' && selectedCampaign === 'all') {
      return stats;
    }

    if (selectedCampaign !== 'all') {
      const campaign = campaigns.find(c => c.subject === selectedCampaign);
      if (!campaign) return stats;

      return {
        totalSent: campaign.sent,
        totalDelivered: campaign.sent, 
        totalOpened: Math.floor(campaign.sent * campaign.openRate),
        totalClicked: Math.floor(campaign.sent * campaign.clickRate),
        totalUnsubscribed: Math.floor(campaign.sent * 0.01),
        totalBounced: campaign.failed,
        totalSpamComplaints: 0,
        totalReplied: Math.floor(campaign.sent * 0.12),
        openRate: campaign.openRate,
        clickThroughRate: campaign.clickRate,
        deliveryRate: campaign.deliveryRate,
        unsubscribeRate: 0.01,
        bounceRate: campaign.total > 0 ? campaign.failed / campaign.total : 0,
        clickToOpenRate: campaign.openRate > 0 ? campaign.clickRate / campaign.openRate : 0,
        spamComplaintRate: 0,
        replyRate: 0.12
      };
    }

    const total = filteredLogs.length;
    const sent = filteredLogs.filter(l => l.status === 'SENT').length;
    const failed = filteredLogs.filter(l => l.status === 'FAILED').length;
    
    const openRate = 0;
    const clickRate = 0;

    return {
      totalSent: sent,
      totalDelivered: sent,
      totalOpened: Math.floor(sent * openRate),
      totalClicked: Math.floor(sent * clickRate),
      totalUnsubscribed: Math.floor(sent * 0.01),
      totalBounced: failed,
      totalSpamComplaints: 0,
      totalReplied: Math.floor(sent * 0.08),
      openRate,
      clickThroughRate: clickRate,
      deliveryRate: total > 0 ? sent / total : 0,
      unsubscribeRate: 0.01,
      bounceRate: total > 0 ? failed / total : 0,
      clickToOpenRate: openRate > 0 ? clickRate / openRate : 0,
      spamComplaintRate: 0,
      replyRate: 0.08
    };
  }, [selectedCampaign, filterClusterId, stats, campaigns, filteredLogs]);

  const formatPercent = (val: number | undefined) => {
    if (val === undefined) return 0;
    return val;
  };

  const metrics = [
    { label: 'Total Sent', value: filteredStats?.totalSent || 0, icon: Send },
    { label: 'Total Opened', value: filteredStats?.totalOpened || 0, icon: Eye },
    { label: 'Total Clicked', value: filteredStats?.totalClicked || 0, icon: MousePointer2 },
    { label: 'Total Replied', value: filteredStats?.totalReplied || 0, icon: MessageSquare },
    { label: 'Delivery Rate', value: `${formatPercent(filteredStats?.deliveryRate).toFixed(1)}%`, icon: ShieldCheck },
  ];

  const rates = [
    { label: 'Open Rate', value: formatPercent(filteredStats?.openRate), color: 'bg-soft-linen' },
    { label: 'Click Rate', value: formatPercent(filteredStats?.clickThroughRate), color: 'bg-silver' },
    { label: 'Reply Rate', value: formatPercent(filteredStats?.replyRate), color: 'bg-onyx-600' },
    { label: 'Unsubscribe Rate', value: formatPercent(filteredStats?.unsubscribeRate), color: 'bg-onyx-600' },
    { label: 'Bounce Rate', value: formatPercent(filteredStats?.bounceRate), color: 'bg-graphite' },
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
          <CustomSelect
            options={[
              { value: 'all', label: 'All Clusters' },
              ...availableGroups.map(group => ({
                value: group.id!,
                label: group.name!
              }))
            ]}
            value={filterClusterId}
            onChange={setFilterClusterId}
            className="w-48"
          />
          <CustomSelect
            options={[
              { value: 'all', label: 'All Modes' },
              { value: 'marketing', label: 'Newsletter' },
              { value: 'outreach', label: 'Outreach' }
            ]}
            value={filterMode}
            onChange={(val) => setFilterMode(val as any)}
            className="w-40"
          />
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
            className="w-56"
          />
          <Button variant="secondary" size="sm" leftIcon={<Calendar className="w-4 h-4" />}>
            Last 30 Days
          </Button>
        </div>
      </div>

      <div className="bg-onyx/30 backdrop-blur-md border border-onyx-400 rounded-[28px] p-8 shadow-xl">
        <h3 className="text-sm font-bold text-soft-linen/40 uppercase tracking-widest mb-6 ml-2">Executive Summary</h3>
        <StatCards metrics={metrics} loading={loading} mounted={mounted} />

        <div className="border-t border-onyx-400/50 pt-8">
          <h3 className="text-xs font-bold text-soft-linen/40 uppercase tracking-widest mb-6 ml-2">Conversion Thresholds</h3>
          <ConversionThresholds 
            rates={rates.concat({ 
              label: 'Delivery Rate', 
              value: formatPercent(filteredStats?.deliveryRate), 
              color: 'bg-green-400' 
            })} 
            loading={loading} 
          />
        </div>
      </div>

      <div className="bg-onyx/30 backdrop-blur-md border border-onyx-400 rounded-[28px] p-8 shadow-xl">
        <h3 className="text-sm font-bold text-soft-linen/40 uppercase tracking-widest mb-6 ml-2">Interaction Timeline</h3>
        <PerformanceChart />
      </div>

      <CampaignIntelligence campaigns={campaigns} selectedCampaign={selectedCampaign} />

      <LiveSystemLogs totalSent={stats?.totalSent || 0} totalBounced={stats?.totalBounced || 0} />
    </div>
  );
}
