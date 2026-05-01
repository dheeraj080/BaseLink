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
  onBulkSubmit: (emails: string[]) => void;
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
  onBulkSubmit,
  loading
}: ContactAddModalProps) {
  const [mode, setMode] = React.useState<'single' | 'bulk'>('single');
  const [bulkEmails, setBulkEmails] = React.useState('');

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (mode === 'bulk') {
      const emails = bulkEmails
        .split(/[\n,;]/)
        .map(e => e.trim())
        .filter(e => e.includes('@'));
      if (emails.length === 0) return;
      onBulkSubmit(emails);
    } else {
      onSubmit(e);
    }
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/90 backdrop-blur-md overflow-y-auto">
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
            className="bg-bg-primary border border-border-color rounded-[32px] md:rounded-[40px] w-full max-w-xl shadow-modal relative z-10 flex flex-col max-h-[90vh]"
          >
            <form onSubmit={handleFormSubmit} className="flex flex-col h-full overflow-hidden">
              {/* Header */}
               <div className="px-6 py-6 md:px-10 md:py-8 border-b border-border-color flex items-center justify-between bg-surface-primary/30 flex-shrink-0">
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                    {editingContact ? 'Modify Subscriber' : 'Add Subscriber'}
                  </h3>
                  <div className="flex gap-4 mt-2">
                    {!editingContact && (
                      <>
                        <button 
                          type="button" 
                          onClick={() => setMode('single')}
                          className={cn("text-[9px] font-bold uppercase tracking-widest transition-colors", mode === 'single' ? "text-white" : "text-text-secondary hover:text-white")}
                        >
                          Single Entry
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setMode('bulk')}
                          className={cn("text-[9px] font-bold uppercase tracking-widest transition-colors", mode === 'bulk' ? "text-white" : "text-text-secondary hover:text-white")}
                        >
                          Bulk Initialize
                        </button>
                      </>
                    )}
                    {editingContact && (
                       <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest leading-none">Update existing configuration</p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-surface-primary border border-border-color hover:bg-white hover:text-bg-primary rounded-xl md:rounded-2xl transition-all shadow-xl"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 md:p-12 space-y-8 md:space-y-10 overflow-y-auto flex-grow">
                {mode === 'single' ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                      <Input
                        label="Subscriber Name"
                        name="name"
                        placeholder="e.g. SUB_01"
                        defaultValue={editingContact?.name || ''}
                        className="bg-surface-primary border-border-color rounded-2xl h-12 md:h-14"
                      />
                      <Input
                        label="Telemetry"
                        name="phoneNo"
                        placeholder="+1..."
                        defaultValue={editingContact?.phoneNo || ''}
                        className="bg-surface-primary border-border-color rounded-2xl h-12 md:h-14"
                      />
                    </div>

                    <Input
                      label="Primary Protocol (Email)"
                      name="email"
                      type="email"
                      placeholder="subscriber@baselink.com"
                      required
                      defaultValue={editingContact?.email || ''}
                      className="bg-surface-primary border-border-color rounded-2xl h-12 md:h-14"
                    />
                  </>
                ) : (
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] ml-1">
                      Bulk Protocol Payload (Emails)
                    </label>
                    <textarea
                      value={bulkEmails}
                      onChange={(e) => setBulkEmails(e.target.value)}
                      placeholder="Enter emails separated by commas or newlines..."
                      rows={8}
                      className="w-full bg-surface-primary border border-border-color rounded-[24px] py-6 px-6 outline-none focus:border-white transition-all placeholder:text-border-color text-sm font-medium text-white resize-none font-mono"
                    ></textarea>
                    <p className="text-[9px] font-bold text-text-secondary/40 ml-1 uppercase tracking-[0.1em]">Separators: Comma, Newline, Semicolon</p>
                  </div>
                )}

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] ml-1">
                    Assign Operational Categories
                  </label>
                  <div className="flex flex-wrap gap-2.5 p-3 md:p-4 bg-surface-primary border border-border-color rounded-2xl">
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
                              "text-[10px] font-bold px-3 py-2 md:px-3.5 md:py-2 rounded-full border transition-all uppercase tracking-widest",
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
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] ml-1">
                    Metadata Buffer
                  </label>
                  <textarea
                    name="description"
                    placeholder="Inject internal logic notes..."
                    rows={3}
                    defaultValue={editingContact?.description || ''}
                    className="w-full bg-surface-primary border border-border-color rounded-[24px] py-4 px-6 outline-none focus:border-white transition-all placeholder:text-border-color text-xs font-medium text-white resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-6 md:px-10 md:py-8 border-t border-border-color flex items-center gap-5 bg-surface-primary/30 flex-shrink-0">
                <Button
                  variant="secondary"
                  fullWidth
                  type="button"
                  onClick={onClose}
                  className="h-12 rounded-full font-bold uppercase tracking-widest text-[10px]"
                >
                  Abort
                </Button>
                <Button
                  fullWidth
                  type="submit"
                  disabled={loading}
                  leftIcon={loading && <Loader2 className="w-5 h-5 animate-spin" />}
                  className="h-12 rounded-full font-bold uppercase tracking-widest text-[10px]"
                >
                  {editingContact ? 'Commit Update' : 'Initialize Subscriber'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}