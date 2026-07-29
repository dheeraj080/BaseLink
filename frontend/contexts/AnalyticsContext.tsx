'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AnalyticsStatsDto } from '@/types/api';
import { analyticsService } from '@/services/analytics.service';

interface AnalyticsContextType {
  globalStats: AnalyticsStatsDto | null;
  loading: boolean;
  refreshGlobalStats: () => Promise<void>;
  fetchContactStats: (email: string) => Promise<AnalyticsStatsDto | null>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [globalStats, setGlobalStats] = useState<AnalyticsStatsDto | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshGlobalStats = async () => {
    try {
      const stats = await analyticsService.getStats();
      setGlobalStats(stats);
    } catch (err) {
      console.error('Failed to fetch global stats', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchContactStats = async (email: string): Promise<AnalyticsStatsDto | null> => {
    try {
      return await analyticsService.getStatsForContact(email);
    } catch (err) {
      console.error(`Failed to fetch stats for contact: ${email}`, err);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        const stats = await analyticsService.getStats();
        if (isMounted) {
          setGlobalStats(stats);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch global stats', err);
        if (isMounted) setLoading(false);
      }
    }
    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AnalyticsContext.Provider
      value={{
        globalStats,
        loading,
        refreshGlobalStats,
        fetchContactStats
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}
