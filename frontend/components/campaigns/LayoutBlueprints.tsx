import React from 'react';
import { FileText, Plus } from 'lucide-react';
import { EmailTemplate } from '@/types/api';

interface LayoutBlueprintsProps {
  templates: EmailTemplate[];
  applyTemplate: (id: string) => void;
}

export function LayoutBlueprints({ templates, applyTemplate }: LayoutBlueprintsProps) {
  return (
    <div className="apple-glass-card border border-white/10 p-6 rounded-[22px] shadow-xl apple-edge-highlight">
      <h3 className="text-xs font-bold text-white mb-4 flex items-center gap-2 tracking-tight">
        <FileText className="w-4 h-4 text-white/80" /> Templates & Layouts
      </h3>
      <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
        {templates.length === 0 ? (
          <p className="text-center text-text-secondary text-xs py-4">No templates available.</p>
        ) : (
          templates.map(t => (
            <button
              key={t.id}
              onClick={() => applyTemplate(t.id!)}
              className="w-full p-3.5 apple-glass hover:bg-white/10 rounded-xl text-left flex items-center justify-between group transition-all duration-150 active:scale-[0.98] cursor-pointer apple-edge-highlight"
            >
              <span className="text-xs font-bold text-white/90 group-hover:text-white truncate tracking-tight">{t.name}</span>
              <Plus className="w-4 h-4 text-text-secondary group-hover:text-white transition-colors" />
            </button>
          ))
        )}
      </div>
    </div>
  );
}
