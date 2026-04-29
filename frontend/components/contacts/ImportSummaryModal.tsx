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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-bg-primary border border-border-color rounded-[40px] w-full max-w-md shadow-modal p-10 relative z-10"
          >
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Sync Report</h3>
                <p className="text-[10px] font-bold text-text-secondary mt-1 uppercase tracking-widest leading-none">Registry update telemetry</p>
              </div>
              <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-surface-primary border border-border-color hover:bg-white hover:text-bg-primary rounded-2xl transition-all shadow-xl">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-surface-primary border border-border-color p-8 rounded-[32px] text-center">
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.3em] mb-2">Verified</p>
                  <p className="text-4xl font-bold text-white tracking-tighter">{summary.success}</p>
                </div>
                <div className="bg-surface-primary border border-border-color p-8 rounded-[32px] text-center">
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.3em] mb-2">Rejected</p>
                  <p className={cn(
                    "text-4xl font-bold tracking-tighter",
                    summary.total - summary.success > 0 ? "text-red-500" : "text-text-secondary/20"
                  )}>
                    {Math.max(0, summary.total - summary.success)}
                  </p>
                </div>
              </div>

              {summary.total - summary.success > 0 && (
                <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-[24px] flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[13px] font-bold text-white uppercase tracking-wider">Protocol Violation</p>
                    <p className="text-xs text-text-secondary mt-1 font-medium leading-relaxed">
                      Data nodes failed validation due to schema corruption or duplicate indices.
                    </p>
                  </div>
                </div>
              )}

              <div className="p-6 bg-white/5 border border-white/10 rounded-[24px] flex items-start gap-4">
                <Info className="w-6 h-6 text-white shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-bold text-white uppercase tracking-wider">Registry Loaded</p>
                  <p className="text-xs text-text-secondary mt-1 font-medium leading-relaxed">
                    All verified nodes are now active within the core registry matrix.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-12">
              <Button variant="secondary" fullWidth onClick={onClose} className="h-14 font-bold uppercase tracking-widest text-[10px] rounded-full">
                Cease Report
              </Button>
              {summary.total - summary.success > 0 && (
                <Button fullWidth onClick={onRetry} className="h-14 font-bold uppercase tracking-widest text-[10px] rounded-full">
                  Retry Protocol
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
