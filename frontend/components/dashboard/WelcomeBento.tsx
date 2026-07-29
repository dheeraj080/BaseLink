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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
        className="lg:col-span-2 apple-glass-card border border-white/10 rounded-[24px] p-8 sm:p-10 flex flex-col justify-between min-h-[220px] relative overflow-hidden apple-edge-highlight group"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/[0.02] rounded-full blur-3xl group-hover:bg-white/[0.04] transition-colors pointer-events-none" />
        <div>
          <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1 rounded-full">
            Dashboard Overview
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mt-5 leading-tight">
            Welcome Back, <span className="text-white/80 font-normal">{userName || 'Administrator'}</span>
          </h2>
          <p className="text-sm text-text-secondary font-medium mt-2 max-w-md leading-relaxed">
            Access your primary performance summaries and operational campaign metrics.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 mt-8">
          <Link
            href="/campaigns"
            className="h-10 px-5 bg-white text-black text-xs font-bold tracking-tight rounded-xl hover:bg-white/90 active:scale-[0.96] transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/5 apple-edge-highlight"
          >
            Create Campaign <ArrowUpRight className="w-4 h-4" />
          </Link>
          <Link
            href="/contacts"
            className="h-10 px-5 apple-glass text-white text-xs font-semibold tracking-tight rounded-xl hover:bg-white/10 active:scale-[0.96] transition-all flex items-center justify-center border border-white/15"
          >
            Manage Contacts
          </Link>
        </div>
      </motion.div>

      {/* Quick Diagnostics Node */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0, duration: 0.4, delay: 0.08 }}
        className="apple-glass-card border border-white/10 rounded-[24px] p-8 flex flex-col justify-between apple-edge-highlight"
      >
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-text-secondary">Workspace Status</h3>
          <div className="mt-6 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-xs font-semibold text-white/80">Total Contacts</span>
              <span className="text-xs font-bold text-white font-mono">{totalContacts}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-xs font-semibold text-white/80">Active Templates</span>
              <span className="text-xs font-bold text-white font-mono">{totalTemplates}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white/80">Processed Dispatches</span>
              <span className="text-xs font-bold text-white font-mono">{totalSent}</span>
            </div>
          </div>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full mt-6 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.8 }}
            className="h-full bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]"
          />
        </div>
      </motion.div>
    </div>
  );
}
