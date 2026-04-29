'use client';

import React, { useEffect, useState } from 'react';
import { contactService, groupService } from '@/services/contact.service';
import { emailService } from '@/services/email.service';
import { Contact, EmailTemplate, EmailRequest, EmailLog, ContactGroup } from '@/types/api';
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
import { Composer } from '@/components/campaigns/Composer';
import { LayoutBlueprints } from '@/components/campaigns/LayoutBlueprints';
import { TelemetryLogSidebar } from '@/components/campaigns/TelemetryLogSidebar';
import { TelemetryLogTable } from '@/components/campaigns/TelemetryLogTable';

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
              allContacts={allContacts}
              clusters={clusters}
              setToEmails={setToEmails}
              setCcEmails={setCcEmails}
              setBccEmails={setBccEmails}
              setSubject={setSubject}
              setBody={setBody}
              setShowScheduler={setShowScheduler}
              setScheduledTime={setScheduledTime}
              handleSend={handleSend}
              handleSchedule={handleSchedule}
            />

            <div className="space-y-8">
              <LayoutBlueprints templates={templates} applyTemplate={applyTemplate} />
              <TelemetryLogSidebar logs={logs} />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <TelemetryLogTable logs={logs} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
