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
import { ContactAddModal } from '@/components/contacts/ContactAddModal';
import { ImportSummaryModal } from '@/components/contacts/ImportSummaryModal';
import { ClusterManagerModal } from '@/components/contacts/ClusterManagerModal';
import { ContactTable } from '@/components/contacts/ContactTable';

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
  const handleDeleteCluster = async (id: string) => {
    if (confirm("Execute cluster termination sequence?")) {
      try {
        await groupService.delete(id);
        showSuccess(`Cluster deleted.`);
        fetchContacts();
      } catch (e) {
        handleError(e, "Termination aborted.");
      }
    }
  };

  const handleSaveCluster = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('clusterName') as string;
    const description = formData.get('clusterDesc') as string;

    if (!name) {
      handleError(new Error("Header required."));
      return;
    }
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
  };

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

        <ContactTable
          contacts={filteredContacts}
          loading={loading}
          selectedIds={selectedIds}
          handleSelectAll={handleSelectAll}
          handleToggleSelect={handleToggleSelect}
          setEditingContact={setEditingContact}
          setSelectedGroupsForContact={setSelectedGroupsForContact}
          setIsAddModalOpen={setIsAddModalOpen}
        />
      </motion.div>

      <ContactAddModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingContact(null);
        }}
        editingContact={editingContact}
        availableGroups={availableGroups}
        selectedGroups={selectedGroupsForContact}
        setSelectedGroups={setSelectedGroupsForContact}
        onSubmit={handleSaveContact}
        loading={loading}
      />

      <ImportSummaryModal
        isOpen={showImportModal}
        summary={importSummary}
        onClose={() => setShowImportModal(false)}
        onRetry={handleRetryUpload}
      />

      <ClusterManagerModal
        isOpen={isClusterModalOpen}
        onClose={() => setIsClusterModalOpen(false)}
        availableGroups={availableGroups}
        editingCluster={editingCluster}
        setEditingCluster={setEditingCluster}
        selectedIdsSize={selectedIds.size}
        handleDeleteCluster={handleDeleteCluster}
        handleSaveCluster={handleSaveCluster}
        loading={loading}
      />
    </div>
  );
}
