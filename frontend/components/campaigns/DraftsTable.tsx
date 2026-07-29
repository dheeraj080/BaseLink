import React from 'react';
import { FileText, Trash2, Edit3 } from 'lucide-react';
import { format } from 'date-fns';
import { EmailDraft } from '@/types/api';
import { Button } from '@/components/ui/Button';

interface DraftsTableProps {
  drafts: EmailDraft[];
  onEdit: (draft: EmailDraft) => void;
  onDelete: (id: number) => void;
}

export function DraftsTable({ drafts, onEdit, onDelete }: DraftsTableProps) {
  return (
    <div className="apple-glass-card rounded-[22px] overflow-hidden shadow-xl border border-white/10 apple-edge-highlight">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="apple-glass-bar border-b border-white/10">
            <th className="px-6 py-4 text-xs font-semibold text-text-secondary tracking-tight">Recipients</th>
            <th className="px-6 py-4 text-xs font-semibold text-text-secondary tracking-tight">Subject</th>
            <th className="px-6 py-4 text-xs font-semibold text-text-secondary tracking-tight">Last Modified</th>
            <th className="px-6 py-4 text-xs font-semibold text-text-secondary tracking-tight text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {drafts.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-16 text-center text-text-secondary">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-xs font-semibold">No drafts stored</p>
              </td>
            </tr>
          ) : (
            drafts.map((draft) => (
              <tr key={draft.id} className="hover:bg-white/5 transition-all duration-150 group cursor-default">
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-white tracking-tight">
                    {draft.to.length > 0 ? draft.to.join(', ') : '(No recipients)'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-medium text-text-secondary truncate max-w-[240px] inline-block">
                    {draft.subject || '(No subject)'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-semibold text-text-secondary/70">
                    {format(new Date(draft.updatedAt), 'MMM dd, HH:mm')}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => onEdit(draft)}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 cursor-pointer"
                      title="Edit Draft"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(draft.id)}
                      className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all active:scale-95 cursor-pointer"
                      title="Delete Draft"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
