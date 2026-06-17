import React, { useState, useMemo, useCallback, useEffect, useTransition, memo } from 'react';
import { Send, Loader2, Calendar, Clock, Globe, X, Trash2, ChevronDown, ChevronUp, Paperclip, Plus, Search, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CustomSelect } from '@/components/ui/Select';
import { Contact, ContactGroup } from '@/types/api';

// --- Types ---
export interface ComposerProps {
  toEmails: string[];
  ccEmails: string[];
  bccEmails: string[];
  subject: string;
  body: string;
  isSending: boolean;
  showScheduler: boolean;
  scheduledTime: string;
  timezone: string;
  allContacts: Contact[];
  clusters: ContactGroup[];
  setToEmails: (emails: string[]) => void;
  setCcEmails: (emails: string[]) => void;
  setBccEmails: (emails: string[]) => void;
  setSubject: (sub: string) => void;
  setBody: (body: string) => void;
  setShowScheduler: (show: boolean) => void;
  setScheduledTime: (time: string) => void;
  setTimezone: (tz: string) => void;
  isMarketing: boolean;
  setIsMarketing: (val: boolean) => void;
  attachments: File[];
  setAttachments: (files: File[]) => void;
  cronExpression: string;
  setCronExpression: (cron: string) => void;
  handleSend: () => void;
  handleSchedule: () => void;
  handleSaveDraft: () => void;
  onDraftSave?: (draft: Partial<ComposerProps>) => void;
  draftId?: string;
}

interface RecipientSectionProps {
  label: string;
  emails: string[];
  setEmails: (emails: string[]) => void;
  contacts: Contact[];
  clusters?: ContactGroup[];
  placeholder: string;
  onError?: (error: string) => void;
}

interface AttachmentItemProps {
  file: File;
  onRemove: () => void;
}

interface AttachmentListProps {
  attachments: File[];
  onRemove: (index: number) => void;
}

interface SchedulerProps {
  time: string;
  setTime: (t: string) => void;
  timezone: string;
  setTimezone: (tz: string) => void;
  onQueue: () => void;
  disabled: boolean;
  cronExpression: string;
  setCronExpression: (cron: string) => void;
}

