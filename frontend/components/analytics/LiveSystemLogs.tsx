import React from 'react';
import { Activity } from 'lucide-react';

interface LiveSystemLogsProps {
  totalSent: number;
  totalBounced: number;
}

export function LiveSystemLogs({ totalSent, totalBounced }: LiveSystemLogsProps) {
  return (
    <div className="bg-onyx border border-onyx-400 rounded-xl p-6 relative overflow-hidden group">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-bold text-silver uppercase tracking-widest flex items-center gap-2">
          <Activity className="w-4 h-4" /> Live System Logs
        </h4>
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-silver/50"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-silver/50 animate-pulse"></span>
        </div>
      </div>
      <div className="font-mono text-[11px] space-y-1.5 opacity-60 group-hover:opacity-100 transition-opacity h-32 overflow-y-auto scrollbar-hide">
        <p className="text-soft-linen opacity-90">[INFO] Performance metrics synchronized successfully.</p>
        <p className="text-silver">[DEBUG] Cache flushed for global analytics dashboard.</p>
        <p className="text-soft-linen">[DATA] {totalSent} emails processed across all regions.</p>
        <p className="text-soft-linen">[DATA] User interaction tracking system online.</p>
        <p className="text-silver">[DEBUG] Database query optimized for high-volume logs.</p>
        <p className="text-onyx-700">[ERROR] Failed to delivery to {totalBounced} recipients (Permanent Bounce).</p>
        <p className="text-soft-linen opacity-90">[INFO] Campaign tracking pixels reported 100% resolution.</p>
      </div>
    </div>
  );
}
