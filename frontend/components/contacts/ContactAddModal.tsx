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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/70 backdrop-blur-md overflow-y-auto">
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
            className="apple-material-thick rounded-[28px] w-full max-w-xl shadow-2xl relative z-10 flex flex-col max-h-[90vh] overflow-hidden apple-edge-highlight"
          >
            <form onSubmit={handleFormSubmit} className="flex flex-col h-full overflow-hidden">
              {/* Header */}
              <div className="px-6 py-5 md:px-8 md:py-6 border-b border-white/10 flex items-center justify-between apple-glass-bar shrink-0">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {editingContact ? 'Edit Subscriber' : 'Add Subscriber'}
                  </h3>
                  <div className="flex gap-2 mt-2">
                    {!editingContact && (
                      <div className="inline-flex p-1 bg-white/5 border border-white/10 rounded-xl">
                        <button 
                          type="button" 
                          onClick={() => setMode('single')}
                          className={cn(
                            "px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                            mode === 'single' ? "bg-white text-black shadow-sm" : "text-text-secondary hover:text-white"
                          )}
                        >
                          Single Entry
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setMode('bulk')}
                          className={cn(
                            "px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                            mode === 'bulk' ? "bg-white text-black shadow-sm" : "text-text-secondary hover:text-white"
                          )}
                        >
                          Bulk Import
                        </button>
                      </div>
                    )}
                    {editingContact && (
                      <p className="text-xs font-medium text-text-secondary">Update subscriber details and categories</p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 text-text-secondary hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 md:p-8 space-y-6 overflow-y-auto flex-grow">
                {mode === 'single' ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Subscriber Name"
                        name="name"
                        placeholder="e.g. Jane Doe"
                        defaultValue={editingContact?.name || ''}
                      />
                      <Input
                        label="Phone Number"
                        name="phoneNo"
                        placeholder="+1 (555) 000-0000"
                        defaultValue={editingContact?.phoneNo || ''}
                      />
                    </div>

                    <Input
                      label="Email Address"
                      name="email"
                      type="email"
                      placeholder="subscriber@example.com"
                      required
                      defaultValue={editingContact?.email || ''}
                    />
                  </>
                ) : (
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-text-secondary tracking-tight ml-1">
                      Bulk Email Payload
                    </label>
                    <textarea
                      value={bulkEmails}
                      onChange={(e) => setBulkEmails(e.target.value)}
                      placeholder="Enter emails separated by commas or newlines..."
                      rows={6}
                      className="w-full apple-glass rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder:text-text-secondary/40 text-xs font-medium text-white resize-none font-mono apple-edge-highlight"
                    />
                    <p className="text-[11px] text-text-secondary ml-1">Separators supported: comma, newline, semicolon</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-text-secondary tracking-tight ml-1">
                    Assign Contact Groups
                  </label>
                  <div className="flex flex-wrap gap-2 p-3 apple-glass rounded-xl apple-edge-highlight">
                    {availableGroups.length === 0 ? (
                      <span className="text-xs text-text-secondary italic">No groups found. Create one first.</span>
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
                              "text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all active:scale-95 cursor-pointer",
                              isChecked
                                ? "bg-white text-black border-white font-bold shadow-sm"
                                : "apple-glass text-text-secondary border-white/10 hover:text-white"
                            )}
                          >
                            {group.name}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-text-secondary tracking-tight ml-1">
                    Notes & Metadata
                  </label>
                  <textarea
                    name="description"
                    placeholder="Add internal notes..."
                    rows={3}
                    defaultValue={editingContact?.description || ''}
                    className="w-full apple-glass rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder:text-text-secondary/40 text-xs font-medium text-white resize-none apple-edge-highlight"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 md:px-8 md:py-5 border-t border-white/10 flex items-center gap-3 apple-glass-bar shrink-0">
                <Button
                  variant="secondary"
                  fullWidth
                  type="button"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  fullWidth
                  type="submit"
                  disabled={loading}
                  loading={loading}
                >
                  {editingContact ? 'Save Changes' : 'Add Subscriber'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}