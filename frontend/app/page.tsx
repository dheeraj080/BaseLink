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
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Abstract Background Design */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-white/[0.01] rounded-full blur-[120px] pointer-events-none"></div>

        {/* Global Navigation - Minimal */}
        <nav className="absolute top-0 left-0 w-full p-8 md:p-12 flex justify-end items-center z-20">
          <div className="flex items-center gap-6 md:gap-10">
            <Link href="/auth/login" className="text-[10px] font-bold text-text-secondary hover:text-text-main uppercase tracking-[0.3em] transition-colors">Login</Link>
            <Link href="/auth/register" className="h-10 px-8 flex items-center justify-center bg-white text-bg-primary text-[10px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-text-main transition-all shadow-2xl">
              Get Started
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center max-w-4xl"
        >
          <div className="inline-block px-4 py-1.5 mb-8 border border-white/10 rounded-full bg-white/5">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.4em]">Enterprise Outreach Platform</span>
          </div>
          <h1 className="text-7xl md:text-9xl font-bold text-white tracking-tighter leading-[0.85] mb-10">
            Automate Your<br />
            <span className="text-text-secondary italic font-serif">Outreach.</span>
          </h1>

          <p className="text-lg md:text-xl text-text-secondary font-medium leading-relaxed mb-16 max-w-xl mx-auto text-balance">
            Deploy scheduled campaigns, coordinate customer groups, and track sequential data intelligence seamlessly.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <Link href="/auth/register" className="h-16 px-12 flex items-center justify-center bg-white text-bg-primary text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-text-main transition-all shadow-xl group">
              Get Started <ArrowUpRight className="ml-2 w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const statCards = [
    { name: 'Total Sent', value: stats?.totalSent || 0, icon: Send, color: 'text-text-main', bg: 'bg-white/5' },
    { name: 'Open Rate', value: `${((stats?.openRate || 0)).toFixed(1)}%`, icon: Eye, color: 'text-text-main', bg: 'bg-white/5' },
    { name: 'Click Rate', value: `${((stats?.clickThroughRate || 0) * 100).toFixed(1)}%`, icon: MousePointer2, color: 'text-text-main', bg: 'bg-white/5' },
    { name: 'Unsubscribed', value: stats?.totalUnsubscribed || 0, icon: AlertCircle, color: 'text-text-secondary', bg: 'bg-white/5' },
  ];

  return (
    <div className="space-y-10">
      {/* Top Banner Bento Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-gradient-to-br from-surface-primary to-bg-primary/50 border border-white/5 rounded-[32px] p-10 flex flex-col justify-between min-h-[220px] relative overflow-hidden group shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/[0.01] rounded-full blur-3xl group-hover:bg-white/[0.02] transition-colors pointer-events-none"></div>
          <div>
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.3em] bg-white/5 px-3 py-1.5 rounded-full">Dashboard</span>
            <h2 className="text-4xl font-bold text-white tracking-tighter mt-6 leading-none">
              Welcome Back, <span className="text-text-secondary italic font-serif">{user?.name || 'Administrator'}</span>
            </h2>
            <p className="text-sm text-text-secondary font-medium mt-3 max-w-md">Access your primary performance summaries and operational logs below.</p>
          </div>
          <div className="flex gap-4 mt-8">
            <Link href="/campaigns" className="h-11 px-6 bg-white text-bg-primary text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-text-main transition-all flex items-center justify-center gap-2 shadow-xl">
              Initialize Broadcast <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <Link href="/contacts" className="h-11 px-6 bg-white/5 border border-white/10 hover:border-white/20 text-white text-[10px] font-bold uppercase tracking-widest rounded-full transition-all flex items-center justify-center">
              Review Indices
            </Link>
          </div>
        </motion.div>

        {/* Quick Diagnostics Node */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface-primary border border-border-color rounded-[32px] p-8 flex flex-col justify-between shadow-2xl"
        >
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary">Workspace Status</h3>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white/80">Total Contacts</span>
                <span className="text-xs font-bold text-white font-mono">{totalContacts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white/80">Active Templates</span>
                <span className="text-xs font-bold text-white font-mono">{totalTemplates}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white/80">Processed Dispatches</span>
                <span className="text-xs font-bold text-white font-mono">{stats?.totalSent || 0}</span>
              </div>
            </div>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full mt-4 overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1 }} className="h-full bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]"></motion.div>
          </div>
        </motion.div>
      </div>

      {/* Stats Bento Grid Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 + 0.2 }}
            className="p-8 bg-surface-primary border border-border-color rounded-[24px] relative overflow-hidden group hover:border-white/20 transition-all hover:shadow-2xl hover:shadow-white/[0.02] flex flex-col justify-between min-h-[140px]"
          >
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.3em]">{stat.name}</p>
            <h3 className="text-4xl font-black text-text-main tracking-tighter mt-4">{isStatsLoading ? '---' : stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Main Charts & Actions Bento Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-surface-primary border border-border-color rounded-[32px] p-8 shadow-2xl"
        >
          <PerformanceChart />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-surface-primary border border-border-color rounded-[32px] p-8 shadow-2xl flex flex-col"
        >
          <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary mb-8">Recent Broadcasts</h3>
          <div className="space-y-6 flex-1 overflow-y-auto max-h-[350px] pr-2">
            {logs.length === 0 ? (
              <p className="text-[10px] font-bold text-text-secondary/40 uppercase tracking-widest text-center py-12">No recent dispatches</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex gap-4 items-center bg-white/[0.01] border border-white/5 p-4 rounded-2xl hover:bg-white/[0.03] transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-bg-primary border border-border-color flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-text-secondary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-text-main truncate">{log.recipient}</p>
                    <p className="text-[10px] text-text-secondary/60 truncate mt-1">{log.subject}</p>
                  </div>
                  <div className={cn(
                    "text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest border",
                    log.status === 'SENT' ? "bg-white/5 text-white border-white/10" : "bg-red-500/10 text-red-500 border-red-500/20"
                  )}>
                    {log.status === 'SENT' ? 'SENT' : log.status}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
