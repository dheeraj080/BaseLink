import React from 'react';
import { History } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { EmailLog } from '@/types/api';

interface TelemetryLogTableProps {
  logs: EmailLog[];
}

export function TelemetryLogTable({ logs }: TelemetryLogTableProps) {
  return (
    <div className="apple-glass-card rounded-[22px] overflow-hidden shadow-xl border border-white/10 apple-edge-highlight">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="apple-glass-bar border-b border-white/10">
            <th className="px-6 py-4 text-xs font-semibold text-text-secondary tracking-tight">Recipient</th>
            <th className="px-6 py-4 text-xs font-semibold text-text-secondary tracking-tight">Subject</th>
            <th className="px-6 py-4 text-xs font-semibold text-text-secondary tracking-tight">Status</th>
            <th className="px-6 py-4 text-xs font-semibold text-text-secondary tracking-tight text-right">Sent Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {logs.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-16 text-center text-text-secondary">
                <History className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-xs font-semibold">No send history recorded</p>
              </td>
            </tr>
          ) : (
            logs.map((log) => (
              <tr key={log.id} className="hover:bg-white/5 transition-all duration-150 group cursor-default">
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-white tracking-tight">{log.recipient}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium text-white truncate max-w-[240px] inline-block">{log.subject}</span>
                    <span className={cn(
                      "text-[11px] font-semibold w-fit",
                      log.isMarketing ? "text-white/60" : "text-emerald-400"
                    )}>
                      {log.isMarketing ? "Newsletter" : "Outreach"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className={cn(
                    "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border",
                    log.status === 'SENT' ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" :
                      log.status === 'FAILED' ? "bg-rose-500/10 text-rose-300 border-rose-500/20" :
                        "bg-white/5 text-text-secondary border-white/10"
                  )}>
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      log.status === 'SENT' ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" :
                        log.status === 'FAILED' ? "bg-rose-400 shadow-[0_0_6px_rgba(251,113,133,0.8)]" :
                          "bg-text-secondary"
                    )} />
                    {log.status === 'SENT' ? 'Sent' : log.status === 'FAILED' ? 'Failed' : log.status}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-xs font-semibold text-text-secondary">
                    {log.sentAt ? format(new Date(log.sentAt), 'MMM dd, HH:mm') : '—'}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
