import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

interface WelcomeBentoProps {
  userName?: string;
  totalContacts: number;
  totalTemplates: number;
  totalSent: number;
}

export function WelcomeBento({ userName, totalContacts, totalTemplates, totalSent }: WelcomeBentoProps) {
  return (
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
            Welcome Back, <span className="text-text-secondary italic font-serif">{userName || 'Administrator'}</span>
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
              <span className="text-xs font-bold text-white font-mono">{totalSent}</span>
            </div>
          </div>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full mt-4 overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1 }} className="h-full bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]"></motion.div>
        </div>
      </motion.div>
    </div>
  );
}
