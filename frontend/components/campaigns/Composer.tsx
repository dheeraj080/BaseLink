import React from 'react';
import { Send, Loader2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CustomSelect } from '@/components/ui/Select';
import { Contact, ContactGroup } from '@/types/api';

interface ComposerProps {
  toEmails: string[];
  ccEmails: string[];
  bccEmails: string[];
  subject: string;
  body: string;
  isSending: boolean;
  showScheduler: boolean;
  scheduledTime: string;
  allContacts: Contact[];
  clusters: ContactGroup[];
  setToEmails: (emails: string[]) => void;
  setCcEmails: (emails: string[]) => void;
  setBccEmails: (emails: string[]) => void;
  setSubject: (sub: string) => void;
  setBody: (body: string) => void;
  setShowScheduler: (show: boolean) => void;
  setScheduledTime: (time: string) => void;
  handleSend: () => void;
  handleSchedule: () => void;
}

export function Composer({
  toEmails, ccEmails, bccEmails, subject, body,
  isSending, showScheduler, scheduledTime,
  allContacts, clusters,
  setToEmails, setCcEmails, setBccEmails,
  setSubject, setBody, setShowScheduler, setScheduledTime,
  handleSend, handleSchedule
}: ComposerProps) {
  return (
    <div className="xl:col-span-2 space-y-8 bg-[#0a0a0c] border border-white/5 p-10 rounded-[32px] shadow-2xl">
      <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary flex items-center gap-2">
        <Send className="w-4 h-4" /> Message Command Center
      </h2>

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
            options={clusters.map(cluster => ({ value: cluster.id || '', label: cluster.name || '' }))}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      <div className="space-y-2">
        <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary/60">Subject:</span>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="State your campaign intent..."
          className="w-full h-14 bg-white/[0.02] border border-white/5 rounded-2xl px-6 text-white text-sm focus:border-white/20 outline-none transition-all"
        />
      </div>

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
  );
}
