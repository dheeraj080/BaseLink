import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

export function LandingHero() {
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
