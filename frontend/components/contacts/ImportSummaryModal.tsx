import React from 'react';
import { X, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ImportSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: { success: number; total: number } | null;
  onRetry: () => void;
}

export function ImportSummaryModal({ isOpen, onClose, summary, onRetry }: ImportSummaryModalProps) {
  if (!summary) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/70 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 16 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
            className="apple-material-thick rounded-[28px] w-full max-w-md shadow-2xl p-6 md:p-8 relative z-10 apple-edge-highlight overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Import Summary</h3>
                <p className="text-xs font-medium text-text-secondary mt-0.5">Contact import results</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 text-text-secondary hover:text-white transition-all cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="apple-glass p-5 rounded-2xl text-center apple-edge-highlight">
                  <p className="text-xs font-semibold text-text-secondary mb-1">Imported</p>
                  <p className="text-3xl font-bold text-white tracking-tight">{summary.success}</p>
                </div>
                <div className="apple-glass p-5 rounded-2xl text-center apple-edge-highlight">
                  <p className="text-xs font-semibold text-text-secondary mb-1">Failed</p>
                  <p className={cn(
                    "text-3xl font-bold tracking-tight",
                    summary.total - summary.success > 0 ? "text-rose-400" : "text-white/30"
                  )}>
                    {Math.max(0, summary.total - summary.success)}
                  </p>
                </div>
              </div>

              {summary.total - summary.success > 0 && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-white">Validation Errors</p>
                    <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                      Some email addresses failed validation or already exist in your contact list.
                    </p>
                  </div>
                </div>
              )}

              <div className="p-4 apple-glass rounded-2xl flex items-start gap-3 apple-edge-highlight">
                <Info className="w-5 h-5 text-white/80 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-white">Contacts Ready</p>
                  <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                    Successfully imported contacts are now ready for email campaigns.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-8">
              <Button variant="secondary" fullWidth onClick={onClose}>
                Done
              </Button>
              {summary.total - summary.success > 0 && (
                <Button fullWidth onClick={onRetry}>
                  Retry Failed
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
