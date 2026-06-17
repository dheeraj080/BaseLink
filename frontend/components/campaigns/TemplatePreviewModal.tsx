import React from 'react';
import { X, FileText, Mail, Tag, Calendar, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EmailTemplate } from '@/types/api';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { showSuccess } from '@/lib/utils';

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: EmailTemplate | null;
}

export function TemplatePreviewModal({ isOpen, onClose, template }: TemplatePreviewModalProps) {
  if (!template) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(template.content ?? '');
    showSuccess('Logic content copied to clipboard.');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-bg-primary border border-border-color rounded-[40px] w-full max-w-3xl shadow-modal relative z-20 overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="px-10 py-8 border-b border-border-color flex items-center justify-between bg-surface-primary/30">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-xl bg-surface-primary flex items-center justify-center border border-border-color text-white">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Protocol Inspection</h3>
                  <p className="text-[10px] font-bold text-text-secondary mt-1 uppercase tracking-widest leading-none">ReadOnly Verification Mode</p>
                </div>
              </div>
              <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-surface-primary border border-border-color hover:bg-white hover:text-bg-primary rounded-xl transition-all shadow-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-10 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em] ml-1">Identifier</span>
                  <div className="p-4 bg-surface-primary/50 border border-border-color rounded-2xl text-xs font-bold text-white uppercase tracking-widest">
                    {template.name}
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em] ml-1">Initialized</span>
                  <div className="p-4 bg-surface-primary/50 border border-border-color rounded-2xl text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    {template.createdAt ? format(new Date(template.createdAt), 'MMM dd, yyyy') : '—'}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em] ml-1">Protocol Header (Subject)</span>
                <div className="p-4 bg-surface-primary/50 border border-border-color rounded-2xl text-sm font-bold text-white italic">
                  &quot;{template.subject}&quot;
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <span className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">Logic Payload</span>
                  <button onClick={handleCopy} className="text-[9px] font-bold text-indigo-400 hover:text-white uppercase tracking-widest flex items-center gap-1.5 transition-colors">
                    <Copy className="w-3 h-3" />
                    Copy Sequence
                  </button>
                </div>
                <div className="p-8 bg-surface-primary/30 border border-border-color rounded-[32px] text-sm font-medium text-white/80 leading-relaxed font-mono whitespace-pre-wrap">
                  {template.content}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-10 py-8 border-t border-border-color flex items-center justify-end bg-surface-primary/30">
              <Button onClick={onClose} variant="secondary" className="h-12 px-10 rounded-full font-bold uppercase tracking-widest text-[10px]">
                Close Inspection
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
