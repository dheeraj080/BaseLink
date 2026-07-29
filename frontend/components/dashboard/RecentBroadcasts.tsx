import React from 'react';
import { Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmailLog } from '@/types/api';

interface RecentBroadcastsProps {
  logs: EmailLog[];
}

export function RecentBroadcasts({ logs }: RecentBroadcastsProps) {
  return (
    <div className="apple-glass-card rounded-[24px] p-6 sm:p-8 border border-white/10 shadow-xl flex flex-col apple-edge-highlight">
      <h3 className="text-[11px] font-semibold uppercase tracking-widest text-text-secondary mb-6">Recent Broadcasts</h3>
      <div className="space-y-3 flex-1 overflow-y-auto max-h-[350px] pr-1">
        {logs.length === 0 ? (
          <p className="text-xs font-semibold text-text-secondary/60 text-center py-12 italic">No recent dispatches</p>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="flex gap-3.5 items-center apple-glass p-3.5 rounded-xl hover:bg-white/10 transition-all duration-150 active:scale-[0.98] cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-white/80" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate tracking-tight">{log.recipient}</p>
                <p className="text-[11px] text-text-secondary truncate mt-0.5">{log.subject}</p>
              </div>
              <div className={cn(
                "text-[10px] font-semibold px-2.5 py-0.5 rounded-full tracking-tight border",
                log.status === 'SENT' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
              )}>
                {log.status === 'SENT' ? 'Sent' : log.status}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
