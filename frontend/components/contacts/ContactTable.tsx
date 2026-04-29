import React from 'react';
import { CheckSquare, Square, Search, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Contact } from '@/types/api';

interface ContactTableProps {
  contacts: Contact[];
  loading: boolean;
  selectedIds: Set<string>;
  handleSelectAll: () => void;
  handleToggleSelect: (id: string, selected: boolean) => void;
  setEditingContact: (contact: Contact) => void;
  setSelectedGroupsForContact: (ids: string[]) => void;
  setIsAddModalOpen: (open: boolean) => void;
}

export function ContactTable({
  contacts,
  loading,
  selectedIds,
  handleSelectAll,
  handleToggleSelect,
  setEditingContact,
  setSelectedGroupsForContact,
  setIsAddModalOpen
}: ContactTableProps) {
  return (
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
          ) : contacts.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-8 py-24 text-center">
                <div className="w-16 h-16 bg-bg-primary border border-border-color rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Search className="w-8 h-8 text-text-secondary/20" />
                </div>
                <p className="text-sm font-medium text-text-secondary">No node records found in this sequence.</p>
              </td>
            </tr>
          ) : (
            contacts.map((contact) => (
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
  );
}
