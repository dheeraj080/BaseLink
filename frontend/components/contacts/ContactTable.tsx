import React, { useState } from 'react';
import { CheckSquare, Square, Search, Pencil, BarChart3, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Contact, AnalyticsStatsDto } from '@/types/api';
import { analyticsService } from '@/services/analytics.service';

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
  const [expandedContactId, setExpandedContactId] = useState<string | null>(null);
  const [contactStats, setContactStats] = useState<AnalyticsStatsDto | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="apple-glass-bar border-b border-white/10">
            <th className="px-6 py-4 w-12">
              <button onClick={handleSelectAll} className="text-text-secondary hover:text-white transition-all cursor-pointer">
                {selectedIds.size === contacts.length && contacts.length > 0 ? (
                  <CheckSquare className="w-4 h-4 text-white" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </button>
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-text-secondary tracking-tight">Name & Details</th>
            <th className="px-6 py-4 text-xs font-semibold text-text-secondary tracking-tight">Email & Phone</th>
            <th className="px-6 py-4 text-xs font-semibold text-text-secondary tracking-tight">Groups</th>
            <th className="px-6 py-4 text-xs font-semibold text-text-secondary tracking-tight text-right">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {loading ? (
            <tr>
              <td colSpan={5} className="px-6 py-20 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <p className="text-xs font-semibold text-text-secondary">Syncing contact registry...</p>
                </div>
              </td>
            </tr>
          ) : contacts.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-20 text-center">
                <div className="w-12 h-12 apple-glass rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <Search className="w-6 h-6 text-white/30" />
                </div>
                <p className="text-sm font-semibold text-text-secondary">No contacts found in this sequence.</p>
              </td>
            </tr>
          ) : (
            contacts.map((contact) => (
              <React.Fragment key={contact.id}>
                <tr
                  className={cn(
                    "group hover:bg-white/5 transition-all duration-150 cursor-pointer active:bg-white/10",
                    selectedIds.has(contact.id!) ? "bg-white/10" : ""
                  )}
                  onClick={() => handleToggleSelect(contact.id!, contact.selected || false)}
                >
                  <td className="px-6 py-4">
                    <button className={cn(
                      "transition-all cursor-pointer",
                      selectedIds.has(contact.id!) ? "text-white" : "text-text-secondary/40 group-hover:text-text-secondary"
                    )}>
                      {selectedIds.has(contact.id!) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-sm tracking-tight">{contact.name || 'Anonymous Contact'}</span>
                      {contact.description && (
                        <span className="text-xs font-medium text-text-secondary mt-0.5">{contact.description}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-medium text-white/90">{contact.email}</span>
                      {contact.phoneNo && (
                        <span className="text-[11px] font-medium text-text-secondary">{contact.phoneNo}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {contact.groups?.slice(0, 2).map((group) => (
                        <span key={group.id} className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-white border border-white/10">
                          {group.name}
                        </span>
                      ))}
                      {(contact.groups?.length || 0) > 2 && (
                        <span className="text-[11px] font-semibold text-text-secondary px-1">
                          +{(contact.groups?.length || 0) - 2}
                        </span>
                      )}
                      {!contact.groups?.length && <span className="text-text-secondary/30 text-xs">—</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-xs font-semibold text-text-secondary whitespace-nowrap">
                        {contact.createdAt ? format(new Date(contact.createdAt), 'MMM dd, yyyy') : '—'}
                      </span>
                      
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (expandedContactId === contact.id) {
                            setExpandedContactId(null);
                            setContactStats(null);
                          } else {
                            setExpandedContactId(contact.id!);
                            setStatsLoading(true);
                            try {
                              const stats = await analyticsService.getStatsForContact(contact.email);
                              setContactStats(stats);
                            } catch (err) {
                              console.error(err);
                            } finally {
                              setStatsLoading(false);
                            }
                          }
                        }}
                        className={cn(
                          "p-2 border rounded-lg transition-all active:scale-95 cursor-pointer",
                          expandedContactId === contact.id
                            ? "bg-white text-black border-white"
                            : "apple-glass text-text-secondary hover:text-white hover:border-white/20 opacity-0 group-hover:opacity-100"
                        )}
                        title="View Node Analytics"
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingContact(contact);
                          setSelectedGroupsForContact((contact.groups || []).map(g => g.id!));
                          setIsAddModalOpen(true);
                        }}
                        className="p-2 apple-glass rounded-lg text-text-secondary hover:text-white hover:border-white/20 transition-all active:scale-95 opacity-0 group-hover:opacity-100 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>

                {expandedContactId === contact.id && (
                  <tr className="bg-white/[0.02]">
                    <td colSpan={5} className="px-12 py-5 border-b border-white/10">
                      {statsLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-text-secondary" />
                          <span className="text-xs font-semibold text-text-secondary">Analyzing telemetry...</span>
                        </div>
                      ) : contactStats ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-top-1 duration-200">
                          <div className="apple-glass rounded-xl p-3.5 flex flex-col justify-between">
                            <span className="text-[11px] font-semibold text-text-secondary">Total Sent</span>
                            <span className="text-lg font-bold text-white mt-1">{contactStats.totalSent || 0}</span>
                          </div>
                          <div className="apple-glass rounded-xl p-3.5 flex flex-col justify-between">
                            <span className="text-[11px] font-semibold text-text-secondary">Total Opened</span>
                            <span className="text-lg font-bold text-emerald-400 mt-1">{contactStats.totalOpened || 0} ({contactStats.openRate || 0}%)</span>
                          </div>
                          <div className="apple-glass rounded-xl p-3.5 flex flex-col justify-between">
                            <span className="text-[11px] font-semibold text-text-secondary">Total Clicked</span>
                            <span className="text-lg font-bold text-amber-400 mt-1">{contactStats.totalClicked || 0} ({contactStats.clickThroughRate || 0}%)</span>
                          </div>
                          <div className="apple-glass rounded-xl p-3.5 flex flex-col justify-between">
                            <span className="text-[11px] font-semibold text-text-secondary">Unsubscribed</span>
                            <span className="text-lg font-bold text-rose-400 mt-1">{contactStats.totalUnsubscribed || 0}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-text-secondary italic">No tracking data found for this contact.</span>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
