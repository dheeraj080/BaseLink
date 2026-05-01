import React from 'react';
import { Timer, Trash2, Calendar, Mail, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ScheduledJob {
  jobName: string;
  groupName: string;
  nextFireTime: string;
  status: string;
  data: {
    to: string;
    subject: string;
    body: string;
    isMarketing: string;
    replyTo?: string;
  };
}

interface ScheduledQueueTableProps {
  jobs: ScheduledJob[];
  onCancel: (jobName: string, groupName: string) => void;
}

export function ScheduledQueueTable({ jobs, onCancel }: ScheduledQueueTableProps) {
  return (
    <div className="bg-surface-primary border border-border-color rounded-[32px] overflow-hidden shadow-2xl shadow-black/20">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-bg-primary/30 border-b border-border-color">
            <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary">Sequence Target</th>
            <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary">Logic Identifier</th>
            <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary">Deployment Mode</th>
            <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary text-right">Scheduled Execution</th>
            <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-color">
          {jobs.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-10 py-24 text-center text-text-secondary/20 bg-bg-primary/50">
                <Timer className="w-12 h-12 mx-auto mb-6 opacity-5" />
                <p className="text-[10px] font-bold uppercase tracking-[0.3em]">No pending executions detected</p>
              </td>
            </tr>
          ) : (
            jobs.map((job) => (
              <tr key={job.jobName} className="hover:bg-white/[0.02] transition-colors group cursor-default">
                <td className="px-10 py-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-white tracking-tight">{job.data.to}</span>
                    <span className="text-[10px] text-text-secondary/60 flex items-center gap-1.5 font-medium">
                       <Mail className="w-3 h-3" />
                       {job.data.replyTo || 'default-relay'}
                    </span>
                  </div>
                </td>
                <td className="px-10 py-6">
                   <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-text-secondary/60 uppercase tracking-widest truncate max-w-[200px] inline-block">{job.data.subject}</span>
                    <span className="text-[8px] font-bold text-text-secondary/30 uppercase tracking-[0.2em]">{job.jobName}</span>
                   </div>
                </td>
                <td className="px-10 py-6">
                   <span className={cn(
                      "text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border",
                      job.data.isMarketing === 'true' 
                        ? "text-indigo-400/60 border-indigo-400/20 bg-indigo-400/5" 
                        : "text-emerald-400/60 border-emerald-400/20 bg-emerald-400/5"
                    )}>
                      {job.data.isMarketing === 'true' ? "Newsletter" : "Outreach"}
                    </span>
                </td>
                <td className="px-10 py-6 text-right">
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                      {format(new Date(job.nextFireTime), 'MMM dd, HH:mm')}
                    </span>
                    <span className="text-[9px] font-bold text-text-secondary/40 uppercase tracking-widest flex items-center gap-1.5">
                       <Calendar className="w-3 h-3" />
                       UTC Execution
                    </span>
                  </div>
                </td>
                <td className="px-10 py-6 text-right">
                  <button 
                    onClick={() => onCancel(job.jobName, job.groupName)}
                    className="p-3 bg-red-500/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 border border-red-500/10 rounded-xl transition-all shadow-xl"
                    title="Terminate Execution"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
