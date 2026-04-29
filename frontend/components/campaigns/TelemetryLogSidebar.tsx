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
    <div className="bg-[#0a0a0c] border border-white/5 p-8 rounded-[32px] shadow-2xl">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary mb-6 flex items-center gap-2">
        <History className="w-4 h-4" /> Logs
      </h3>
      <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2">
        {logs.length === 0 ? (
          <p className="text-center text-text-secondary/20 italic text-xs py-4">No records found.</p>
        ) : (
          logs.map(log => (
            <div key={log.id} className="p-4 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col gap-1.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white truncate max-w-[150px]">{log.recipient}</span>
                <span className={cn(
                  "text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                  log.status === 'SENT' ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                )}>{log.status}</span>
              </div>
              <p className="text-[10px] text-text-secondary/60 truncate italic">{log.subject}</p>
              <span className="text-[8px] text-text-secondary/30 text-right mt-1 font-mono">{log.sentAt ? format(new Date(log.sentAt), 'HH:mm:ss') : ''}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
