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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/70 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 16 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
            className="apple-material-thick rounded-[28px] w-full max-w-2xl shadow-2xl relative z-20 overflow-hidden flex flex-col max-h-[85vh] apple-edge-highlight"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between apple-glass-bar">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 text-white">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Template Preview</h3>
                  <p className="text-xs font-medium text-text-secondary mt-0.5">Read-only template view</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 text-text-secondary hover:text-white transition-all cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-text-secondary ml-1">Template Name</span>
                  <div className="p-3.5 apple-glass rounded-xl text-xs font-bold text-white tracking-tight apple-edge-highlight">
                    {template.name}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-text-secondary ml-1">Created Date</span>
                  <div className="p-3.5 apple-glass rounded-xl text-xs font-semibold text-white flex items-center gap-2 apple-edge-highlight">
                    <Calendar className="w-3.5 h-3.5 text-text-secondary" />
                    {template.createdAt ? format(new Date(template.createdAt), 'MMM dd, yyyy') : '—'}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-text-secondary ml-1">Subject Line</span>
                <div className="p-3.5 apple-glass rounded-xl text-sm font-semibold text-white apple-edge-highlight">
                  {template.subject}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <span className="text-xs font-semibold text-text-secondary">Template Body</span>
                  <button onClick={handleCopy} className="text-xs font-semibold text-white/80 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer">
                    <Copy className="w-3.5 h-3.5" />
                    Copy Content
                  </button>
                </div>
                <div className="p-5 apple-glass rounded-2xl text-sm font-normal text-white/90 leading-relaxed font-sans whitespace-pre-wrap apple-edge-highlight">
                  {template.content}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/10 flex items-center justify-end apple-glass-bar">
              <Button onClick={onClose} variant="secondary">
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