// --- Complete IANA Timezones Database ---
const TIMEZONES = [
  { value: 'UTC', label: 'Universal Coordinated Time - UTC', offset: 'UTC+0' },
  // North America
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada) - PT', offset: 'UTC-8' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada) - MT', offset: 'UTC-7' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada) - CT', offset: 'UTC-6' },
  { value: 'America/New_York', label: 'Eastern Time (US & Canada) - ET', offset: 'UTC-5' },
  { value: 'America/Anchorage', label: 'Alaska (US) - AKST', offset: 'UTC-9' },
  { value: 'America/Adak', label: 'Hawaii-Aleutian (US) - HAST', offset: 'UTC-10' },
  { value: 'Pacific/Honolulu', label: 'Hawaii (US) - HST', offset: 'UTC-10' },
  { value: 'America/Phoenix', label: 'Arizona (MST no DST)', offset: 'UTC-7' },
  { value: 'America/Toronto', label: 'Eastern Time (Canada) - ET', offset: 'UTC-5' },
  { value: 'America/Vancouver', label: 'Pacific Time (Canada) - PT', offset: 'UTC-8' },
  { value: 'America/Winnipeg', label: 'Central Time (Canada) - CT', offset: 'UTC-6' },
  { value: 'America/Halifax', label: 'Atlantic Time (Canada) - AT', offset: 'UTC-4' },
  { value: 'America/St_Johns', label: 'Newfoundland (Canada)', offset: 'UTC-3:30' },
  { value: 'America/Mexico_City', label: 'Central Time (Mexico)', offset: 'UTC-6' },
  { value: 'America/Tijuana', label: 'Pacific Time (Mexico)', offset: 'UTC-8' },

  // South America
  { value: 'America/Sao_Paulo', label: 'Brasilia Time (Brazil) - BRT', offset: 'UTC-3' },
  { value: 'America/Buenos_Aires', label: 'Argentina Time - ART', offset: 'UTC-3' },
  { value: 'America/Santiago', label: 'Chile Time - CLT', offset: 'UTC-4' },
  { value: 'America/Bogota', label: 'Colombia Time - COT', offset: 'UTC-5' },
  { value: 'America/Caracas', label: 'Venezuela Time - VET', offset: 'UTC-4' },
  { value: 'America/Lima', label: 'Peru Time - PET', offset: 'UTC-5' },

  // Europe
  { value: 'Europe/London', label: 'United Kingdom - GMT/BST', offset: 'UTC+0' },
  { value: 'Europe/Dublin', label: 'Ireland - GMT/IST', offset: 'UTC+0' },
  { value: 'Europe/Lisbon', label: 'Portugal - WET/WEST', offset: 'UTC+0' },
  { value: 'Europe/Madrid', label: 'Spain - CET/CEST', offset: 'UTC+1' },
  { value: 'Europe/Paris', label: 'France - CET/CEST', offset: 'UTC+1' },
  { value: 'Europe/Berlin', label: 'Germany - CET/CEST', offset: 'UTC+1' },
  { value: 'Europe/Rome', label: 'Italy - CET/CEST', offset: 'UTC+1' },
  { value: 'Europe/Amsterdam', label: 'Netherlands - CET/CEST', offset: 'UTC+1' },
  { value: 'Europe/Stockholm', label: 'Sweden - CET/CEST', offset: 'UTC+1' },
  { value: 'Europe/Oslo', label: 'Norway - CET/CEST', offset: 'UTC+1' },
  { value: 'Europe/Copenhagen', label: 'Denmark - CET/CEST', offset: 'UTC+1' },
  { value: 'Europe/Warsaw', label: 'Poland - CET/CEST', offset: 'UTC+1' },
  { value: 'Europe/Prague', label: 'Czech Republic - CET/CEST', offset: 'UTC+1' },
  { value: 'Europe/Budapest', label: 'Hungary - CET/CEST', offset: 'UTC+1' },
  { value: 'Europe/Vienna', label: 'Austria - CET/CEST', offset: 'UTC+1' },
  { value: 'Europe/Zurich', label: 'Switzerland - CET/CEST', offset: 'UTC+1' },
  { value: 'Europe/Brussels', label: 'Belgium - CET/CEST', offset: 'UTC+1' },
  { value: 'Europe/Helsinki', label: 'Finland - EET/EEST', offset: 'UTC+2' },
  { value: 'Europe/Tallinn', label: 'Estonia - EET/EEST', offset: 'UTC+2' },
  { value: 'Europe/Riga', label: 'Latvia - EET/EEST', offset: 'UTC+2' },
  { value: 'Europe/Vilnius', label: 'Lithuania - EET/EEST', offset: 'UTC+2' },
  { value: 'Europe/Athens', label: 'Greece - EET/EEST', offset: 'UTC+2' },
  { value: 'Europe/Istanbul', label: 'Turkey - TRT', offset: 'UTC+3' },
  { value: 'Europe/Moscow', label: 'Russia - MSK', offset: 'UTC+3' },

  // Africa
  { value: 'Africa/Casablanca', label: 'Morocco - GMT/WEST', offset: 'UTC+0' },
  { value: 'Africa/Cairo', label: 'Egypt - EET', offset: 'UTC+2' },
  { value: 'Africa/Johannesburg', label: 'South Africa - SAST', offset: 'UTC+2' },
  { value: 'Africa/Lagos', label: 'West Africa Time - WAT', offset: 'UTC+1' },
  { value: 'Africa/Nairobi', label: 'East Africa Time - EAT', offset: 'UTC+3' },

  // Asia
  { value: 'Asia/Dubai', label: 'United Arab Emirates - GST', offset: 'UTC+4' },
  { value: 'Asia/Riyadh', label: 'Saudi Arabia - AST', offset: 'UTC+3' },
  { value: 'Asia/Doha', label: 'Qatar - AST', offset: 'UTC+3' },
  { value: 'Asia/Kuwait', label: 'Kuwait - AST', offset: 'UTC+3' },
  { value: 'Asia/Bahrain', label: 'Bahrain - AST', offset: 'UTC+3' },
  { value: 'Asia/Tehran', label: 'Iran - IRST', offset: 'UTC+3:30' },
  { value: 'Asia/Kabul', label: 'Afghanistan - AFT', offset: 'UTC+4:30' },
  { value: 'Asia/Karachi', label: 'Pakistan - PKT', offset: 'UTC+5' },
  { value: 'Asia/Colombo', label: 'Sri Lanka - SLST', offset: 'UTC+5:30' },
  { value: 'Asia/Kolkata', label: 'India - IST', offset: 'UTC+5:30' },
  { value: 'Asia/Kathmandu', label: 'Nepal - NPT', offset: 'UTC+5:45' },
  { value: 'Asia/Dhaka', label: 'Bangladesh - BST', offset: 'UTC+6' },
  { value: 'Asia/Yangon', label: 'Myanmar - MMT', offset: 'UTC+6:30' },
  { value: 'Asia/Bangkok', label: 'Thailand - ICT', offset: 'UTC+7' },
  { value: 'Asia/Jakarta', label: 'Indonesia (West) - WIB', offset: 'UTC+7' },
  { value: 'Asia/Makassar', label: 'Indonesia (Central) - WITA', offset: 'UTC+8' },
  { value: 'Asia/Jayapura', label: 'Indonesia (East) - WIT', offset: 'UTC+9' },
  { value: 'Asia/Singapore', label: 'Singapore - SGT', offset: 'UTC+8' },
  { value: 'Asia/Kuala_Lumpur', label: 'Malaysia - MYT', offset: 'UTC+8' },
  { value: 'Asia/Manila', label: 'Philippines - PHT', offset: 'UTC+8' },
  { value: 'Asia/Taipei', label: 'Taiwan - CST', offset: 'UTC+8' },
  { value: 'Asia/Shanghai', label: 'China - CST', offset: 'UTC+8' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong - HKT', offset: 'UTC+8' },
  { value: 'Asia/Macau', label: 'Macau - MST', offset: 'UTC+8' },
  { value: 'Asia/Tokyo', label: 'Japan - JST', offset: 'UTC+9' },
  { value: 'Asia/Seoul', label: 'South Korea - KST', offset: 'UTC+9' },
  { value: 'Asia/Pyongyang', label: 'North Korea - KST', offset: 'UTC+9' },

  // Australia & Pacific
  { value: 'Australia/Perth', label: 'Western Australia - AWST', offset: 'UTC+8' },
  { value: 'Australia/Eucla', label: 'Central Western Australia - ACWST', offset: 'UTC+8:45' },
  { value: 'Australia/Darwin', label: 'Northern Territory - ACST', offset: 'UTC+9:30' },
  { value: 'Australia/Adelaide', label: 'South Australia - ACST', offset: 'UTC+9:30' },
  { value: 'Australia/Brisbane', label: 'Queensland - AEST', offset: 'UTC+10' },
  { value: 'Australia/Sydney', label: 'New South Wales - AEDT', offset: 'UTC+11' },
  { value: 'Australia/Melbourne', label: 'Victoria - AEDT', offset: 'UTC+11' },
  { value: 'Australia/Hobart', label: 'Tasmania - AEDT', offset: 'UTC+11' },
  { value: 'Australia/Lord_Howe', label: 'Lord Howe Island', offset: 'UTC+10:30' },
  { value: 'Pacific/Guam', label: 'Guam - CHST', offset: 'UTC+10' },
  { value: 'Pacific/Saipan', label: 'Northern Mariana Islands - CHST', offset: 'UTC+10' },
  { value: 'Pacific/Port_Moresby', label: 'Papua New Guinea - PGT', offset: 'UTC+10' },
  { value: 'Pacific/Fiji', label: 'Fiji - FJT', offset: 'UTC+12' },
  { value: 'Pacific/Auckland', label: 'New Zealand - NZST', offset: 'UTC+12' },
  { value: 'Pacific/Chatham', label: 'Chatham Islands - CHAST', offset: 'UTC+12:45' },
  { value: 'Pacific/Tongatapu', label: 'Tonga - TOT', offset: 'UTC+13' },
  { value: 'Pacific/Apia', label: 'Samoa - WST', offset: 'UTC+13' },
  { value: 'Pacific/Kiritimati', label: 'Kiribati (Line Islands) - LINT', offset: 'UTC+14' },
];

