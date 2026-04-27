'use client';

import React, { useEffect, useState, useRef } from 'react';
import { contactService, groupService } from '@/services/contact.service';
import { Contact, ContactGroup } from '@/types/api';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Download, 
  Upload, 
  UserPlus, 
  Trash2,
  Mail,
  CheckSquare,
  Square,
  Loader2,
  X,
  Smartphone,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newContact, setNewContact] = useState<Partial<Contact>>({ selected: false });
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveContact = async () => {
    if (!newContact.email) return;
    setIsSaving(true);
    try {
      await contactService.createContact(newContact as Contact);
      await fetchContacts();
      setIsAddModalOpen(false);
      setNewContact({ selected: false });
    } catch (error) {
      console.error('Failed to create contact', error);
    } finally {
      setIsSaving(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const data = await contactService.getContacts();
      setContacts(data);
    } catch (error) {
      console.error('Failed to fetch contacts', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    async function loadData() {
      try {
        const data = await contactService.getContacts();
        if (isMounted) {
          setContacts(data);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch contacts', error);
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleSelect = async (id: string, currentSelected: boolean) => {
    try {
      await contactService.toggleSelection(id, !currentSelected);
      setContacts(contacts.map(c => c.id === id ? { ...c, selected: !currentSelected } : c));
      
      const newSelected = new Set(selectedIds);
      if (!currentSelected) newSelected.add(id);
      else newSelected.delete(id);
      setSelectedIds(newSelected);
    } catch (error) {
      console.error('Failed to toggle selection', error);
    }
  };

  const handleSelectAll = async () => {
    const allSelected = selectedIds.size === contacts.length;
    try {
      const ids = contacts.map(c => c.id!).filter(id => !!id);
      await contactService.bulkSelect({ contactIds: ids, selected: !allSelected });
      
      if (allSelected) {
        setSelectedIds(new Set());
        setContacts(contacts.map(c => ({ ...c, selected: false })));
      } else {
        setSelectedIds(new Set(ids));
        setContacts(contacts.map(c => ({ ...c, selected: true })));
      }
    } catch (error) {
      console.error('Failed bulk selection', error);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await contactService.exportCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contacts-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error('Export failed', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await contactService.uploadCsv(file);
      fetchContacts();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Upload failed', error);
    } finally {
      setIsUploading(false);
    }
  };

  const filteredContacts = contacts.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div
           initial={{ opacity: 0, y: -10 }}
           animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-soft-linen tracking-tight">Contacts</h1>
          <p className="text-silver text-sm mt-1">
            Build and manage your professional audience segments.
          </p>
        </motion.div>
        <div className="flex items-center gap-3">
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
          />
          <Button 
            id="upload-contacts"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            loading={isUploading}
            leftIcon={!isUploading && <Upload className="w-4 h-4" />}
          >
            Import CSV
          </Button>
          <Button 
            id="add-contact"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Contact
          </Button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-onyx border border-onyx-400 rounded-xl overflow-hidden shadow-sm"
      >
        <div className="p-5 border-b border-onyx-400 flex flex-col md:flex-row gap-4 items-center justify-between bg-onyx-100/50">
          <div className="w-full md:w-[320px]">
            <Input
              placeholder="Search contacts..."
              leftIcon={<Search className="w-4 h-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button variant="ghost" size="sm" leftIcon={<Filter className="w-4 h-4" />}>
              Filter
            </Button>
            {selectedIds.size > 0 && (
              <motion.div initial={{ opacity: 0, x: 5 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
                <div className="h-6 w-px bg-onyx-400 mx-1"></div>
                <span className="text-xs font-semibold text-soft-linen">{selectedIds.size} selected</span>
                <button title="Delete" id="delete-selected" className="p-2 text-silver hover:text-soft-linen hover:bg-white-smoke/10 rounded-lg transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-onyx-100/50 border-b border-onyx-400">
                <th className="px-6 py-4 w-12">
                  <button onClick={handleSelectAll} className="text-onyx-600 hover:text-onyx-400 transition-all">
                    {selectedIds.size === contacts.length && contacts.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-soft-linen" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-silver/50">Name</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-silver/50">Contact Information</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-silver/50">Segments</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-silver/50 text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-onyx-400">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-5 h-5 border-2 border-onyx-400 border-t-soft-linen rounded-full animate-spin"></div>
                      <p className="text-xs text-silver">Loading contacts...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <Search className="w-8 h-8 mx-auto mb-3 text-onyx-800" />
                    <p className="text-sm text-silver">No contacts found in this segment.</p>
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <tr 
                    key={contact.id} 
                    className={cn(
                      "group hover:bg-onyx-100/30 transition-colors cursor-pointer",
                      selectedIds.has(contact.id!) ? "bg-white-smoke/5" : ""
                    )}
                    onClick={() => handleToggleSelect(contact.id!, contact.selected || false)}
                  >
                    <td className="px-6 py-4">
                      <button className={cn(
                        "transition-all",
                        selectedIds.has(contact.id!) ? "text-soft-linen" : "text-onyx-700 group-hover:text-onyx-500"
                      )}>
                        {selectedIds.has(contact.id!) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-soft-linen">{contact.name || 'Set Name'}</span>
                        <span className="text-xs text-silver mt-0.5">{contact.description || 'No description'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-white-smoke">{contact.email}</span>
                        {contact.phoneNo && (
                          <span className="text-[11px] text-silver">{contact.phoneNo}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {contact.groups?.slice(0, 2).map((group) => (
                          <span key={group.id} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-onyx-400 text-silver border border-onyx-300">
                            {group.name}
                          </span>
                        ))}
                        {(contact.groups?.length || 0) > 2 && (
                          <span className="text-[10px] font-medium text-onyx-600">
                            +{(contact.groups?.length || 0) - 2} more
                          </span>
                        )}
                        {!contact.groups?.length && <span className="text-onyx-700">—</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-xs text-silver font-medium whitespace-nowrap">
                        {contact.createdAt ? format(new Date(contact.createdAt), 'MMM dd, yyyy') : '—'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add Contact Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-onyx/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0" 
              onClick={() => setIsAddModalOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.98, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 10 }}
              className="bg-onyx border border-onyx-400 rounded-xl w-full max-w-lg shadow-2xl p-8 relative z-10"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-soft-linen">Create Contact</h3>
                  <p className="text-sm text-silver mt-1">Fill in the details to add a new contact.</p>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 bg-onyx hover:bg-onyx-100 rounded-lg transition-all text-silver">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input 
                    label="Full Name" 
                    placeholder="e.g. Jane Doe" 
                    value={newContact.name || ''} 
                    onChange={e => setNewContact({...newContact, name: e.target.value})}
                  />
                  <Input 
                    label="Phone Number" 
                    placeholder="+1..." 
                    value={newContact.phoneNo || ''}
                    onChange={e => setNewContact({...newContact, phoneNo: e.target.value})}
                  />
                </div>
                <Input 
                  label="Email Address" 
                  type="email" 
                  placeholder="jane@example.com" 
                  value={newContact.email || ''}
                  onChange={e => setNewContact({...newContact, email: e.target.value})}
                />
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-silver ml-1">Notes</label>
                  <textarea 
                    placeholder="Add any internal notes..." 
                    rows={4} 
                    value={newContact.description || ''}
                    onChange={e => setNewContact({...newContact, description: e.target.value})}
                    className="w-full bg-onyx border border-onyx-400 rounded-lg py-3 px-4 outline-none focus:border-silver transition-all placeholder:text-onyx-700 text-sm text-soft-linen resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-10">
                <Button id="cancel-add" variant="secondary" fullWidth onClick={() => { setIsAddModalOpen(false); setNewContact({ selected: false }); }}>
                  Cancel
                </Button>
                <Button id="confirm-add" fullWidth onClick={handleSaveContact} loading={isSaving} disabled={!newContact.email}>
                  Save Contact
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
