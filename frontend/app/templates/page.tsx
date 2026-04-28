'use client';

import React, { useEffect, useState } from 'react';
import { emailService } from '@/services/email.service';
import { EmailTemplate } from '@/types/api';
import { 
  Plus, 
  Search, 
  FileText, 
  MoreVertical, 
  Trash2, 
  Edit2, 
  Copy, 
  Loader2,
  X,
  Mail,
  Clock,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { format } from 'date-fns';
import { cn, handleError, showSuccess } from '@/lib/utils';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

  const fetchTemplates = async () => {
    try {
      const data = await emailService.listTemplates();
      setTemplates(data);
    } catch (error) {
      handleError(error, 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    async function loadData() {
      try {
        const data = await emailService.listTemplates();
        if (isMounted) {
          setTemplates(data);
          setLoading(false);
        }
      } catch (error) {
        handleError(error, 'Failed to fetch templates');
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await emailService.deleteTemplate(id);
      setTemplates(templates.filter(t => t.id !== id));
      showSuccess('Template deleted successfully');
    } catch (error) {
      handleError(error, 'Failed to delete template');
    }
  };

  const handleSaveTemplate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const subject = formData.get('subject') as string;
    const content = formData.get('content') as string;

    if (!name || !subject || !content) {
      handleError(new Error('Please fill in all required fields'));
      return;
    }

    setLoading(true);
    try {
      if (selectedTemplate?.id) {
        await emailService.updateTemplate(selectedTemplate.id, { name, subject, content });
        showSuccess('Template updated successfully');
      } else {
        await emailService.createTemplate({ name, subject, content });
        showSuccess('Template created successfully');
      }
      setIsModalOpen(false);
      fetchTemplates();
    } catch (error) {
      handleError(error, selectedTemplate ? 'Failed to update template' : 'Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = Array.isArray(templates)
    ? templates.filter(t => 
        t.name?.toLowerCase().includes(search.toLowerCase()) || 
        t.subject?.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div
           initial={{ opacity: 0, y: -10 }}
           animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-white tracking-tighter">Campaign Matrix</h1>
          <p className="text-text-secondary text-sm mt-2 font-medium">Design and deploy reusable protocol blueprints.</p>
        </motion.div>
        <Button 
          id="new-template"
          onClick={() => {
            setSelectedTemplate(null);
            setIsModalOpen(true);
          }}
          className="h-12 px-8 font-bold uppercase tracking-widest text-[10px] rounded-full"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Blueprint
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative flex-1">
          <Input 
            placeholder="Search blueprints by identifier..."
            leftIcon={<Search className="w-4 h-4 text-text-secondary" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-surface-primary border-border-color h-12 rounded-2xl"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-72 bg-surface-primary border border-border-color rounded-[32px] animate-pulse" />
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-32 bg-bg-primary rounded-[40px] border border-border-color border-dashed"
        >
          <div className="w-20 h-20 bg-surface-primary border border-border-color rounded-3xl flex items-center justify-center mb-8">
            <FileText className="w-10 h-10 text-text-secondary/30" />
          </div>
          <h3 className="text-white font-bold text-2xl tracking-tight">Zero Blueprints</h3>
          <p className="text-text-secondary text-sm max-w-xs text-center mt-3 font-medium leading-relaxed">Initialize your first communications protocol to begin operations.</p>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="mt-10 font-bold uppercase tracking-widest text-[10px] h-12 px-8 rounded-full"
            variant="secondary"
          >
            Deploy First Logic
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTemplates.map((template, i) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="group bg-surface-primary border border-border-color rounded-[32px] overflow-hidden hover:border-white/20 transition-all flex flex-col shadow-2xl shadow-black/20"
            >
              <div className="h-32 p-8 flex flex-col justify-end relative overflow-hidden bg-bg-primary/50 border-b border-border-color">
                <div className="absolute top-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <button 
                    id={`edit-template-${template.id}`}
                    onClick={() => {
                      setSelectedTemplate(template);
                      setIsModalOpen(true);
                    }}
                    className="w-10 h-10 flex items-center justify-center bg-bg-primary border border-border-color rounded-xl hover:bg-white hover:text-bg-primary transition-all shadow-xl"
                  >
                    <Edit2 className="w-4.5 h-4.5" />
                  </button>
                  <button 
                    id={`delete-template-${template.id}`}
                    onClick={() => handleDelete(template.id!)}
                    className="w-10 h-10 flex items-center justify-center bg-bg-primary border border-border-color rounded-xl hover:bg-white hover:text-bg-primary transition-all shadow-xl"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
                <Mail className="w-24 h-24 text-white/5 absolute -bottom-6 -left-6 rotate-12 transition-transform duration-500 group-hover:scale-110" />
                <div className="relative z-10">
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white bg-white/10 px-3 py-1.5 rounded-full border border-white/5 inline-block mb-4">Protocol Node</span>
                  <h3 className="text-xl font-bold text-text-main truncate tracking-tight">{template.name}</h3>
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.3em] mb-2">Metadata Header</p>
                <p className="text-sm text-text-secondary line-clamp-2 mb-8 font-medium leading-relaxed italic">&quot;{template.subject}&quot;</p>
                <div className="flex items-center justify-between pt-8 border-t border-border-color mt-auto">
                  <div className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                    <Clock className="w-3.5 h-3.5 text-text-secondary/50" />
                    {template.updatedAt ? format(new Date(template.updatedAt), 'MMM d, yyyy') : 'Initialized'}
                  </div>
                  <button id={`preview-template-${template.id}`} className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary hover:text-white flex items-center gap-2.5 transition-all bg-bg-primary px-4 py-2 rounded-xl border border-border-color group-hover:border-white/10">
                    Inspected <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0" 
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-bg-primary border border-border-color rounded-[40px] w-full max-w-5xl max-h-[90vh] shadow-modal flex flex-col relative z-20 overflow-hidden"
            >
              <form onSubmit={handleSaveTemplate} className="flex flex-col h-full">
                <div className="px-10 py-8 border-b border-border-color flex items-center justify-between bg-surface-primary/30">
                  <div className="flex items-center gap-6">
                     <div className="w-14 h-14 rounded-2xl bg-surface-primary flex items-center justify-center border border-border-color text-white">
                       <FileText className="w-7 h-7" />
                     </div>
                     <div>
                        <h3 className="text-2xl font-bold text-white tracking-tight">{selectedTemplate ? 'Modify Protocol' : 'Deploy Protocol'}</h3>
                        <p className="text-[10px] font-bold text-text-secondary mt-1 uppercase tracking-widest leading-none">Logic structure definition</p>
                     </div>
                  </div>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="w-12 h-12 flex items-center justify-center bg-surface-primary border border-border-color hover:bg-white hover:text-bg-primary rounded-2xl transition-all shadow-xl">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-12">
                  <div className="max-w-4xl mx-auto space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <Input 
                        label="Identifier" 
                        name="name"
                        placeholder="e.g. CORE_WELCOME" 
                        defaultValue={selectedTemplate?.name}
                        className="bg-surface-primary border-border-color rounded-2xl h-14"
                      />
                      <Input 
                        label="Header" 
                        name="subject"
                        placeholder="e.g. Connection Established" 
                        defaultValue={selectedTemplate?.subject}
                        className="bg-surface-primary border-border-color rounded-2xl h-14"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] ml-1">Logic Payload</label>
                      <div className="relative">
                        <textarea 
                          name="content"
                          placeholder="Inject logic definitions here..." 
                          rows={14} 
                          className="w-full bg-surface-primary border border-border-color rounded-[32px] py-8 px-8 focus:ring-2 focus:ring-white/5 focus:border-white outline-none text-text-main text-[16px] font-medium leading-relaxed transition-all resize-none placeholder:text-border-color font-mono"
                          defaultValue={selectedTemplate?.content}
                        ></textarea>
                      </div>
                      <p className="text-[9px] font-bold text-text-secondary/50 ml-1 uppercase tracking-[0.2em]">Encrypted transmission enabled – Protocol v2.5</p>
                    </div>
                  </div>
                </div>

                <div className="px-10 py-8 border-t border-border-color flex items-center justify-end gap-5 bg-surface-primary/30">
                  <button 
                    id="cancel-template" 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary hover:text-white transition-all"
                  >
                    Abort
                  </button>
                  <Button 
                    id="save-template"
                    type="submit"
                    className="h-14 px-12 font-bold uppercase tracking-widest text-[11px] rounded-full"
                    disabled={loading}
                    leftIcon={loading && <Loader2 className="w-5 h-5 animate-spin" />}
                  >
                    {selectedTemplate ? 'Update Matrix' : 'Deploy Logic'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M5 12h14m-7-7 7 7-7 7"/>
    </svg>
  );
}
