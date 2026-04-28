'use client';

import React, { useEffect, useState } from 'react';
import { contactService, groupService } from '@/services/contact.service';
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
import { cn, handleError, showSuccess } from '@/lib/utils';
import { CustomSelect } from '@/components/ui/Select';

export default function CampaignsPage() {
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [toEmails, setToEmails] = useState<string[]>([]);
  const [ccEmails, setCcEmails] = useState<string[]>([]);
  const [bccEmails, setBccEmails] = useState<string[]>([]);

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [clusters, setClusters] = useState<ContactGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');

  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');

  const fetchData = async () => {
    try {
      const [cons, temps, history, clusts, allC] = await Promise.all([
        contactService.getContacts(true),
        emailService.listTemplates(),
        emailService.getLogs(),
        groupService.list(),
        contactService.getContacts(false),
      ]);
      setSelectedContacts(Array.isArray(cons) ? cons : []);
      setTemplates(Array.isArray(temps) ? temps : []);
      setLogs(Array.isArray(history) ? history : []);
      setClusters(Array.isArray(clusts) ? clusts : []);
      setAllContacts(Array.isArray(allC) ? allC : []);

    } catch (error) {
      handleError(error, 'Failed to fetch campaign data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [cons, temps, history, clusts, allC] = await Promise.all([
          contactService.getContacts(true),
          emailService.listTemplates(),
          emailService.getLogs(),
          groupService.list(),
          contactService.getContacts(false),
        ]);
        if (isMounted) {
          setSelectedContacts(Array.isArray(cons) ? cons : []);
          setTemplates(Array.isArray(temps) ? temps : []);
          setLogs(Array.isArray(history) ? history : []);
          setClusters(Array.isArray(clusts) ? clusts : []);
          setAllContacts(Array.isArray(allC) ? allC : []);
          setLoading(false);
        }
      } catch (error) {
        handleError(error, 'Failed to fetch campaign data');
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSend = async () => {
    if (!subject || !body || toEmails.length === 0) return;

    setIsSending(true);
    try {
      const request: EmailRequest = {
        to: toEmails,
        cc: ccEmails.length > 0 ? ccEmails : undefined,
        bcc: bccEmails.length > 0 ? bccEmails : undefined,
        subject,
        body
      };
      await contactService.broadcast(request);
      showSuccess(`Campaign sent successfully.`);
      setSubject('');
      setToEmails([]);
      setCcEmails([]);
      setBccEmails([]);
      setBody('');
      fetchData(); // Refresh history
    } catch (error) {
      handleError(error, 'Failed to send campaign');
    } finally {
      setIsSending(false);
    }
  };

  const handleSchedule = async () => {
    if (!subject || !body || toEmails.length === 0 || !scheduledTime) return;

    setIsSending(true);
    try {
      const request: EmailRequest = {
        to: toEmails,
        cc: ccEmails.length > 0 ? ccEmails : undefined,
        bcc: bccEmails.length > 0 ? bccEmails : undefined,
        subject,
        body
      };

      const isoTime = new Date(scheduledTime).toISOString();
      await emailService.scheduleEmail(request, isoTime);

      showSuccess(`Campaign scheduled for ${format(new Date(scheduledTime), 'MMM dd, HH:mm')}.`);
      setSubject('');
      setToEmails([]);
      setCcEmails([]);
      setBccEmails([]);
      setBody('');
      setScheduledTime('');
      setShowScheduler(false);
      fetchData();
    } catch (error) {
      handleError(error, 'Failed to schedule campaign');
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
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-white tracking-tighter">Campaign Protocol</h1>
          <p className="text-text-secondary text-sm mt-2 font-medium">Initialize and monitor your outreach sequences.</p>
        </motion.div>
      </div>



      <div className="flex gap-1.5 p-1.5 bg-surface-primary border border-border-color rounded-full w-fit">
        <button
          onClick={() => setActiveTab('compose')}
          className={cn(
            "px-8 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300",
            activeTab === 'compose' ? "bg-white text-bg-primary shadow-2xl" : "text-text-secondary hover:text-white"
          )}
        >
          Initialize Sequence
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            "px-8 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300",
            activeTab === 'history' ? "bg-white text-bg-primary shadow-2xl" : "text-text-secondary hover:text-white"
          )}
        >
          Telemetry Logs
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
            className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start"
          >
            {/* Left Panel: Composer */}
            <div className="xl:col-span-2 space-y-8 bg-[#0a0a0c] border border-white/5 p-10 rounded-[32px] shadow-2xl">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary flex items-center gap-2">
                <Send className="w-4 h-4" /> Message Command Center
              </h2>

              {/* To Recipients */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary/60">To:</span>
                  <span className="text-[10px] font-bold text-white bg-white/5 px-2 py-1 rounded-full">{toEmails.length} Target(s)</span>
                </div>
                <div className="flex flex-wrap gap-2 p-4 bg-white/[0.02] border border-white/5 rounded-2xl min-h-[52px]">
                  {toEmails.map(email => (
                    <span key={email} className="flex items-center gap-1 bg-white/10 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {email}
                      <button onClick={() => setToEmails(toEmails.filter(e => e !== email))} className="text-white/40 hover:text-red-400 font-bold text-xs ml-1">×</button>
                    </span>
                  ))}
                  {toEmails.length === 0 && <p className="text-text-secondary/40 text-xs italic">Select target indices below...</p>}
                </div>
               <div className="grid grid-cols-2 gap-4">
              <CustomSelect
                options={allContacts.map(c => ({ value: c.email, label: c.name || c.email }))}
                value=""
                placeholder="+ Add Individual..."
                onChange={(val) => {
                  if (val && !toEmails.includes(val)) setToEmails([...toEmails, val]);
                }}
              />

              <CustomSelect
                options={clusters.map(cluster => ({ value: cluster.id || '', label: cluster.name }))}
                value=""
                placeholder="+ Add Cluster..."
                onChange={(clusterId) => {
                  if (!clusterId) return;
                  const clusterCons = allContacts.filter(c => c.groups?.some(g => g.id === clusterId));
                  const newEmails = [...toEmails];
                  clusterCons.forEach(c => {
                    if (!newEmails.includes(c.email)) newEmails.push(c.email);
                  });
                  setToEmails(newEmails);
                }}
              />
            </div>
          </div>

              {/* CC / BCC Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CC */}
                <div className="space-y-3">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary/60">CC:</span>
                  <div className="flex flex-wrap gap-1 p-3 bg-white/[0.01] border border-white/5 rounded-2xl min-h-[44px]">
                    {ccEmails.map(email => (
                      <span key={email} className="flex items-center gap-1 bg-white/5 text-white/80 text-[10px] font-medium px-2 py-0.5 rounded-full">
                        {email}
                        <button onClick={() => setCcEmails(ccEmails.filter(e => e !== email))} className="text-white/20 hover:text-red-400 ml-1">×</button>
                      </span>
                    ))}
                  </div>
              <CustomSelect
                options={allContacts.map(c => ({ value: c.email, label: c.name || c.email }))}
                value=""
                placeholder="+ CC Contact..."
                onChange={(val) => {
                  if (val && !ccEmails.includes(val)) setCcEmails([...ccEmails, val]);
                }}
              />
                </div>

                {/* BCC */}
                <div className="space-y-3">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary/60">BCC:</span>
                  <div className="flex flex-wrap gap-1 p-3 bg-white/[0.01] border border-white/5 rounded-2xl min-h-[44px]">
                    {bccEmails.map(email => (
                      <span key={email} className="flex items-center gap-1 bg-white/5 text-white/80 text-[10px] font-medium px-2 py-0.5 rounded-full">
                        {email}
                        <button onClick={() => setBccEmails(bccEmails.filter(e => e !== email))} className="text-white/20 hover:text-red-400 ml-1">×</button>
                      </span>
                    ))}
                  </div>
              <CustomSelect
                options={allContacts.map(c => ({ value: c.email, label: c.name || c.email }))}
                value=""
                placeholder="+ BCC Contact..."
                onChange={(val) => {
                  if (val && !bccEmails.includes(val)) setBccEmails([...bccEmails, val]);
                }}
              />
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary/60">Subject:</span>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="State your campaign intent..."
                  className="w-full h-14 bg-white/[0.02] border border-white/5 rounded-2xl px-6 text-white text-sm focus:border-white/20 outline-none transition-all"
                />
              </div>

              {/* Body */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary/60">Payload Template:</span>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Compose sequential protocol logic..."
                  rows={10}
                  className="w-full bg-white/[0.02] border border-white/5 rounded-[24px] p-6 text-white text-sm focus:border-white/20 outline-none transition-all resize-none font-mono"
                />
              </div>

              {/* Dispatch Action */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-white/5">
                <Button
                  id="send-campaign"
                  disabled={isSending || toEmails.length === 0 || !subject || !body}
                  onClick={handleSend}
                  className="h-12 px-10 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-lg"
                  leftIcon={isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                >
                  Deploy Sequence
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowScheduler(!showScheduler)}
                  className="text-[10px] font-bold uppercase tracking-widest rounded-full"
                  leftIcon={<Calendar className="w-4 h-4" />}
                >
                  {showScheduler ? "Hide Queue" : "Delay Execution"}
                </Button>

                {showScheduler && (
                  <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/5">
                    <input
                      type="datetime-local"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="bg-transparent border-none text-white text-xs outline-none px-2 uppercase tracking-widest"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      className="rounded-xl h-9 text-[9px] font-bold tracking-widest uppercase px-4"
                      disabled={isSending || !scheduledTime || toEmails.length === 0 || !subject || !body}
                      onClick={handleSchedule}
                    >
                      Queue
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel: Blueprints & Telemetry */}
            <div className="space-y-8">
              {/* Blueprints */}
              <div className="bg-[#0a0a0c] border border-white/5 p-8 rounded-[32px] shadow-2xl">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary mb-6 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Layout Blueprints
                </h3>
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2">
                  {templates.length === 0 ? (
                    <p className="text-center text-text-secondary/20 italic text-xs py-4">No frameworks.</p>
                  ) : (
                    templates.map(t => (
                      <button
                        key={t.id}
                        onClick={() => applyTemplate(t.id!)}
                        className="w-full p-4 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 rounded-xl text-left flex items-center justify-between group transition-colors"
                      >
                        <span className="text-xs font-bold text-white/80 group-hover:text-white truncate">{t.name}</span>
                        <Plus className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Telemetry Logs */}
              <div className="bg-[#0a0a0c] border border-white/5 p-8 rounded-[32px] shadow-2xl">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary mb-6 flex items-center gap-2">
                  <History className="w-4 h-4" /> Logs
                </h3>
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2">
                  {logs.length === 0 ? (
                    <p className="text-center text-text-secondary/20 italic text-xs py-4">No records found.</p>
                  ) : (
                    logs.map(log => (
                      <div key={log.id} className="p-4 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col gap-1.5 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white truncate max-w-[150px]">{log.recipient}</span>
                          <span className={cn(
                            "text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                            log.status === 'SENT' ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                          )}>{log.status}</span>
                        </div>
                        <p className="text-[10px] text-text-secondary/60 truncate italic">{log.subject}</p>
                        <span className="text-[8px] text-text-secondary/30 text-right mt-1 font-mono">{log.sentAt ? format(new Date(log.sentAt), 'HH:mm:ss') : ''}</span>
                      </div>
                    ))
                  )}
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
            className="bg-surface-primary border border-border-color rounded-[32px] overflow-hidden shadow-2xl shadow-black/20"
          >
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-primary/30 border-b border-border-color">
                  <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary">Node Target</th>
                  <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary">Protocol Header</th>
                  <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary">Operational State</th>
                  <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary text-right">Sequence Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-10 py-24 text-center text-text-secondary/20 bg-bg-primary/50">
                      <History className="w-12 h-12 mx-auto mb-6 opacity-5" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em]">No telemetry recorded</p>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group cursor-default">
                      <td className="px-10 py-6">
                        <span className="text-sm font-bold text-white tracking-tight">{log.recipient}</span>
                      </td>
                      <td className="px-10 py-6">
                        <span className="text-[11px] font-bold text-text-secondary/60 uppercase tracking-widest truncate max-w-[200px] inline-block">{log.subject}</span>
                      </td>
                      <td className="px-10 py-6">
                        <div className={cn(
                          "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border shadow-xl",
                          log.status === 'SENT' ? "bg-white/5 text-white border-white/10" :
                            log.status === 'FAILED' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                              "bg-surface-primary text-text-secondary border-border-color"
                        )}>
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]",
                            log.status === 'SENT' ? "bg-white" :
                              log.status === 'FAILED' ? "bg-red-500" :
                                "bg-text-secondary/40"
                          )} />
                          {log.status === 'SENT' ? 'SENT' : log.status}
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <span className="text-[10px] font-bold text-text-secondary/40 uppercase tracking-widest">
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
    </div>
  );
}
