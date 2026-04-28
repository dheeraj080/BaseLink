'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { analyticsService } from '@/services/analytics.service';
import { emailService } from '@/services/email.service';
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
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchDashboardData = async () => {
        try {
          const [statsData, logsData] = await Promise.all([
            analyticsService.getStats(),
            emailService.getLogs()
          ]);
          setStats(statsData);
          setLogs(Array.isArray(logsData) ? logsData.slice(0, 5) : []);
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
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.4em]">Protocol Version 2.0</span>
          </div>
          <h1 className="text-7xl md:text-9xl font-bold text-white tracking-tighter leading-[0.85] mb-10">
            RADICAL<br/>
            <span className="text-text-secondary italic font-serif">precision.</span>
          </h1>

          <p className="text-lg md:text-xl text-text-secondary font-medium leading-relaxed mb-16 max-w-xl mx-auto text-balance">
            The world&apos;s most sophisticated enterprise contact engine. Built for absolute scale and monolithic security.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <Link href="/auth/register" className="h-16 px-12 flex items-center justify-center bg-white text-bg-primary text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-text-main transition-all shadow-[0_0_50px_rgba(255,255,255,0.1)] group">
              Initialize Protocol <ArrowUpRight className="ml-2 w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const statCards = [
    { name: 'Total Sent', value: stats?.totalSent || 0, icon: Send, color: 'text-text-main', bg: 'bg-white/5' },
    { name: 'Open Rate', value: `${((stats?.openRate || 0) ).toFixed(1)}%`, icon: Eye, color: 'text-text-main', bg: 'bg-white/5' },
    { name: 'Click Rate', value: `${((stats?.clickThroughRate || 0) * 100).toFixed(1)}%`, icon: MousePointer2, color: 'text-text-main', bg: 'bg-white/5' },
    { name: 'Unsubscribed', value: stats?.totalUnsubscribed || 0, icon: AlertCircle, color: 'text-text-secondary', bg: 'bg-white/5' },
  ];

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-7 bg-surface-primary border border-border-color rounded-3xl relative overflow-hidden group hover:border-white/20 transition-all hover:shadow-2xl hover:shadow-white/[0.02]"
          >
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.3em]">{stat.name}</p>
            <h3 className="text-3xl font-bold text-text-main mt-2.5 tracking-tighter">{isStatsLoading ? '---' : stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-surface-primary border border-border-color rounded-3xl p-8"
        >
          <PerformanceChart />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface-primary border border-border-color rounded-3xl p-8"
        >
          <h3 className="text-lg font-bold text-text-main mb-8 tracking-tight">Recent Broadcasts</h3>
          <div className="space-y-6">
            {logs.length === 0 ? (
              <p className="text-[10px] font-bold text-text-secondary/40 uppercase tracking-widest text-center py-12">No recent dispatches</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-xl bg-bg-primary border border-border-color flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-text-secondary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-text-main truncate">{log.recipient}</p>
                    <p className="text-[10px] text-text-secondary/60 truncate mt-0.5">{log.subject}</p>
                  </div>
                  <div className={cn(
                    "w-2 h-2 rounded-full shadow-sm",
                    log.status === 'SENT' ? "bg-green-500" : "bg-red-500"
                  )} />
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
