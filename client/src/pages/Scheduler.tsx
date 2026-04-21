import React, { useEffect, useState } from "react";
import { mockApi, EmailCampaign } from "@/src/api/mockApi";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from "motion/react";
import { GripVertical, Calendar as CalendarIcon, Send, Clock, ChevronLeft, ChevronRight, Plus, X, Loader2, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from "date-fns";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";

interface SortableCampaignItemProps {
  campaign: EmailCampaign;
  onSendNow?: (id: string) => Promise<void>;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}

// Sortable Item Component
const SortableCampaignItem: React.FC<SortableCampaignItemProps> = ({ 
  campaign, 
  onSendNow,
  isSelected,
  onToggleSelect
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: campaign.id });
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<'success' | 'error' | null>(null);

  const handleSend = async () => {
    if (!onSendNow) return;
    setIsSending(true);
    setSendResult(null);
    try {
      await onSendNow(campaign.id);
      setSendResult('success');
      setTimeout(() => setSendResult(null), 3000);
    } catch (e) {
      setSendResult('error');
      setTimeout(() => setSendResult(null), 3000);
    } finally {
      setIsSending(false);
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`bg-white dark:bg-brand-950 p-4 rounded-lg border flex items-center gap-4 ${isDragging ? 'shadow-lg border-brand-900 dark:border-brand-300 ring-1 ring-brand-900 dark:ring-brand-300' : 'border-brand-100 dark:border-brand-800 shadow-sm'} ${isSelected ? 'ring-1 ring-brand-500 bg-brand-50/50 dark:bg-brand-900/20' : ''}`}
    >
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400 dark:text-gray-500 hover:text-brand-900 dark:hover:text-brand-50">
        <GripVertical className="h-5 w-5" />
      </button>

      <input 
        type="checkbox" 
        checked={isSelected}
        onChange={() => onToggleSelect(campaign.id)}
        className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-600 cursor-pointer"
      />
      
      <div className="flex-1">
        <h4 className="font-medium text-brand-900 dark:text-brand-50">{campaign.subject}</h4>
        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            {campaign.status === 'sent' ? <Send className="h-3 w-3" /> : campaign.status === 'scheduled' ? <Clock className="h-3 w-3" /> : <CalendarIcon className="h-3 w-3" />}
            <span className="capitalize">{campaign.status}</span>
          </span>
          {campaign.scheduledFor && (
            <span>Scheduled: {new Date(campaign.scheduledFor).toLocaleDateString()}</span>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {sendResult === 'success' && <span className="text-sm text-green-600 flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Sent!</span>}
        {sendResult === 'error' && <span className="text-sm text-red-600 flex items-center gap-1"><XCircle className="h-4 w-4" /> Failed</span>}
        
        {campaign.status === 'scheduled' && onSendNow && !sendResult && (
          <Button variant="outline" size="sm" onClick={handleSend} disabled={isSending} className="ml-2 shrink-0">
            {isSending ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <Send className="h-3 w-3 mr-2" />} 
            {isSending ? 'Sending...' : 'Send Now'}
          </Button>
        )}
      </div>
    </div>
  );
}

function CalendarView({ campaigns }: { campaigns: EmailCampaign[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "MMMM yyyy";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white dark:bg-brand-950 rounded-xl border border-brand-100 dark:border-brand-800 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-brand-100 dark:border-brand-800 flex justify-between items-center bg-brand-50 dark:bg-brand-900/50">
        <h2 className="font-semibold text-brand-900 dark:text-brand-50">{format(currentDate, dateFormat)}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            const dayCampaigns = campaigns.filter(c => c.scheduledFor && isSameDay(parseISO(c.scheduledFor), day));
            const isCurrentMonth = isSameMonth(day, monthStart);
            
            return (
              <div 
                key={i} 
                className={`min-h-[80px] p-1 rounded-md border ${isCurrentMonth ? 'bg-white dark:bg-brand-950 border-brand-100 dark:border-brand-800' : 'bg-gray-50 dark:bg-brand-900/20 border-transparent text-gray-400 dark:text-gray-600'}`}
              >
                <div className="text-right text-xs font-medium mb-1 pr-1">{format(day, 'd')}</div>
                <div className="space-y-1">
                  {dayCampaigns.map(c => (
                    <div key={c.id} className="text-[10px] leading-tight p-1 rounded bg-brand-100 dark:bg-brand-800 text-brand-900 dark:text-brand-50 truncate" title={c.subject}>
                      {c.subject}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Scheduler() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newDate, setNewDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBulkActioning, setIsBulkActioning] = useState(false);

  // Quick Send Form State
  const [quickSubject, setQuickSubject] = useState("");
  const [quickRecipient, setQuickRecipient] = useState("");
  const [quickContent, setQuickContent] = useState("");
  const [isQuickSending, setIsQuickSending] = useState(false);

  useEffect(() => {
    mockApi.campaigns.getAll().then(setCampaigns);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setCampaigns((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSendNow = async (id: string) => {
    try {
      await mockApi.campaigns.updateStatus(id, 'sent');
      setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: 'sent', sentAt: new Date().toISOString() } : c));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject) return;
    
    setIsSubmitting(true);
    try {
      const newCampaign = await mockApi.campaigns.add({
        subject: newSubject,
        status: newDate ? 'scheduled' : 'draft',
        scheduledFor: newDate ? new Date(newDate).toISOString() : undefined,
      });
      setCampaigns(prev => [...prev, newCampaign]);
      setIsCreateModalOpen(false);
      setNewSubject("");
      setNewDate("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === campaigns.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(campaigns.map(c => c.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkActioning(true);
    try {
      const ids: string[] = Array.from(selectedIds);
      await mockApi.campaigns.bulkDelete(ids);
      setCampaigns(prev => prev.filter(c => !ids.includes(c.id)));
      setSelectedIds(new Set());
    } catch (error) {
      console.error(error);
    } finally {
      setIsBulkActioning(false);
    }
  };

  const handleBulkSend = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkActioning(true);
    try {
      const ids: string[] = Array.from(selectedIds);
      await mockApi.campaigns.bulkUpdateStatus(ids, 'sent');
      setCampaigns(prev => prev.map(c => ids.includes(c.id) ? { ...c, status: 'sent', sentAt: new Date().toISOString() } : c));
      setSelectedIds(new Set());
    } catch (error) {
      console.error(error);
    } finally {
      setIsBulkActioning(false);
    }
  };

  const handleQuickSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSubject || !quickRecipient || !quickContent) return;
    
    setIsQuickSending(true);
    try {
      const newCampaign = await mockApi.campaigns.add({
        subject: quickSubject,
        recipient: quickRecipient,
        content: quickContent,
        status: 'sent',
        sentAt: new Date().toISOString(),
      });
      setCampaigns(prev => [...prev, newCampaign]);
      setQuickSubject("");
      setQuickRecipient("");
      setQuickContent("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsQuickSending(false);
    }
  };

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Email Scheduler</h1>
          <p className="text-gray-500">Manage and visualize your upcoming email campaigns.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Campaign
        </Button>
      </div>

      <div className="bg-white dark:bg-brand-950 p-6 rounded-xl border border-brand-100 dark:border-brand-800 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-brand-900 dark:text-brand-50 flex items-center gap-2">
          <Send className="h-5 w-5 text-brand-500" />
          Quick Send
        </h3>
        <form onSubmit={handleQuickSend} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Recipient Email</label>
              <Input 
                required 
                type="email"
                value={quickRecipient} 
                onChange={e => setQuickRecipient(e.target.value)} 
                placeholder="recipient@example.com" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <Input 
                required 
                value={quickSubject} 
                onChange={e => setQuickSubject(e.target.value)} 
                placeholder="Campaign Subject" 
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email Content</label>
              <textarea 
                required
                value={quickContent}
                onChange={e => setQuickContent(e.target.value)}
                className="w-full min-h-[100px] p-3 rounded-md border border-brand-100 dark:border-brand-800 bg-white dark:bg-brand-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                placeholder="Write your email content here..."
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isQuickSending || !quickSubject || !quickRecipient || !quickContent}>
                {isQuickSending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                {isQuickSending ? 'Sending...' : 'Send Campaign'}
              </Button>
            </div>
          </div>
        </form>
      </div>

      <div className="grid xl:grid-cols-2 gap-8 items-start">
        <div className="bg-brand-50 dark:bg-brand-900/50 p-6 rounded-xl border border-brand-100 dark:border-brand-800">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-brand-900 dark:text-brand-50">Campaign Queue</h3>
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 mr-2">{selectedIds.size} selected</span>
                <Button variant="outline" size="sm" onClick={handleBulkDelete} disabled={isBulkActioning} className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                  {isBulkActioning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />} Delete
                </Button>
                <Button variant="outline" size="sm" onClick={handleBulkSend} disabled={isBulkActioning}>
                  {isBulkActioning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />} Send
                </Button>
              </div>
            )}
          </div>
          
          <div className="mb-3 px-4 flex items-center gap-4">
            <div className="w-5" /> {/* Spacer for drag handle */}
            <input 
              type="checkbox" 
              checked={campaigns.length > 0 && selectedIds.size === campaigns.length}
              onChange={toggleSelectAll}
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-600 cursor-pointer"
            />
            <span className="text-sm text-gray-500">Select All</span>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={campaigns.map(c => c.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {campaigns.map(campaign => (
                  <SortableCampaignItem 
                    key={campaign.id} 
                    campaign={campaign} 
                    onSendNow={handleSendNow} 
                    isSelected={selectedIds.has(campaign.id)}
                    onToggleSelect={toggleSelect}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4 text-brand-900 dark:text-brand-50">Calendar</h3>
          <CalendarView campaigns={campaigns} />
        </div>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-brand-950 rounded-xl shadow-xl border border-brand-100 dark:border-brand-800 w-full max-w-md overflow-hidden"
          >
            <div className="flex justify-between items-center p-4 border-b border-brand-100 dark:border-brand-800">
              <h3 className="font-semibold text-lg">Create New Campaign</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-500 hover:text-brand-900 dark:hover:text-brand-50">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCampaign} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <Input 
                  required 
                  value={newSubject} 
                  onChange={e => setNewSubject(e.target.value)} 
                  placeholder="e.g., Summer Sale Announcement" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Schedule Date & Time (Optional)</label>
                <Input 
                  type="datetime-local" 
                  value={newDate} 
                  onChange={e => setNewDate(e.target.value)} 
                />
                <p className="text-xs text-gray-500 mt-1">Leave blank to save as draft.</p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting || !newSubject}>
                  {isSubmitting ? 'Saving...' : 'Save Campaign'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
