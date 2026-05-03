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
    <div className="bg-surface-primary border border-border-color rounded-[32px] overflow-hidden shadow-2xl shadow-black/20">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-bg-primary/30 border-b border-border-color">
            <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary">Recipients</th>
            <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary">Subject</th>
            <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary">Last Modified</th>
            <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-color">
          {drafts.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-10 py-24 text-center text-text-secondary/20 bg-bg-primary/50">
                <FileText className="w-12 h-12 mx-auto mb-6 opacity-5" />
                <p className="text-[10px] font-bold uppercase tracking-[0.3em]">No drafts stored</p>
              </td>
            </tr>
          ) : (
            drafts.map((draft) => (
              <tr key={draft.id} className="hover:bg-white/[0.02] transition-colors group cursor-default">
                <td className="px-10 py-6">
                  <span className="text-sm font-bold text-white tracking-tight">
                    {draft.to.length > 0 ? draft.to.join(', ') : '(No recipients)'}
                  </span>
                </td>
                <td className="px-10 py-6">
                  <span className="text-[11px] font-bold text-text-secondary/60 uppercase tracking-widest truncate max-w-[200px] inline-block">
                    {draft.subject || '(No subject)'}
                  </span>
                </td>
                <td className="px-10 py-6">
                  <span className="text-[10px] font-bold text-text-secondary/40 uppercase tracking-widest">
                    {format(new Date(draft.updatedAt), 'MMM dd, HH:mm')}
                  </span>
                </td>
                <td className="px-10 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(draft)}
                      className="h-8 w-8 p-0 rounded-full hover:bg-white/10"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(draft.id)}
                      className="h-8 w-8 p-0 rounded-full hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </Button>
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
