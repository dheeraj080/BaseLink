import React from 'react';
import { X, Pencil, Trash2, CheckSquare, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { ContactGroup } from '@/types/api';

interface ClusterManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableGroups: ContactGroup[];
  editingCluster: ContactGroup | null;
  setEditingCluster: (group: ContactGroup | null) => void;
  selectedIdsSize: number;
  handleDeleteCluster: (id: string) => Promise<void>;
  handleSaveCluster: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  loading: boolean;
}

export function ClusterManagerModal({
  isOpen,
  onClose,
  availableGroups,
  editingCluster,
  setEditingCluster,
  selectedIdsSize,
  handleDeleteCluster,
  handleSaveCluster,
  loading
}: ClusterManagerModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md">
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
            className="bg-bg-primary border border-border-color rounded-[40px] w-full max-w-4xl shadow-modal relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="px-10 py-8 border-b border-border-color flex items-center justify-between bg-surface-primary/30">
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Clusters</h3>
                <p className="text-[10px] font-bold text-text-secondary mt-1 uppercase tracking-widest leading-none">Categorization & logical segmentation</p>
              </div>
              <button
                onClick={onClose}
                className="w-12 h-12 flex items-center justify-center bg-surface-primary border border-border-color hover:bg-white hover:text-bg-primary rounded-2xl transition-all shadow-xl"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 p-10 overflow-y-auto space-y-10">
              {/* Active Clusters List */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em]">Active Clusters</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availableGroups.map((group) => (
                    <div
                      key={group.id}
                      className={cn(
                        "p-6 bg-surface-primary border rounded-[24px] flex items-center justify-between transition-all group",
                        editingCluster?.id === group.id ? "border-white" : "border-border-color hover:border-white/10"
                      )}
                    >
                      <div className="flex flex-col gap-1 overflow-hidden">
                        <span className="text-sm font-bold text-white truncate">{group.name}</span>
                        <span className="text-[10px] text-text-secondary truncate font-medium">{group.description || 'No descriptor notes.'}</span>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingCluster(group)}
                          className="p-2.5 bg-bg-primary border border-border-color text-text-secondary hover:text-white rounded-xl transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCluster(group.id!)}
                          className="p-2.5 bg-bg-primary border border-border-color text-text-secondary hover:text-red-500 rounded-xl transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {availableGroups.length === 0 && (
                    <span className="text-xs text-text-secondary italic">No configured clusters.</span>
                  )}
                </div>
              </div>

              <div className="h-px bg-border-color"></div>

              {/* Form Section */}
              <form onSubmit={handleSaveCluster} className="space-y-6 bg-surface-primary/20 p-8 rounded-[32px] border border-border-color/50">
                <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">
                  {editingCluster ? 'Modify Target Cluster' : 'Provision New Cluster'}
                </h4>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] ml-1">Cluster Identifier</label>
                    <input
                      name="clusterName"
                      key={editingCluster?.id || 'new'}
                      placeholder="e.g. MARKETING_SEQUENCES"
                      required
                      defaultValue={editingCluster?.name || ''}
                      className="w-full bg-surface-primary border border-border-color rounded-2xl h-14 px-6 outline-none focus:border-white transition-all text-sm text-white mt-2"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] ml-1">Logical Scope</label>
                    <input
                      name="clusterDesc"
                      key={(editingCluster?.id || 'new') + '-desc'}
                      placeholder="Provide tracking scope parameters..."
                      defaultValue={editingCluster?.description || ''}
                      className="w-full bg-surface-primary border border-border-color rounded-2xl h-14 px-6 outline-none focus:border-white transition-all text-sm text-white mt-2"
                    />
                  </div>
                </div>

                {selectedIdsSize > 0 && !editingCluster && (
                  <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3">
                    <CheckSquare className="w-4 h-4 text-white" />
                    <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">
                      Will automatically assign {selectedIdsSize} marked nodes.
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 justify-end pt-2">
                  {editingCluster && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setEditingCluster(null)}
                      className="h-12 px-6 rounded-full font-bold uppercase tracking-widest text-[10px]"
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={loading}
                    leftIcon={loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    className="h-12 px-8 rounded-full font-bold uppercase tracking-widest text-[10px]"
                  >
                    {editingCluster ? 'Confirm Changes' : 'Initialize Cluster'}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
