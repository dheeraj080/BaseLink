'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { analyticsService } from '@/services/analytics.service';
import { AnalyticsStatsDto } from '@/types/api';
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

export default function Page() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AnalyticsStatsDto | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchStats = async () => {
        try {
          const data = await analyticsService.getStats();
          setStats(data);
        } catch (error) {
          console.error('Failed to fetch stats', error);
        } finally {
          setIsStatsLoading(false);
        }
      };
      fetchStats();
    }
  }, [user]);

  if (loading) return null;

  if (!user) {
    return (
      <div className="min-h-screen bg-onyx flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Abstract Background Design */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-soft-linen/[0.02] rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-white-smoke/[0.02] rounded-full blur-[120px] pointer-events-none"></div>

        {/* Global Navigation - Minimal */}
        <nav className="absolute top-0 left-0 w-full p-8 md:p-12 flex justify-end items-center z-20">
          <div className="flex items-center gap-6 md:gap-10">
            <Link href="/auth/login" className="text-xs font-bold text-silver hover:text-soft-linen uppercase tracking-[0.2em] transition-colors">Login</Link>
            <Link href="/auth/register" className="h-10 px-6 flex items-center justify-center bg-soft-linen text-onyx text-xs font-bold uppercase tracking-[0.1em] rounded-xl hover:bg-white-smoke transition-all shadow-xl shadow-soft-linen/5">
              Get Started
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center max-w-3xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-soft-linen/5 border border-soft-linen/10 rounded-full mb-10"
          >
            <span className="w-1.5 h-1.5 bg-soft-linen rounded-full animate-pulse"></span>
            <span className="text-[10px] font-bold text-silver uppercase tracking-[0.2em]">Enterprise V2.4 Available Now</span>
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-bold text-soft-linen tracking-tighter leading-[0.9] mb-8">
            PRECISION<br />
            <span className="text-silver italic font-serif">networking.</span>
          </h1>

          <p className="text-lg md:text-xl text-silver font-medium leading-relaxed mb-12 max-w-xl mx-auto text-balance">
            The world&apos;s most sophisticated enterprise contact engine. Secure and built for modern scale.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <Link href="/auth/register" className="h-14 px-10 flex items-center justify-center bg-soft-linen text-onyx text-sm font-bold uppercase tracking-[0.15em] rounded-2xl hover:bg-white-smoke transition-all shadow-[0_0_40px_rgba(239,232,221,0.1)] group">
              Start Building <ArrowUpRight className="ml-2 w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>
        </motion.div>

        {/* Floating Metadata */}
        <div className="absolute bottom-12 left-12 hidden md:block">
        </div>

        <div className="absolute right-12 bottom-12 flex gap-12 items-end">
          <div className="text-right">
            <p className="text-2xl font-light text-soft-linen leading-none"></p>
            <p className="text-[9px] font-bold text-silver uppercase tracking-widest mt-2"></p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-light text-soft-linen leading-none"></p>
            <p className="text-[9px] font-bold text-silver uppercase tracking-widest mt-2"></p>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    { name: 'Total Sent', value: stats?.totalSent || 0, icon: Send, color: 'text-white-smoke', bg: 'bg-onyx-400' },
    { name: 'Open Rate', value: `${((stats?.openRate || 0)).toFixed(1)}%`, icon: Eye, color: 'text-soft-linen', bg: 'bg-onyx-400' },
    { name: 'Click Rate', value: `${((stats?.clickThroughRate || 0) * 100).toFixed(1)}%`, icon: MousePointer2, color: 'text-white-smoke', bg: 'bg-onyx-400' },
    { name: 'Unsubscribed', value: stats?.totalUnsubscribed || 0, icon: AlertCircle, color: 'text-silver', bg: 'bg-onyx-400' },
  ];

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-6 bg-onyx-500 border border-onyx-400 rounded-xl relative overflow-hidden group hover:border-graphite-500 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2.5 rounded-lg border border-onyx-400 bg-onyx-100")}>
                <stat.icon className={cn("w-4 h-4", stat.color)} />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-semibold text-soft-linen bg-white-smoke/5 px-2 py-1 rounded-md">
                <ArrowUpRight className="w-3 h-3" />
                +12%
              </div>
            </div>
            <p className="text-xs font-medium text-silver uppercase tracking-wider">{stat.name}</p>
            <h3 className="text-2xl font-bold text-soft-linen mt-1 tracking-tight">{isStatsLoading ? '---' : stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-onyx-500 border border-onyx-400 rounded-xl p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-soft-linen tracking-tight">Campaign Analytics</h3>
              <p className="text-xs text-silver mt-1">Real-time engagement tracking across all channels.</p>
            </div>
            <select className="bg-onyx-100 border border-onyx-400 rounded-lg px-3 py-1.5 text-xs font-semibold text-silver outline-none focus:border-silver transition-all cursor-pointer">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center bg-onyx-100/50 rounded-lg border border-dashed border-onyx-400">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-onyx-600 mx-auto mb-3" />
              <p className="text-xs font-medium text-silver">Awaiting data stream to visualize performance.</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-onyx-500 border border-onyx-400 rounded-xl p-8"
        >
          <h3 className="text-lg font-bold text-soft-linen mb-8 tracking-tight">Activity Log</h3>
          <div className="space-y-8">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-onyx-100 border border-onyx-400 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-silver" />
                </div>
                <div>
                  <p className="text-sm font-medium text-soft-linen">Contact List Updated</p>
                  <p className="text-xs text-silver mt-0.5">New segment successfully imported.</p>
                  <p className="text-[10px] text-onyx-700 font-bold uppercase tracking-wider mt-2.5">Just now</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 text-xs font-semibold text-silver hover:text-soft-linen hover:bg-onyx-400 border border-onyx-400 rounded-lg transition-all flex items-center justify-center gap-2">
            View All Logs <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
