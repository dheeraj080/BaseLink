'use client';

import React, { useEffect, useState } from 'react';
import { contactService, groupService } from '@/services/contact.service';
import { emailService } from '@/services/email.service';
import { Contact, EmailTemplate, EmailRequest, EmailLog, ContactGroup, EmailDraft } from '@/types/api';
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
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { cn, handleError, showSuccess, getTimezoneOffset } from '@/lib/utils';
import { CustomSelect } from '@/components/ui/Select';
import { Composer } from '@/components/campaigns/Composer';
import { LayoutBlueprints } from '@/components/campaigns/LayoutBlueprints';
import { TelemetryLogSidebar } from '@/components/campaigns/TelemetryLogSidebar';
import { TelemetryLogTable } from '@/components/campaigns/TelemetryLogTable';
import { ScheduledQueueTable } from '@/components/campaigns/ScheduledQueueTable';
import { DraftsTable } from '@/components/campaigns/DraftsTable';

export default function CampaignsPage() {
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [toEmails, setToEmails] = useState<string[]>([]);
  const [ccEmails, setCcEmails] = useState<string[]>([]);
  const [bccEmails, setBccEmails] = useState<string[]>([]);

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [clusters, setContactGroups] = useState<ContactGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'compose' | 'history' | 'queue' | 'drafts'>('compose');
  const [scheduledJobs, setScheduledJobs] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<EmailDraft[]>([]);
  const [currentDraftId, setCurrentDraftId] = useState<number | null>(null);

  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [isMarketing, setIsMarketing] = useState(true);
  const [cronExpression, setCronExpression] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  const fetchData = async () => {
    try {
      const [cons, temps, history, clusts, allC, jobs] = await Promise.all([
        contactService.getContacts(true),
        emailService.listTemplates(),
        emailService.getLogs(),
        groupService.list(),
        contactService.getContacts(false),
        emailService.getScheduledJobs(),
      ]);
      setSelectedContacts(Array.isArray(cons) ? cons : []);
      setTemplates(Array.isArray(temps) ? temps : []);
      setLogs(Array.isArray(history) ? history : []);
      setContactGroups(Array.isArray(clusts) ? clusts : []);
      setAllContacts(Array.isArray(allC) ? allC : []);
      setScheduledJobs(Array.isArray(jobs) ? jobs : []);
      const draftList = await emailService.getDrafts();
      setDrafts(Array.isArray(draftList) ? draftList : []);

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
        const [cons, temps, history, clusts, allC, jobs] = await Promise.all([
          contactService.getContacts(true),
          emailService.listTemplates(),
          emailService.getLogs(),
          groupService.list(),
          contactService.getContacts(false),
          emailService.getScheduledJobs(),
        ]);
        if (isMounted) {
          setSelectedContacts(Array.isArray(cons) ? cons : []);
          setTemplates(Array.isArray(temps) ? temps : []);
          setLogs(Array.isArray(history) ? history : []);
          setContactGroups(Array.isArray(clusts) ? clusts : []);
          setAllContacts(Array.isArray(allC) ? allC : []);
          setScheduledJobs(Array.isArray(jobs) ? jobs : []);
          const draftList = await emailService.getDrafts();
          setDrafts(Array.isArray(draftList) ? draftList : []);
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
        body,
        isMarketing,
        cronExpression: cronExpression || undefined
      };
      
      if (attachments.length > 0) {
        await emailService.sendEmailWithAttachments(request, attachments);
      } else {
        await emailService.sendEmail(request);
      }
      
      showSuccess(`Campaign sent successfully.`);
      setSubject('');
      setToEmails([]);
      setCcEmails([]);
      setBccEmails([]);
      setBody('');
      setAttachments([]); // Clear attachments after send
      setCurrentDraftId(null);
      fetchData(); // Refresh history
    } catch (error) {
      handleError(error, 'Failed to send campaign');
    } finally {
      setIsSending(false);
    }
  };

  const handleSchedule = async () => {
    const scheduledDate = new Date(scheduledTime);
    if (scheduledDate < new Date()) {
      handleError(new Error('Cannot schedule emails in the past.'), 'Scheduling Error');
      return;
    }

    setIsSending(true);
    try {
      const request: EmailRequest = {
        to: toEmails,
        cc: ccEmails.length > 0 ? ccEmails : undefined,
        bcc: bccEmails.length > 0 ? bccEmails : undefined,
        subject,
        body,
        isMarketing,
        cronExpression: cronExpression || undefined
      };

      const offset = getTimezoneOffset(timezone, scheduledDate);
      const isoTime = `${scheduledTime}:00${offset}`;
      await emailService.scheduleEmail(request, isoTime, attachments);

      showSuccess(`Campaign scheduled for ${format(new Date(scheduledTime), 'MMM dd, HH:mm')}.`);
      setSubject('');
      setToEmails([]);
      setCcEmails([]);
      setBccEmails([]);
      setBody('');
      setScheduledTime('');
      setCronExpression('');
      setShowScheduler(false);
      setCurrentDraftId(null);
      fetchData(); // Refresh queue
    } catch (error) {
      handleError(error, 'Failed to schedule campaign');
    } finally {
      setIsSending(false);
    }
  };

  const handleCancelJob = async (jobName: string, groupName: string) => {
    try {
      await emailService.cancelScheduledJob(jobName, groupName);
      showSuccess('Scheduled execution terminated.');
      fetchData(); // Refresh queue
    } catch (error) {
      handleError(error, 'Termination failed.');
    }
  };

  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSubject(template.subject || '');
      setBody(template.content || '');
    }
  };

  const handleSaveDraft = async () => {
    try {
      const request: EmailRequest = {
        to: toEmails,
        cc: ccEmails.length > 0 ? ccEmails : undefined,
        bcc: bccEmails.length > 0 ? bccEmails : undefined,
        subject,
        body,
        isMarketing,
        cronExpression: cronExpression || undefined
      };

      if (currentDraftId) {
        await emailService.updateDraft(currentDraftId, request);
        showSuccess('Draft updated successfully');
      } else {
        const newDraft = await emailService.saveDraft(request);
        setCurrentDraftId(newDraft.id);
        showSuccess('Draft saved successfully');
      }
      const draftList = await emailService.getDrafts();
      setDrafts(draftList);
    } catch (error) {
      handleError(error, 'Failed to save draft');
    }
  };

  const handleEditDraft = (draft: EmailDraft) => {
    setToEmails(draft.to);
    setCcEmails(draft.cc || []);
    setBccEmails(draft.bcc || []);
    setSubject(draft.subject);
    setBody(draft.body);
    setIsMarketing(draft.isMarketing);
    setCronExpression(draft.cronExpression || '');
    setCurrentDraftId(draft.id);
    setActiveTab('compose');
  };

  const handleDeleteDraft = async (id: number) => {
    if (!confirm('Are you sure you want to delete this draft?')) return;
    try {
      await emailService.deleteDraft(id);
      showSuccess('Draft deleted');
      setDrafts(drafts.filter(d => d.id !== id));
      if (currentDraftId === id) setCurrentDraftId(null);
    } catch (error) {
      handleError(error, 'Failed to delete draft');
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-white tracking-tighter">Campaign Management</h1>
          <p className="text-text-secondary text-xs mt-2 font-medium">Create, dispatch, and evaluate your sequence campaigns.</p>
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
        <button
          onClick={() => setActiveTab('queue')}
          className={cn(
            "px-8 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300",
            activeTab === 'queue' ? "bg-white text-bg-primary shadow-2xl" : "text-text-secondary hover:text-white"
          )}
        >
          Pending Queue
        </button>
        <button
          onClick={() => setActiveTab('drafts')}
          className={cn(
            "px-8 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300",
            activeTab === 'drafts' ? "bg-white text-bg-primary shadow-2xl" : "text-text-secondary hover:text-white"
          )}
        >
          Drafts
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
            <Composer
              toEmails={toEmails}
              ccEmails={ccEmails}
              bccEmails={bccEmails}
              subject={subject}
              body={body}
              isSending={isSending}
              showScheduler={showScheduler}
              scheduledTime={scheduledTime}
              timezone={timezone}
              allContacts={allContacts}
              clusters={clusters}
              setToEmails={setToEmails}
              setCcEmails={setCcEmails}
              setBccEmails={setBccEmails}
              setSubject={setSubject}
              setBody={setBody}
              setShowScheduler={setShowScheduler}
              setScheduledTime={setScheduledTime}
              setTimezone={setTimezone}
              isMarketing={isMarketing}
              setIsMarketing={setIsMarketing}
              attachments={attachments}
              setAttachments={setAttachments}
              cronExpression={cronExpression}
              setCronExpression={setCronExpression}
              handleSend={handleSend}
              handleSchedule={handleSchedule}
              handleSaveDraft={handleSaveDraft}
            />

            <div className="space-y-8">
              <LayoutBlueprints templates={templates} applyTemplate={applyTemplate} />
              <TelemetryLogSidebar logs={logs} />
            </div>
          </motion.div>
        ) : null}

        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <TelemetryLogTable logs={logs} />
          </motion.div>
        )}

        {activeTab === 'queue' && (
          <motion.div
            key="queue"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ScheduledQueueTable jobs={scheduledJobs} onCancel={handleCancelJob} />
          </motion.div>
        )}

        {activeTab === 'drafts' && (
          <motion.div
            key="drafts"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <DraftsTable 
              drafts={drafts} 
              onEdit={handleEditDraft} 
              onDelete={handleDeleteDraft} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
