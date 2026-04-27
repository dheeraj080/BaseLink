'use client';

import React, { useEffect, useState } from 'react';
import { contactService } from '@/services/contact.service';
import { emailService } from '@/services/email.service';
import { Contact, EmailTemplate, EmailRequest, EmailLog } from '@/types/api';
import { 
  Send, 
  Users, 
  FileText, 
  Calendar, 
  History, 
  Loader2, 
  X, 
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  Plus
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function CampaignsPage() {
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [searchContact, setSearchContact] = useState('');
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');
  
  const [subject, setSubject] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [cons, allCons, temps, history] = await Promise.all([
        contactService.getContacts(true),
        contactService.getContacts(false),
        emailService.listTemplates(),
        emailService.getLogs(),
      ]);
      setSelectedContacts(cons);
      setAllContacts(allCons);
      setTemplates(temps);
      setLogs(history);
    } catch (error) {
      console.error('Failed to fetch campaign data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    async function loadData() {
      try {
        const [cons, allCons, temps, history] = await Promise.all([
          contactService.getContacts(true),
          contactService.getContacts(false),
          emailService.listTemplates(),
          emailService.getLogs(),
        ]);
        if (isMounted) {
          setSelectedContacts(cons);
          setAllContacts(allCons);
          setTemplates(temps);
          setLogs(history);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch campaign data', error);
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSend = async () => {
    if (!subject || !body || selectedContacts.length === 0) return;
    
    setIsSending(true);
    try {
      const request: EmailRequest = {
        to: selectedContacts.map(c => c.email),
        cc: cc ? cc.split(',').map(email => email.trim()).filter(Boolean) : undefined,
        bcc: bcc ? bcc.split(',').map(email => email.trim()).filter(Boolean) : undefined,
        subject,
        body
      };
      await contactService.broadcast(request);
      setSuccess(`Success! Campaign sent to ${selectedContacts.length} contacts.`);
      setSubject('');
      setCc('');
      setBcc('');
      setBody('');
      fetchData(); // Refresh history
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      console.error('Failed to send campaign', error);
    } finally {
      setIsSending(false);
    }
  };

  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSubject(template.subject || '');
      setBody(template.content || '');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <motion.div
           initial={{ opacity: 0, y: -10 }}
           animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-soft-linen tracking-tight">Campaigns</h1>
          <p className="text-silver text-sm mt-1">
            Create, manage and track your outreach campaigns.
          </p>
        </motion.div>
      </div>

      <div className="flex gap-1 p-1 bg-onyx border border-onyx-400 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('compose')}
          className={cn(
            "px-6 py-2 rounded-md text-sm font-medium transition-all duration-200",
            activeTab === 'compose' ? "bg-onyx-400 text-soft-linen shadow-sm" : "text-silver hover:text-white-smoke"
          )}
        >
          New Campaign
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            "px-6 py-2 rounded-md text-sm font-medium transition-all duration-200",
            activeTab === 'history' ? "bg-onyx-400 text-soft-linen shadow-sm" : "text-silver hover:text-white-smoke"
          )}
        >
          Activity Logs
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'compose' ? (
          <motion.div
            key="compose"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-onyx border border-onyx-400 rounded-xl p-8 shadow-sm">
                {success && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-soft-linen/10 border border-soft-linen/20 rounded-lg flex items-center gap-3 text-soft-linen mb-8">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">{success}</p>
                    <button onClick={() => setSuccess(null)} className="ml-auto p-1 hover:bg-soft-linen/10 rounded-md">
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}

                <div className="space-y-8">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-silver uppercase tracking-wider ml-1">Recipients</label>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setIsContactModalOpen(true)}
                          className="text-xs font-semibold text-soft-linen hover:text-white-smoke px-3 py-1.5 bg-onyx-400 border border-onyx-300 rounded-lg transition-all flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" /> Manage
                        </button>
                        <span className="text-xs font-semibold text-soft-linen bg-soft-linen/10 px-2.5 py-1 rounded-full border border-soft-linen/20">
                          {selectedContacts.length} contacts selected
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-onyx border border-onyx-400 rounded-lg min-h-[60px] flex flex-wrap gap-2 text-sm">
                      {selectedContacts.length === 0 ? (
                        <div className="flex items-center gap-2 py-1">
                           <AlertCircle className="w-4 h-4 text-silver" />
                           <p className="text-silver italic">No contacts selected. Please select contacts from the directory.</p>
                        </div>
                      ) : (
                        selectedContacts.slice(0, 5).map(c => (
                          <span key={c.id} className="text-xs font-medium px-2 py-1 bg-onyx-400 border border-onyx-300 rounded-md text-white-smoke">
                            {c.email}
                          </span>
                        ))
                      )}
                      {selectedContacts.length > 5 && (
                        <span className="text-xs font-semibold px-2 py-1 text-silver bg-onyx-400/50 border border-onyx-300 rounded-md">+{selectedContacts.length - 5} more</span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button 
                      type="button" 
                      onClick={() => setShowCcBcc(!showCcBcc)} 
                      className="text-xs font-semibold text-silver hover:text-soft-linen transition-all"
                    >
                      {showCcBcc ? '- Hide CC/BCC' : '+ Add CC/BCC'}
                    </button>
                  </div>

                  {showCcBcc && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="CC Recipients"
                        placeholder="Separate emails with commas..."
                        value={cc}
                        onChange={(e) => setCc(e.target.value)}
                        className="bg-onyx border-onyx-400"
                      />
                      <Input
                        label="BCC Recipients"
                        placeholder="Separate emails with commas..."
                        value={bcc}
                        onChange={(e) => setBcc(e.target.value)}
                        className="bg-onyx border-onyx-400"
                      />
                    </div>
                  )}

                  <Input
                    label="Subject line"
                    placeholder="Briefly describe the purpose of this email..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="bg-onyx border-onyx-400"
                  />

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-silver uppercase tracking-wider ml-1">Message Body</label>
                    <textarea
                      placeholder="Write your professional message here..."
                      rows={12}
                      className="w-full bg-onyx border border-onyx-400 rounded-lg py-4 px-4 focus:ring-1 focus:ring-silver/30 focus:border-silver transition-all outline-none resize-none text-soft-linen text-sm leading-relaxed placeholder:text-onyx-700"
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-onyx-400 mt-8">
                  <button className="text-xs font-semibold text-silver hover:text-soft-linen flex items-center gap-2 transition-colors uppercase tracking-widest px-4 py-2 hover:bg-onyx-400 rounded-lg border border-transparent hover:border-onyx-300">
                    <Calendar className="w-4 h-4" />
                    Schedule for later
                  </button>
                  <Button
                    id="send-campaign"
                    disabled={isSending || selectedContacts.length === 0 || !subject || !body}
                    onClick={handleSend}
                    className="min-w-[200px]"
                    leftIcon={isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  >
                    Send Campaign
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-onyx border border-onyx-400 rounded-xl p-6 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-widest text-silver mb-6 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Email Templates
                </h3>
                <div className="space-y-3">
                  {templates.length === 0 ? (
                    <div className="p-6 border border-dashed border-onyx-400 rounded-xl text-center">
                       <p className="text-xs text-silver/50 italic">No saved templates found.</p>
                    </div>
                  ) : (
                    templates.map(t => (
                      <button
                        key={t.id}
                        onClick={() => applyTemplate(t.id!)}
                        className="w-full p-4 rounded-xl border border-onyx-400 bg-onyx hover:border-soft-linen/50 hover:bg-soft-linen/5 transition-all text-left flex items-center justify-between group"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-soft-linen group-hover:text-soft-linen transition-colors truncate">{t.name}</p>
                          <p className="text-xs text-silver truncate mt-0.5">{t.subject}</p>
                        </div>
                        <Plus className="w-4 h-4 text-onyx-700 group-hover:text-soft-linen shrink-0 transition-colors" />
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-onyx border border-onyx-400 rounded-xl p-6 shadow-sm relative overflow-hidden group">
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-silver mb-6">Campaign Status</h3>
                <div className="space-y-6 relative z-10">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-silver">Total Monthly Limit</span>
                      <span className="text-xs font-bold text-soft-linen">25% used</span>
                    </div>
                    <div className="h-2 bg-onyx rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: '25%' }} transition={{ duration: 1 }} className="h-full bg-soft-linen shadow-sm" />
                    </div>
                  </div>
                  <div className="p-4 bg-onyx-100/50 rounded-lg border border-onyx-400">
                    <p className="text-[11px] text-silver leading-relaxed italic">
                      Systems are operational. Email batches are being processed through professional delivery nodes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="bg-onyx border border-onyx-400 rounded-xl overflow-hidden shadow-sm"
          >
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-onyx-100/50 border-b border-onyx-400">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-silver">Recipient</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-silver">Subject</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-silver">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-silver text-right">Sent Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-onyx-400">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-silver/50 bg-onyx-100/50">
                      <History className="w-10 h-10 mx-auto mb-4 opacity-10" />
                      <p className="text-sm">No activity recorded yet.</p>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-onyx-100/30 transition-colors group cursor-default">
                      <td className="px-6 py-5">
                        <span className="text-sm font-medium text-soft-linen">{log.recipient}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs text-silver italic truncate max-w-[200px] inline-block">{log.subject}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                          log.status === 'SENT' ? "bg-soft-linen/10 text-soft-linen border-soft-linen/20" :
                          log.status === 'FAILED' ? "bg-onyx text-silver border-onyx-400" :
                          "bg-onyx-400/50 text-silver border-onyx-300"
                        )}>
                          <div className={cn(
                            "w-1 h-1 rounded-full",
                            log.status === 'SENT' ? "bg-soft-linen" :
                            log.status === 'FAILED' ? "bg-silver/50" :
                            "bg-silver/40"
                          )} />
                          {log.status}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                         <span className="text-xs text-silver font-medium">
                           {log.sentAt ? format(new Date(log.sentAt), 'MMM dd, HH:mm') : '—'}
                         </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Contact Selection Modal */}
      <AnimatePresence>
        {isContactModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-onyx/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0" 
              onClick={() => setIsContactModalOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.98, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 10 }}
              className="bg-onyx border border-onyx-400 rounded-xl w-full max-w-lg shadow-2xl p-8 relative z-10 flex flex-col max-h-[80vh]"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-soft-linen">Select Recipients</h3>
                  <p className="text-sm text-silver mt-1">Choose contacts to include in this campaign.</p>
                </div>
                <button onClick={() => setIsContactModalOpen(false)} className="p-2 bg-onyx hover:bg-onyx-100 rounded-lg transition-all text-silver">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <Input 
                  placeholder="Search contacts by name or email..." 
                  value={searchContact}
                  onChange={(e) => setSearchContact(e.target.value)}
                  className="bg-onyx border-onyx-400"
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {allContacts
                  .filter(c => 
                    c.name?.toLowerCase().includes(searchContact.toLowerCase()) || 
                    c.email?.toLowerCase().includes(searchContact.toLowerCase())
                  )
                  .map(contact => {
                    const isSelected = selectedContacts.some(c => c.id === contact.id);
                    return (
                      <div 
                        key={contact.id} 
                        onClick={async () => {
                          try {
                            await contactService.toggleSelection(contact.id!, !isSelected);
                            if (isSelected) {
                              setSelectedContacts(selectedContacts.filter(c => c.id !== contact.id));
                            } else {
                              setSelectedContacts([...selectedContacts, contact]);
                            }
                          } catch (err) {
                            console.error('Failed to toggle recipient', err);
                          }
                        }}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                          isSelected 
                            ? "bg-soft-linen/5 border-soft-linen/30 text-soft-linen" 
                            : "bg-onyx-100/50 border-onyx-400 text-silver hover:bg-onyx-100/80"
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate">{contact.name || 'Unnamed'}</p>
                          <p className="text-xs text-silver truncate mt-0.5">{contact.email}</p>
                        </div>
                        <div className={cn(
                          "w-5 h-5 rounded border flex items-center justify-center transition-all",
                          isSelected 
                            ? "border-soft-linen bg-soft-linen/10" 
                            : "border-onyx-300"
                        )}>
                          {isSelected && <div className="w-2.5 h-2.5 bg-soft-linen rounded-sm" />}
                        </div>
                      </div>
                    );
                  })}
                {allContacts.length === 0 && (
                  <p className="text-center text-sm text-silver italic py-8">No contacts found. Go to Directory to add some.</p>
                )}
              </div>

              <div className="flex items-center justify-end pt-6 border-t border-onyx-400 mt-6">
                <Button variant="secondary" onClick={() => setIsContactModalOpen(false)}>
                  Done
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
