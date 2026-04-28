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
  Boxes,
  Mail,
  CheckSquare,
  Square,
  Loader2,
  X,
  Smartphone,
  Info,
  AlertCircle,
  MessageSquare,
  Pencil
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { cn, handleError, showSuccess } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { analyticsService } from '@/services/analytics.service';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [totalReplies, setTotalReplies] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [availableGroups, setAvailableGroups] = useState<ContactGroup[]>([]);
  const [selectedGroupsForContact, setSelectedGroupsForContact] = useState<string[]>([]);
  const [isClusterModalOpen, setIsClusterModalOpen] = useState(false);
  const [editingCluster, setEditingCluster] = useState<ContactGroup | null>(null);
  const [filterClusterId, setFilterClusterId] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [importSummary, setImportSummary] = useState<{ success: number; total: number } | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchContacts = async () => {
    try {
      const [contactsData, statsData, groupsData] = await Promise.all([
        contactService.getContacts(),
        analyticsService.getStats(),
        groupService.list()
      ]);
      setContacts(contactsData);
      setAvailableGroups(groupsData || []);
      setTotalReplies(statsData?.totalReplied || 0);
    } catch (error) {
      handleError(error, 'Failed to update index dependencies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [contactsData, statsData, groupsData] = await Promise.all([
          contactService.getContacts(),
          analyticsService.getStats(),
          groupService.list()
        ]);
        if (isMounted) {
          setContacts(contactsData);
          setTotalReplies(statsData?.totalReplied || 0);
          setAvailableGroups(groupsData || []);
          setLoading(false);
        }
      } catch (error) {
        handleError(error, 'Failed to fetch core node indices');
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
      handleError(error, 'Failed to update selection');
    }
  };

  const handleSaveContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phoneNo = formData.get('phoneNo') as string;
    const description = formData.get('description') as string;

    if (!email) {
      handleError(new Error('Email is required'));
      return;
    }

    setLoading(true);
    try {
      const groupsPayload = selectedGroupsForContact.map(id => ({ id }));
      if (editingContact) {
        await contactService.updateContact(editingContact.id!, {
          name,
          email,
          phoneNo,
          description,
          selected: editingContact.selected || false,
          groups: groupsPayload
        });
        showSuccess('Contact updated successfully');
        setEditingContact(null);
      } else {
        await contactService.createContact({
          name,
          email,
          phoneNo,
          description,
          selected: false,
          groups: groupsPayload
        });
        showSuccess('Contact created successfully');
      }
      setIsAddModalOpen(false);
      fetchContacts();
    } catch (error) {
      handleError(error, 'Failed to create contact');
    } finally {
      setLoading(false);
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
      handleError(error, 'Failed to perform bulk selection');
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;

    const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedIds.size} selected contacts? This action cannot be undone.`);
    if (!confirmDelete) return;

    try {
      setLoading(true);
      await Promise.all(
        Array.from(selectedIds).map(id => contactService.deleteContact(id))
      );
      showSuccess(`${selectedIds.size} contacts deleted successfully`);
      setSelectedIds(new Set());
      fetchContacts();
    } catch (error) {
      handleError(error, 'Failed to delete selected contacts');
    } finally {
      setLoading(false);
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
      showSuccess('Contacts exported successfully');
    } catch (error) {
      handleError(error, 'Export failed');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLastFile(file);
    setIsUploading(true);

    try {
      // Estimate total lines (excluding header)
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      const totalCount = Math.max(0, lines.length - 1); // Subtract header

      const data = await contactService.uploadCsv(file);

      setImportSummary({
        success: data.length,
        total: totalCount
      });
      setShowImportModal(true);
      fetchContacts();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      handleError(error, 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetryUpload = () => {
    if (lastFile) {
      setShowImportModal(false);
      const event = { target: { files: [lastFile] } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(event);
    }
  };

  const filteredContacts = Array.isArray(contacts)
    ? contacts.filter(c => {
        const matchesSearch = c.name?.toLowerCase().includes(search.toLowerCase()) ||
                             c.email?.toLowerCase().includes(search.toLowerCase());
        
        if (filterClusterId === 'all') return matchesSearch;
        const belongsToCluster = (c.groups || []).some(g => g.id === filterClusterId);
        return matchesSearch && belongsToCluster;
      })
    : [];

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-white tracking-tighter">Registry Nodes</h1>
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <p className="text-text-secondary text-sm font-medium">Build and manage your professional audience protocols.</p>
            <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-1 rounded-full text-[10px] text-green-400 font-bold uppercase tracking-widest">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{totalReplies} Total Replies</span>
            </div>
          </div>
        </motion.div>
        <div className="flex items-center gap-4">
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
            className="h-12 px-8 font-bold uppercase tracking-widest text-[10px] rounded-full"
            leftIcon={!isUploading && <Upload className="w-4 h-4" />}
          >
            Import CSV
          </Button>
          <Button
            id="cluster-contacts"
            variant="ghost"
            onClick={() => {
              setEditingCluster(null);
              setIsClusterModalOpen(true);
            }}
            className="h-12 px-8 font-bold uppercase tracking-widest text-[10px] rounded-full border border-white/5 hover:border-white/10"
            leftIcon={<Boxes className="w-4 h-4" />}
          >
            Cluster Manager
          </Button>

          <Button
            id="add-contact"
            onClick={() => {
              setEditingContact(null);
              setSelectedGroupsForContact([]);
              setIsAddModalOpen(true);
            }}
            className="h-12 px-8 font-bold uppercase tracking-widest text-[10px] rounded-full"
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
        className="bg-surface-primary border border-border-color rounded-[32px] overflow-hidden shadow-2xl shadow-black/20"
      >
        <div className="p-8 border-b border-border-color flex flex-col md:flex-row gap-6 items-center justify-between bg-bg-primary/50">
          <div className="w-full md:w-[400px]">
            <Input
              placeholder="Search registry indices..."
              leftIcon={<Search className="w-4 h-4 text-text-secondary" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 rounded-2xl bg-surface-primary border-border-color"
            />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-surface-primary border border-border-color px-4 py-2 rounded-2xl h-12">
              <Filter className="w-4 h-4 text-text-secondary" />
              <select
                value={filterClusterId}
                onChange={(e) => setFilterClusterId(e.target.value)}
                className="bg-transparent text-[10px] font-bold text-white uppercase tracking-widest outline-none border-none cursor-pointer pr-4"
              >
                <option value="all" className="bg-bg-primary text-white">All Clusters</option>
                {availableGroups.map((group) => (
                  <option key={group.id} value={group.id} className="bg-bg-primary text-white">
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
            {selectedIds.size > 0 && (
              <motion.div initial={{ opacity: 0, x: 5 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
                <div className="h-8 w-px bg-border-color mx-2"></div>
                <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">{selectedIds.size} Marked</span>
                <button
                  onClick={handleDeleteSelected}
                  title="Delete"
                  id="delete-selected"
                  className="p-3 bg-bg-primary border border-border-color text-text-secondary hover:text-white hover:border-white/20 rounded-xl transition-all shadow-xl"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-primary/30 border-b border-border-color">
                <th className="px-8 py-6 w-16">
                  <button onClick={handleSelectAll} className="text-text-secondary/30 hover:text-white transition-all">
                    {selectedIds.size === contacts.length && contacts.length > 0 ? (
                      <CheckSquare className="w-5 h-5 text-white" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary">Identifier</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary">Communication Layer</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary">Protocol Groups</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary text-right">Initialized</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-6 h-6 border-2 border-border-color border-t-white rounded-full animate-spin"></div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Syncing registry...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="w-16 h-16 bg-bg-primary border border-border-color rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Search className="w-8 h-8 text-text-secondary/20" />
                    </div>
                    <p className="text-sm font-medium text-text-secondary">No node records found in this sequence.</p>
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className={cn(
                      "group hover:bg-white/[0.02] transition-colors cursor-pointer",
                      selectedIds.has(contact.id!) ? "bg-white/[0.03]" : ""
                    )}
                    onClick={() => handleToggleSelect(contact.id!, contact.selected || false)}
                  >
                    <td className="px-8 py-6">
                      <button className={cn(
                        "transition-all",
                        selectedIds.has(contact.id!) ? "text-white" : "text-text-secondary/20 group-hover:text-text-secondary/50"
                      )}>
                        {selectedIds.has(contact.id!) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                      </button>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-white text-[15px] tracking-tight">{contact.name || 'ANONYMOUS_NODE'}</span>
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-widest text-text-secondary/50 mt-1">{contact.description || 'Null metadata'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium text-text-secondary group-hover:text-white transition-colors">{contact.email}</span>
                        {contact.phoneNo && (
                          <span className="text-[10px] font-bold text-text-secondary/40 tracking-widest">{contact.phoneNo}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-2">
                        {contact.groups?.slice(0, 2).map((group) => (
                          <span key={group.id} className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/5 text-text-secondary border border-white/5">
                            {group.name}
                          </span>
                        ))}
                        {(contact.groups?.length || 0) > 2 && (
                          <span className="text-[9px] font-bold text-text-secondary/30 uppercase tracking-widest">
                            +{(contact.groups?.length || 0) - 2} EXT.
                          </span>
                        )}
                        {!contact.groups?.length && <span className="text-text-secondary/20">—</span>}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary/60 whitespace-nowrap">
                          {contact.createdAt ? format(new Date(contact.createdAt), 'MMM dd, yyyy') : '—'}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingContact(contact);
                            setSelectedGroupsForContact((contact.groups || []).map(g => g.id!));
                            setIsAddModalOpen(true);
                          }}
                          className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-text-secondary hover:text-white hover:border-white/10 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0"
              onClick={() => setIsAddModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-bg-primary border border-border-color rounded-[40px] w-full max-w-xl shadow-modal relative z-10 overflow-hidden"
            >
              <form onSubmit={handleSaveContact}>
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
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setEditingContact(null);
                    }}
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
                          const isChecked = selectedGroupsForContact.includes(group.id!);
                          return (
                            <button
                              type="button"
                              key={group.id}
                              onClick={() => {
                                if (isChecked) {
                                  setSelectedGroupsForContact(selectedGroupsForContact.filter(id => id !== group.id));
                                } else {
                                  setSelectedGroupsForContact([...selectedGroupsForContact, group.id!]);
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
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setEditingContact(null);
                    }}
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
      {/* Import Result Modal */}
      <AnimatePresence>
        {showImportModal && importSummary && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0"
              onClick={() => setShowImportModal(false)}
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
                <button onClick={() => setShowImportModal(false)} className="w-12 h-12 flex items-center justify-center bg-surface-primary border border-border-color hover:bg-white hover:text-bg-primary rounded-2xl transition-all shadow-xl">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-surface-primary border border-border-color p-8 rounded-[32px] text-center">
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.3em] mb-2">Verified</p>
                    <p className="text-4xl font-bold text-white tracking-tighter">{importSummary.success}</p>
                  </div>
                  <div className="bg-surface-primary border border-border-color p-8 rounded-[32px] text-center">
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.3em] mb-2">Rejected</p>
                    <p className={cn(
                      "text-4xl font-bold tracking-tighter",
                      importSummary.total - importSummary.success > 0 ? "text-red-500" : "text-text-secondary/20"
                    )}>
                      {Math.max(0, importSummary.total - importSummary.success)}
                    </p>
                  </div>
                </div>

                {importSummary.total - importSummary.success > 0 && (
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
                <Button variant="secondary" fullWidth onClick={() => setShowImportModal(false)} className="h-14 font-bold uppercase tracking-widest text-[10px] rounded-full">
                  Cease Report
                </Button>
                {importSummary.total - importSummary.success > 0 && (
                  <Button fullWidth onClick={handleRetryUpload} className="h-14 font-bold uppercase tracking-widest text-[10px] rounded-full">
                    Retry Protocol
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Cluster Management Modal */}
      <AnimatePresence>
        {isClusterModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0"
              onClick={() => setIsClusterModalOpen(false)}
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
                  onClick={() => setIsClusterModalOpen(false)}
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
                            onClick={async () => {
                              if (confirm("Execute cluster termination sequence?")) {
                                try {
                                  await groupService.delete(group.id!);
                                  showSuccess(`Cluster deleted.`);
                                  fetchContacts();
                                } catch (e) {
                                  handleError(e, "Termination aborted.");
                                }
                              }
                            }}
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
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const formData = new FormData(form);
                    const name = formData.get('clusterName') as string;
                    const description = formData.get('clusterDesc') as string;

                    if (!name) return handleError(new Error("Header required."));
                    setLoading(true);

                    try {
                      if (editingCluster) {
                        await groupService.update(editingCluster.id!, { name, description });
                        showSuccess("Cluster modifications committed.");
                      } else {
                        const newCluster = await groupService.create({ name, description });
                        if (selectedIds.size > 0) {
                          await groupService.addSelected(newCluster.id!);
                          showSuccess(`Cluster mapped with ${selectedIds.size} nodes.`);
                        } else {
                          showSuccess("Cluster mapped successfully.");
                        }
                      }
                      setEditingCluster(null);
                      form.reset();
                      fetchContacts();
                    } catch (e) {
                      handleError(e, "Mapping failed.");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="space-y-6 bg-surface-primary/20 p-8 rounded-[32px] border border-border-color/50"
                >
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

                  {selectedIds.size > 0 && !editingCluster && (
                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3">
                      <CheckSquare className="w-4 h-4 text-white" />
                      <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">
                        Will automatically assign {selectedIds.size} marked nodes.
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
    </div>
  );
}
