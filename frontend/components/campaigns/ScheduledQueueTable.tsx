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
    <div className="apple-glass-card rounded-[22px] overflow-hidden shadow-xl border border-white/10 apple-edge-highlight">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="apple-glass-bar border-b border-white/10">
            <th className="px-6 py-4 text-xs font-semibold text-text-secondary tracking-tight">Recipient</th>
            <th className="px-6 py-4 text-xs font-semibold text-text-secondary tracking-tight">Subject</th>
            <th className="px-6 py-4 text-xs font-semibold text-text-secondary tracking-tight">Type</th>
            <th className="px-6 py-4 text-xs font-semibold text-text-secondary tracking-tight text-right">Scheduled Time</th>
            <th className="px-6 py-4 text-xs font-semibold text-text-secondary tracking-tight text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {jobs.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-16 text-center text-text-secondary">
                <Timer className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-xs font-semibold">No scheduled messages</p>
              </td>
            </tr>
          ) : (
            jobs.map((job) => (
              <tr key={job.jobName} className="hover:bg-white/5 transition-all duration-150 group cursor-default">
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold text-white tracking-tight">{job.data.to}</span>
                    <span className="text-xs text-text-secondary/70 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-text-secondary" />
                      {job.data.replyTo || 'Default Relay'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium text-white truncate max-w-[200px] inline-block">{job.data.subject}</span>
                    <span className="text-[11px] font-medium text-text-secondary/50">{job.jobName}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "text-xs font-semibold px-2.5 py-1 rounded-full border",
                    job.data.isMarketing === 'true'
                      ? "text-white/80 border-white/15 bg-white/5"
                      : "text-emerald-300 border-emerald-500/20 bg-emerald-500/10"
                  )}>
                    {job.data.isMarketing === 'true' ? "Marketing" : "Outreach"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-xs font-bold text-white tracking-tight">
                      {format(new Date(job.nextFireTime), 'MMM dd, HH:mm')}
                    </span>
                    <span className="text-[11px] font-medium text-text-secondary flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      UTC
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onCancel(job.jobName, job.groupName)}
                    className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-all active:scale-95 cursor-pointer"
                    title="Cancel Schedule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
