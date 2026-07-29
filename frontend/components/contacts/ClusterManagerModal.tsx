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
            className="apple-material-thick rounded-[28px] w-full max-w-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] apple-edge-highlight"
          >
            <div className="px-6 py-5 md:px-8 md:py-6 border-b border-white/10 flex items-center justify-between apple-glass-bar">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Contact Groups</h3>
                <p className="text-xs font-medium text-text-secondary mt-0.5">Categorization & subscriber list segmentation</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 text-text-secondary hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8">
              {/* Active Clusters List */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-semibold text-text-secondary tracking-tight">Active Groups</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableGroups.map((group) => (
                    <div
                      key={group.id}
                      className={cn(
                        "p-4 apple-glass rounded-xl flex items-center justify-between transition-all group active:scale-[0.99]",
                        editingCluster?.id === group.id ? "border-white border" : "apple-edge-highlight"
                      )}
                    >
                      <div className="flex flex-col gap-0.5 overflow-hidden min-w-0 flex-1 pr-2">
                        <span className="text-sm font-bold text-white truncate tracking-tight">{group.name}</span>
                        <span className="text-xs text-text-secondary truncate">{group.description || 'No description notes.'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={() => setEditingCluster(group)}
                          className="p-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-lg transition-all cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCluster(group.id!)}
                          className="p-2 bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 text-rose-400 rounded-lg transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {availableGroups.length === 0 && (
                    <span className="text-xs text-text-secondary italic">No configured contact groups yet.</span>
                  )}
                </div>
              </div>

              <div className="h-px bg-white/10" />

              {/* Form Section */}
              <form onSubmit={handleSaveCluster} className="space-y-5 apple-glass p-6 rounded-2xl border border-white/10 apple-edge-highlight">
                <h4 className="text-xs font-bold text-white">
                  {editingCluster ? 'Edit Group' : 'Create New Group'}
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-[11px] font-semibold text-text-secondary tracking-tight ml-1">Group Name</label>
                    <input
                      name="clusterName"
                      key={editingCluster?.id || 'new'}
                      placeholder="e.g. Newsletter Subscribers"
                      required
                      defaultValue={editingCluster?.name || ''}
                      className="w-full apple-glass rounded-xl h-11 px-4 outline-none focus:ring-2 focus:ring-white/20 transition-all text-xs font-medium text-white mt-1.5 apple-edge-highlight"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-text-secondary tracking-tight ml-1">Description</label>
                    <input
                      name="clusterDesc"
                      key={(editingCluster?.id || 'new') + '-desc'}
                      placeholder="Audience parameters or description..."
                      defaultValue={editingCluster?.description || ''}
                      className="w-full apple-glass rounded-xl h-11 px-4 outline-none focus:ring-2 focus:ring-white/20 transition-all text-xs font-medium text-white mt-1.5 apple-edge-highlight"
                    />
                  </div>
                </div>

                {selectedIdsSize > 0 && !editingCluster && (
                  <div className="p-3 bg-white/10 rounded-xl flex items-center gap-2.5">
                    <CheckSquare className="w-4 h-4 text-white" />
                    <span className="text-xs text-text-secondary font-medium">
                      Will automatically assign {selectedIdsSize} selected contacts.
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 justify-end pt-2">
                  {editingCluster && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setEditingCluster(null)}
                    >
                      Cancel Edit
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={loading}
                    loading={loading}
                  >
                    {editingCluster ? 'Save Group' : 'Create Group'}
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
