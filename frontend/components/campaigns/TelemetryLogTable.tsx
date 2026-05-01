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
    <div className="bg-surface-primary border border-border-color rounded-[32px] overflow-hidden shadow-2xl shadow-black/20">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-bg-primary/30 border-b border-border-color">
            <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary">Node Target</th>
            <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary">Protocol Header</th>
            <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary">Operational State</th>
            <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary text-right">Sequence Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-color">
          {logs.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-10 py-24 text-center text-text-secondary/20 bg-bg-primary/50">
                <History className="w-12 h-12 mx-auto mb-6 opacity-5" />
                <p className="text-[10px] font-bold uppercase tracking-[0.3em]">No telemetry recorded</p>
              </td>
            </tr>
          ) : (
            logs.map((log) => (
              <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group cursor-default">
                <td className="px-10 py-6">
                  <span className="text-sm font-bold text-white tracking-tight">{log.recipient}</span>
                </td>
                <td className="px-10 py-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-text-secondary/60 uppercase tracking-widest truncate max-w-[200px] inline-block">{log.subject}</span>
                    <span className={cn(
                      "text-[8px] font-bold uppercase tracking-widest w-fit",
                      log.isMarketing ? "text-indigo-400/60" : "text-emerald-400/60"
                    )}>
                      {log.isMarketing ? "Newsletter" : "Cold Outreach"}
                    </span>
                  </div>
                </td>
                <td className="px-10 py-6">
                  <div className={cn(
                    "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border shadow-xl",
                    log.status === 'SENT' ? "bg-white/5 text-white border-white/10" :
                      log.status === 'FAILED' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                        "bg-surface-primary text-text-secondary border-border-color"
                  )}>
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]",
                      log.status === 'SENT' ? "bg-white" :
                        log.status === 'FAILED' ? "bg-red-500" :
                          "bg-text-secondary/40"
                    )} />
                    {log.status === 'SENT' ? 'SENT' : log.status}
                  </div>
                </td>
                <td className="px-10 py-6 text-right">
                  <span className="text-[10px] font-bold text-text-secondary/40 uppercase tracking-widest">
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
