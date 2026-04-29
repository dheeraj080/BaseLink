import React from 'react';
import { X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Contact, ContactGroup } from '@/types/api';

interface ContactAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingContact: Contact | null;
  availableGroups: ContactGroup[];
  selectedGroups: string[];
  setSelectedGroups: (ids: string[]) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
}

export function ContactAddModal({
  isOpen,
  onClose,
  editingContact,
  availableGroups,
  selectedGroups,
  setSelectedGroups,
  onSubmit,
  loading
}: ContactAddModalProps) {
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
            className="bg-bg-primary border border-border-color rounded-[40px] w-full max-w-xl shadow-modal relative z-10 overflow-hidden"
          >
            <form onSubmit={onSubmit}>
              <div className="px-10 py-8 border-b border-border-color flex items-center justify-between bg-surface-primary/30">
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    {editingContact ? 'Modify Node' : 'Initialize Node'}
                  </h3>
                  <p className="text-[10px] font-bold text-text-secondary mt-1 uppercase tracking-widest leading-none">
                    {editingContact ? 'Update existing configuration' : 'Registry entry sequence'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-12 h-12 flex items-center justify-center bg-surface-primary border border-border-color hover:bg-white hover:text-bg-primary rounded-2xl transition-all shadow-xl"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-12 space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <Input
                    label="Registry Name"
                    name="name"
                    placeholder="e.g. NODE_01"
                    defaultValue={editingContact?.name || ''}
                    className="bg-surface-primary border-border-color rounded-2xl h-14"
                  />
                  <Input
                    label="Telemetry"
                    name="phoneNo"
                    placeholder="+1..."
                    defaultValue={editingContact?.phoneNo || ''}
                    className="bg-surface-primary border-border-color rounded-2xl h-14"
                  />
                </div>
                <Input
                  label="Primary Protocol (Email)"
                  name="email"
                  type="email"
                  placeholder="node@protocol.io"
                  required
                  defaultValue={editingContact?.email || ''}
                  className="bg-surface-primary border-border-color rounded-2xl h-14"
                />
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] ml-1">Assign Operational Categories</label>
                  <div className="flex flex-wrap gap-2.5 p-4 bg-surface-primary border border-border-color rounded-2xl">
                    {availableGroups.length === 0 ? (
                      <span className="text-[10px] text-text-secondary italic">No standard category definitions found.</span>
                    ) : (
                      availableGroups.map((group) => {
                        const isChecked = selectedGroups.includes(group.id!);
                        return (
                          <button
                            type="button"
                            key={group.id}
                            onClick={() => {
                              if (isChecked) {
                                setSelectedGroups(selectedGroups.filter(id => id !== group.id));
                              } else {
                                setSelectedGroups([...selectedGroups, group.id!]);
                              }
                            }}
                            className={cn(
                              "text-[10px] font-bold px-3.5 py-2 rounded-full border transition-all uppercase tracking-widest",
                              isChecked
                                ? "bg-white text-bg-primary border-white"
                                : "bg-surface-primary text-text-secondary border-border-color hover:text-white"
                            )}
                          >
                            {group.name}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] ml-1">Metadata Buffer</label>
                  <textarea
                    name="description"
                    placeholder="Inject internal logic notes..."
                    rows={3}
                    defaultValue={editingContact?.description || ''}
                    className="w-full bg-surface-primary border border-border-color rounded-[24px] py-4 px-6 outline-none focus:border-white transition-all placeholder:text-border-color text-xs font-medium text-white resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="px-10 py-8 border-t border-border-color flex items-center gap-5 bg-surface-primary/30">
                <Button
                  id="cancel-add"
                  variant="secondary"
                  fullWidth
                  type="button"
                  onClick={onClose}
                  className="h-12 rounded-full font-bold uppercase tracking-widest text-[10px]"
                >
                  Abort
                </Button>
                <Button
                  id="confirm-add"
                  fullWidth
                  type="submit"
                  disabled={loading}
                  leftIcon={loading && <Loader2 className="w-5 h-5 animate-spin" />}
                  className="h-12 rounded-full font-bold uppercase tracking-widest text-[10px]"
                >
                  {editingContact ? 'Commit Update' : 'Initialize Core'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
