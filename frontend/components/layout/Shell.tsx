'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
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
        <div className="w-6 h-6 border-2 border-border-color border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAuthPage || isLandingPage) {
    return <main className="min-h-screen bg-bg-primary">{children}</main>;
  }

  const pageTitle = pathname === '/' ? 'Dashboard' : pathname.split('/').pop()?.replace('-', ' ');

  return (
    <div className="flex min-h-screen bg-bg-primary selection:bg-white/20">
      <Sidebar />
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <div className="p-8 h-full relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, x: 5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -5 }}
              transition={{ duration: 0.2 }}
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
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </AuthProvider>
  );
}