// Helper function to get current offset for a timezone
const getCurrentTimezoneOffset = (ianaTimezone: string): string => {
  try {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: ianaTimezone,
      timeZoneName: 'shortOffset'
    });
    const parts = formatter.formatToParts(date);
    const offsetPart = parts.find(part => part.type === 'timeZoneName');
    if (offsetPart) {
      const match = offsetPart.value.match(/GMT([+-]\d{1,2}(?::\d{2})?)/);
      if (match) {
        let offset = match[1];
        if (offset.includes(':')) {
          const [hours, minutes] = offset.split(':');
          return `${hours.padStart(3, '+')}:${minutes}`;
        } else {
          return `${offset.padStart(3, '+')}:00`;
        }
      }
    }
    return 'UTC';
  } catch {
    return 'UTC';
  }
};

// --- Utils ---
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
  return emailRegex.test(email);
};

const validateComposerState = (props: ComposerProps): string | null => {
  if (props.toEmails.length === 0) return 'At least one recipient is required';
  if (!props.subject?.trim()) return 'Subject line is required';
  if (!props.body?.trim()) return 'Email body is required';
  if (props.isSending) return 'Already sending, please wait';

  const allEmails = [...props.toEmails, ...props.ccEmails, ...props.bccEmails];
  const invalidEmails = allEmails.filter(email => !isValidEmail(email));
  if (invalidEmails.length > 0) {
    return `Invalid email address(es): ${invalidEmails.join(', ')}`;
  }

  return null;
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// --- Custom Hooks ---
const useDraft = (draftId: string | undefined, initialState: Partial<ComposerProps>) => {
  const [draft, setDraft] = useState(() => {
    if (!draftId) return initialState;
    try {
      const saved = localStorage.getItem(`draft_${draftId}`);
      return saved ? { ...initialState, ...JSON.parse(saved) } : initialState;
    } catch {
      return initialState;
    }
  });

  const saveDraft = useCallback((newState: Partial<ComposerProps>) => {
    if (!draftId) return;
    const updated = { ...draft, ...newState };
    setDraft(updated);
    try {
      localStorage.setItem(`draft_${draftId}`, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  }, [draft, draftId]);

  const clearDraft = useCallback(() => {
    if (!draftId) return;
    localStorage.removeItem(`draft_${draftId}`);
    setDraft(initialState);
  }, [draftId, initialState]);

  return { draft, saveDraft, clearDraft };
};

const useKeyboardShortcuts = (handlers: {
  onSend?: () => void;
  onSchedule?: () => void;
  onClear?: () => void;
  enabled?: boolean;
}) => {
  useEffect(() => {
    if (handlers.enabled === false) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handlers.onSend?.();
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        handlers.onSchedule?.();
      }
      if (e.key === 'Escape' && !document.querySelector('[role="dialog"]')) {
        handlers.onClear?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
};

// --- Subcomponents ---
const AttachmentItem: React.FC<AttachmentItemProps> = memo(({ file, onRemove }) => {
  const fileSize = useMemo(() => formatFileSize(file.size), [file.size]);

  return (
    <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-full px-3 py-1 text-[10px] text-white/80 group hover:bg-white/10 transition-colors">
      <span className="truncate max-w-[150px]">{file.name}</span>
      <span className="text-text-secondary/40">({fileSize})</span>
      <button
        onClick={onRemove}
        className="text-white/20 hover:text-red-400 transition-colors"
        aria-label={`Remove ${file.name}`}
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
});

AttachmentItem.displayName = 'AttachmentItem';

const AttachmentList: React.FC<AttachmentListProps> = memo(({ attachments, onRemove }) => {
  if (attachments.length === 0) {
    return <p className="text-text-secondary/20 text-[10px] italic">No binary payloads attached.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {attachments.map((file, idx) => (
        <AttachmentItem
          key={`${file.name}-${file.lastModified}-${idx}`}
          file={file}
          onRemove={() => onRemove(idx)}
        />
      ))}
    </div>
  );
});

AttachmentList.displayName = 'AttachmentList';

const Scheduler: React.FC<SchedulerProps> = memo(({
  time, setTime, timezone, setTimezone, onQueue, disabled, cronExpression, setCronExpression
}) => {
  const [datePart, timePart] = (time || 'T').split('T');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTimezones = useMemo(() => {
    if (!searchTerm) return TIMEZONES;
    return TIMEZONES.filter(tz =>
      tz.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tz.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tz.offset.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const selectedTimezone = TIMEZONES.find(tz => tz.value === timezone);
  const currentOffset = useMemo(() => {
    if (selectedTimezone) return selectedTimezone.offset;
    return getCurrentTimezoneOffset(timezone);
  }, [timezone, selectedTimezone]);

  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTime(`${e.target.value}T${timePart || '00:00'}`);
  }, [setTime, timePart]);

  const handleTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const timePart = e.target.value;
    if (!timePart) return; // Prevent setting an incomplete/empty timestamp

    // Get local YYYY-MM-DD instead of UTC to prevent date-shifting bugs
    const fallbackDate = new Date().toLocaleDateString('sv-SE'); // 'sv-SE' format is always YYYY-MM-DD

    setTime(`${datePart || fallbackDate}T${timePart}`);
  }, [setTime, datePart]);

  return (
    <div className="flex flex-wrap items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5 animate-in fade-in zoom-in duration-200">
      <div className="flex items-center gap-2 border-r border-white/10 pr-3">
        <Calendar className="w-3.5 h-3.5 text-white/40" />
        <input
          type="date"
          value={datePart || ''}
          onChange={handleDateChange}
          className="bg-transparent text-white text-xs outline-none [color-scheme:dark]"
          aria-label="Schedule date"
        />
      </div>
      <div className="flex items-center gap-2 border-r border-white/10 pr-3">
        <Clock className="w-3.5 h-3.5 text-white/40" />
        <input
          type="time"
          value={timePart?.substring(0, 5) || ''}
          onChange={handleTimeChange}
          className="bg-transparent text-white text-xs outline-none [color-scheme:dark]"
          aria-label="Schedule time"
        />
      </div>

      <div className="flex-1 min-w-[200px] relative">
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none z-10" />
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl text-white text-xs py-2 pl-9 pr-8 outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer hover:bg-black/60"
            aria-label="Select timezone"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value} className="bg-black text-white py-1">
                {tz.label} ({tz.offset})
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
        </div>
        <div className="text-[8px] text-text-secondary/40 mt-1 ml-2">
          Current offset: {currentOffset}
        </div>
      </div>

      <div className="flex items-center gap-2 border-l border-white/10 pl-3">
        <Repeat className="w-3.5 h-3.5 text-white/40" />
        <input
          type="text"
          value={cronExpression}
          onChange={(e) => setCronExpression(e.target.value)}
          placeholder="Cron (e.g. 0 0 12 * * ?)"
          className="bg-transparent text-white text-xs outline-none w-[150px] placeholder:text-white/20"
          aria-label="Cron expression"
        />
      </div>

      <Button
        variant="secondary"
        size="sm"
        className="rounded-xl h-8 text-[9px] font-bold tracking-widest uppercase px-4"
        disabled={disabled}
        onClick={onQueue}
      >
        Queue
      </Button>
    </div>
  );
});

Scheduler.displayName = 'Scheduler';

const RecipientSection: React.FC<RecipientSectionProps> = memo(({
  label, emails, setEmails, contacts, clusters = [], placeholder, onError
}) => {
  const contactOptions = useMemo(() =>
    contacts.map((c) => ({
      value: c.email,
      label: c.name ? `${c.name} <${c.email}>` : c.email
    })),
    [contacts]
  );

  const clusterOptions = useMemo(() =>
    clusters.map((c) => ({
      value: c.id || '',
      label: `${c.name || ''} (${contacts.filter(contact =>
        contact.groups?.some(g => g.id === c.id)
      ).length} contacts)`
    })),
    [clusters, contacts]
  );

  const addEmail = useCallback((email: string) => {
    if (!email) return;

    if (!isValidEmail(email)) {
      onError?.(`Invalid email address: ${email}`);
      return;
    }

    if (!emails.includes(email)) {
      setEmails([...emails, email]);
    }
  }, [emails, setEmails, onError]);

  const removeEmail = useCallback((email: string) => {
    setEmails(emails.filter(e => e !== email));
  }, [emails, setEmails]);

  const clearAllEmails = useCallback(() => {
    setEmails([]);
  }, [setEmails]);

  const addCluster = useCallback((id: string) => {
    if (!id) return;

    const groupContacts = contacts.filter((c) => c.groups?.some((g) => g.id === id));
    const newEmails = Array.from(new Set([...emails, ...groupContacts.map((c) => c.email)]));
    setEmails(newEmails);
  }, [contacts, emails, setEmails]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary/60 flex items-center gap-2">
          {label}:
          {emails.length > 0 && (
            <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-white/50">
              {emails.length}
            </span>
          )}
        </span>
        {emails.length > 0 && (
          <button
            onClick={clearAllEmails}
            className="text-[9px] uppercase font-bold text-red-400/60 hover:text-red-400 flex items-center gap-1 transition-colors"
            aria-label={`Clear all ${label} recipients`}
          >
            <Trash2 className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <CustomSelect
            options={contactOptions}
            value=""
            placeholder={placeholder}
            onChange={addEmail}
          />
        </div>
        {clusterOptions.length > 0 && (
          <CustomSelect
            options={clusterOptions}
            value=""
            placeholder="+ Add Cluster"
            onChange={addCluster}
          />
        )}
      </div>

      <div className="flex flex-wrap gap-2 p-3 bg-white/[0.02] border border-white/5 rounded-2xl min-h-[44px]">
        {emails.map((email: string) => (
          <span
            key={email}
            className="flex items-center gap-1 bg-white/10 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider group hover:bg-white/20 transition-colors"
          >
            {email}
            <button
              onClick={() => removeEmail(email)}
              className="text-white/40 group-hover:text-white font-bold text-xs ml-1"
              aria-label={`Remove ${email}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {emails.length === 0 && (
          <p className="text-text-secondary/40 text-[10px] italic p-1">No recipients selected...</p>
        )}
      </div>
    </div>
  );
});

RecipientSection.displayName = 'RecipientSection';

// --- Error Boundary ---
class ComposerErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error) => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; onError?: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error);
    console.error('Composer Error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl">
          <h3 className="text-red-400 font-bold mb-2">Composer Error</h3>
          <p className="text-sm text-white/60 mb-4">{this.state.error?.message || 'Something went wrong'}</p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="text-xs text-white/40 hover:text-white transition-colors uppercase tracking-wider"
            >
              Reload Page
            </button>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="text-xs text-indigo-400 hover:text-white transition-colors uppercase tracking-wider"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// --- Main Component ---
export const Composer: React.FC<ComposerProps> = (props) => {
  const [showMore, setShowMore] = useState(props.ccEmails.length > 0 || props.bccEmails.length > 0);
  const [error, setError] = useState<string | null>(null);

  const allRecipientsCount = useMemo(() => ({
    to: props.toEmails.length,
    cc: props.ccEmails.length,
    bcc: props.bccEmails.length,
    total: props.toEmails.length + props.ccEmails.length + props.bccEmails.length
  }), [props.toEmails, props.ccEmails, props.bccEmails]);

  // Auto-save draft
  const { saveDraft } = useDraft(props.draftId, {
    toEmails: props.toEmails,
    ccEmails: props.ccEmails,
    bccEmails: props.bccEmails,
    subject: props.subject,
    body: props.body,
    isMarketing: props.isMarketing,
    cronExpression: props.cronExpression,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (props.draftId && (props.subject || props.body || props.toEmails.length > 0)) {
        saveDraft({
          toEmails: props.toEmails,
          ccEmails: props.ccEmails,
          bccEmails: props.bccEmails,
          subject: props.subject,
          body: props.body,
          isMarketing: props.isMarketing,
          cronExpression: props.cronExpression,
        });
        props.onDraftSave?.({
          toEmails: props.toEmails,
          subject: props.subject,
          body: props.body,
          cronExpression: props.cronExpression,
        });
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [props.toEmails, props.ccEmails, props.bccEmails, props.subject, props.body, props.isMarketing, props.cronExpression, props.draftId, saveDraft, props.onDraftSave]);

  // Keyboard shortcuts
  const handleSendClick = useCallback(() => {
    const validationError = validateComposerState(props);
    if (validationError) {
      setError(validationError);
      setTimeout(() => setError(null), 5000);
      return;
    }
    props.handleSend();
  }, [props]);

  const handleScheduleClick = useCallback(() => {
    const validationError = validateComposerState(props);
    if (validationError) {
      setError(validationError);
      setTimeout(() => setError(null), 5000);
      return;
    }
    props.handleSchedule();
  }, [props]);

  const handleClearForm = useCallback(() => {
    if (confirm('Are you sure you want to clear the entire form?')) {
      props.setToEmails([]);
      props.setCcEmails([]);
      props.setBccEmails([]);
      props.setSubject('');
      props.setBody('');
      props.setAttachments([]);
      props.setShowScheduler(false);
    }
  }, [props]);

  useKeyboardShortcuts({
    onSend: handleSendClick,
    onSchedule: () => props.setShowScheduler(!props.showScheduler),
    onClear: handleClearForm,
    enabled: !props.isSending
  });

  const addAttachments = useCallback((files: FileList | null) => {
    if (!files) return;

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = ['image/', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument'];

    const validFiles = Array.from(files).filter(file => {
      const isValidSize = file.size <= MAX_FILE_SIZE;
      const isValidType = ALLOWED_TYPES.some(type =>
        file.type.startsWith(type) || file.type === type
      );

      if (!isValidSize) setError(`File ${file.name} exceeds 10MB limit`);
      if (!isValidType) setError(`File type for ${file.name} is not allowed`);

      return isValidSize && isValidType;
    });

    if (validFiles.length > 0) {
      props.setAttachments([...props.attachments, ...validFiles]);
    }

    setTimeout(() => setError(null), 3000);
  }, [props.attachments, props.setAttachments]);

  const removeAttachment = useCallback((index: number) => {
    props.setAttachments(props.attachments.filter((_, i) => i !== index));
  }, [props.attachments, props.setAttachments]);

  const toggleMarketingMode = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    props.setIsMarketing(e.target.checked);
  }, [props.setIsMarketing]);

  return (
    <ComposerErrorBoundary onError={(err) => setError(err.message)}>
      <div className="xl:col-span-2 space-y-8 bg-[#0a0a0c] border border-white/5 p-10 rounded-[32px] shadow-2xl">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 animate-in slide-in-from-top-2 fade-in duration-200">
            <p className="text-red-400 text-xs font-medium">{error}</p>
          </div>
        )}

        <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            Message Command Center
            {allRecipientsCount.total > 0 && (
              <span className="ml-2 text-[9px] bg-white/5 px-2 py-0.5 rounded-full">
                {allRecipientsCount.total} recipient{allRecipientsCount.total !== 1 ? 's' : ''}
              </span>
            )}
          </span>
          <button
            onClick={() => setShowMore(!showMore)}
            className="flex items-center gap-1 hover:text-white transition-colors"
            aria-label={showMore ? "Hide CC/BCC" : "Show CC/BCC"}
          >
            {showMore ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {showMore ? "Hide CC/BCC" : "Show CC/BCC"}
          </button>
        </h2>

        <RecipientSection
          label="To"
          emails={props.toEmails}
          setEmails={props.setToEmails}
          contacts={props.allContacts}
          clusters={props.clusters}
          placeholder="+ Add Individual..."
          onError={setError}
        />

        {showMore && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2 fade-in duration-300">
            <RecipientSection
              label="CC"
              emails={props.ccEmails}
              setEmails={props.setCcEmails}
              contacts={props.allContacts}
              placeholder="+ CC Contact..."
              onError={setError}
            />
            <RecipientSection
              label="BCC"
              emails={props.bccEmails}
              setEmails={props.setBccEmails}
              contacts={props.allContacts}
              placeholder="+ BCC Contact..."
              onError={setError}
            />
          </div>
        )}

        <div className="space-y-4">
          <input
            value={props.subject}
            onChange={(e) => props.setSubject(e.target.value)}
            placeholder="Subject Line"
            className="w-full h-14 bg-white/[0.02] border border-white/5 rounded-2xl px-6 text-white text-sm focus:border-white/20 outline-none transition-all"
            aria-label="Email subject"
          />
          <textarea
            value={props.body}
            onChange={(e) => props.setBody(e.target.value)}
            placeholder="Compose sequential protocol logic..."
            rows={10}
            className="w-full bg-white/[0.02] border border-white/5 rounded-[24px] p-6 text-white text-sm focus:border-white/20 outline-none transition-all resize-none font-mono"
            aria-label="Email body"
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1 flex items-center gap-2">
                <Paperclip className="w-3 h-3" /> Binary Attachments
                <span className="text-[8px] text-text-secondary/40">(Max 10MB each)</span>
              </span>
              <label className="text-[9px] font-bold text-indigo-400 hover:text-white cursor-pointer uppercase tracking-widest transition-colors flex items-center gap-1.5">
                <Plus className="w-3 h-3" /> Upload Files
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => addAttachments(e.target.files)}
                  aria-label="Upload attachments"
                />
              </label>
            </div>
            <div className="flex flex-wrap gap-2 min-h-[44px] p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
              <AttachmentList attachments={props.attachments} onRemove={removeAttachment} />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-white/5">
          <Button
            disabled={props.isSending || props.toEmails.length === 0 || !props.subject || !props.body}
            onClick={handleSendClick}
            className="h-12 px-10 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-lg"
            leftIcon={props.isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          >
            {props.isSending ? 'Deploying...' : 'Deploy Sequence'}
          </Button>

          <Button
            variant="secondary"
            disabled={props.isSending}
            onClick={props.handleSaveDraft}
            className="h-12 px-10 rounded-full font-bold text-[10px] uppercase tracking-widest"
          >
            Save as Draft
          </Button>

          <Button
            variant="ghost"
            onClick={() => props.setShowScheduler(!props.showScheduler)}
            className="text-[10px] font-bold uppercase tracking-widest rounded-full"
            leftIcon={<Calendar className="w-4 h-4" />}
          >
            {props.showScheduler ? "Hide Queue" : "Delay Execution"}
          </Button>

          {props.showScheduler && (
            <Scheduler
              time={props.scheduledTime}
              setTime={props.setScheduledTime}
              timezone={props.timezone}
              setTimezone={props.setTimezone}
              onQueue={handleScheduleClick}
              disabled={props.isSending || !props.scheduledTime || props.toEmails.length === 0 || !props.subject || !props.body}
              cronExpression={props.cronExpression}
              setCronExpression={props.setCronExpression}
            />
          )}
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer group">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={props.isMarketing}
                onChange={toggleMarketingMode}
                aria-label="Toggle marketing mode"
              />
              <div className="w-10 h-5 bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/40 after:border-white/10 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500/50 peer-checked:after:bg-white"></div>
              <span className="ml-3 text-[10px] font-bold uppercase tracking-widest text-text-secondary group-hover:text-white transition-colors">
                {props.isMarketing ? "Newsletter / Marketing Mode" : "Cold Outreach / Personal Mode"}
              </span>
            </label>
          </div>
          <p className="text-[9px] text-text-secondary/40 font-medium italic">
            {props.isMarketing
              ? "(Includes tracking pixels & unsubscribe footer)"
              : "(Removes all marketing footprint for maximum deliverability)"}
          </p>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="text-[8px] text-text-secondary/30 text-center pt-4 border-t border-white/5">
          <span className="mr-3">⌘/Ctrl + Enter: Send</span>
          <span className="mr-3">⌘/Ctrl + Shift + S: Schedule</span>
          <span>Esc: Clear form</span>
        </div>
      </div>
    </ComposerErrorBoundary>
  );
};

Composer.displayName = 'Composer';