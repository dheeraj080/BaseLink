import React from 'react';
import { Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmailLog } from '@/types/api';

interface RecentBroadcastsProps {
  logs: EmailLog[];
}

export function RecentBroadcasts({ logs }: RecentBroadcastsProps) {
  return (
    <div className="bg-surface-primary border border-border-color rounded-[32px] p-8 shadow-2xl flex flex-col">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary mb-8">Recent Broadcasts</h3>
      <div className="space-y-6 flex-1 overflow-y-auto max-h-[350px] pr-2">
        {logs.length === 0 ? (
          <p className="text-[10px] font-bold text-text-secondary/40 uppercase tracking-widest text-center py-12">No recent dispatches</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex gap-4 items-center bg-white/[0.01] border border-white/5 p-4 rounded-2xl hover:bg-white/[0.03] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-bg-primary border border-border-color flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-text-secondary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-text-main truncate">{log.recipient}</p>
                <p className="text-[10px] text-text-secondary/60 truncate mt-1">{log.subject}</p>
              </div>
              <div className={cn(
                "text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest border",
                log.status === 'SENT' ? "bg-white/5 text-white border-white/10" : "bg-red-500/10 text-red-500 border-red-500/20"
              )}>
                {log.status === 'SENT' ? 'SENT' : log.status}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
