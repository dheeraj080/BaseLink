import React from 'react';
import { FileText, Plus } from 'lucide-react';
import { EmailTemplate } from '@/types/api';

interface LayoutBlueprintsProps {
  templates: EmailTemplate[];
  applyTemplate: (id: string) => void;
}

export function LayoutBlueprints({ templates, applyTemplate }: LayoutBlueprintsProps) {
  return (
    <div className="bg-[#0a0a0c] border border-white/5 p-8 rounded-[32px] shadow-2xl">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary mb-6 flex items-center gap-2">
        <FileText className="w-4 h-4" /> Layout Blueprints
      </h3>
      <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2">
        {templates.length === 0 ? (
          <p className="text-center text-text-secondary/20 italic text-xs py-4">No frameworks.</p>
        ) : (
          templates.map(t => (
            <button
              key={t.id}
              onClick={() => applyTemplate(t.id!)}
              className="w-full p-4 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 rounded-xl text-left flex items-center justify-between group transition-colors"
            >
              <span className="text-xs font-bold text-white/80 group-hover:text-white truncate">{t.name}</span>
              <Plus className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
            </button>
          ))
        )}
      </div>
    </div>
  );
}
