import React from 'react';
import { History } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { EmailLog } from '@/types/api';

interface TelemetryLogSidebarProps {
  logs: EmailLog[];
}

export function TelemetryLogSidebar({ logs }: TelemetryLogSidebarProps) {
  return (
    <div className="apple-glass-card border border-white/10 p-6 rounded-[22px] shadow-xl apple-edge-highlight">
      <h3 className="text-xs font-bold text-white mb-4 flex items-center gap-2 tracking-tight">
        <History className="w-4 h-4 text-white/80" /> Dispatch History
      </h3>
      <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
        {logs.length === 0 ? (
          <p className="text-center text-text-secondary text-xs py-4">No recent activity.</p>
        ) : (
          logs.map(log => (
            <div key={log.id} className="p-3.5 apple-glass rounded-xl flex flex-col gap-1 shadow-sm apple-edge-highlight">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white truncate max-w-[150px] tracking-tight">{log.recipient}</span>
                <span className={cn(
                  "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                  log.status === 'SENT' ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"
                )}>{log.status === 'SENT' ? 'Sent' : 'Failed'}</span>
              </div>
              <p className="text-xs text-text-secondary truncate">{log.subject}</p>
              <span className="text-[10px] text-text-secondary/60 text-right mt-0.5 font-medium">{log.sentAt ? format(new Date(log.sentAt), 'HH:mm:ss') : ''}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
