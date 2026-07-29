'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AnalyticsProvider } from '@/contexts/AnalyticsContext';
import { motion, AnimatePresence } from 'motion/react';
import { usePathname } from 'next/navigation';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/auth');
  const isLandingPage = pathname === '/' && !user;

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-bg-primary">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAuthPage || isLandingPage) {
    return <main className="min-h-screen bg-bg-primary">{children}</main>;
  }

  const rawTitle = pathname === '/' ? 'Dashboard' : pathname.split('/').pop()?.replace('-', ' ') || 'Page';
  const pageTitle = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);

  return (
    <div className="flex min-h-screen bg-bg-primary selection:bg-white/20">
      <Sidebar />
      <main className="flex-1 flex flex-col relative overflow-hidden min-w-0">
        {/* Apple Glass Floating Top Bar */}
        <header className="sticky top-0 z-20 apple-glass-bar px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-white tracking-tight capitalize">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-text-secondary">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Demo
            </span>
          </div>
        </header>

        {/* Page Content with Critically Damped Apple Spring Transitions */}
        <div className="p-6 sm:p-8 h-full relative flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.995 }}
              transition={{
                type: 'spring',
                bounce: 0,
                duration: 0.35,
              }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AnalyticsProvider>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
      </AnalyticsProvider>
    </AuthProvider>
  );
}
