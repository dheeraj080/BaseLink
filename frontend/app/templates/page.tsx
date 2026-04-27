'use client';

import React, { useEffect, useState, useRef } from 'react';
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
  Eye,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  
  const [templateName, setTemplateName] = useState('');
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateContent, setTemplateContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedTemplate) {
      setTemplateName(selectedTemplate.name || '');
      setTemplateSubject(selectedTemplate.subject || '');
      setTemplateContent(selectedTemplate.content || '');
    } else {
      setTemplateName('');
      setTemplateSubject('');
      setTemplateContent('');
    }
  }, [selectedTemplate, isModalOpen]);

  const handleHtmlUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!templateName) {
      const baseName = file.name.replace('.html', '');
      setTemplateName(baseName);
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setTemplateContent(event.target.result as string);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveTemplate = async () => {
    if (!templateName || !templateSubject) return;
    setIsSaving(true);
    try {
      const payload: EmailTemplate = {
        name: templateName,
        subject: templateSubject,
        content: templateContent,
      };
      if (selectedTemplate?.id) {
        payload.id = selectedTemplate.id;
        await emailService.updateTemplate(payload.id, payload);
      } else {
        await emailService.createTemplate(payload);
      }
      setIsModalOpen(false);
      fetchTemplates();
    } catch (error) {
      console.error('Failed to save template', error);
    } finally {
      setIsSaving(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const data = await emailService.listTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to fetch templates', error);
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
        console.error('Failed to fetch templates', error);
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
    } catch (error) {
      console.error('Failed to delete template', error);
    }
  };

  const filteredTemplates = templates.filter(t => 
    t.name?.toLowerCase().includes(search.toLowerCase()) || 
    t.subject?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div
           initial={{ opacity: 0, y: -10 }}
           animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-soft-linen tracking-tight">Email Templates</h1>
          <p className="text-silver text-sm mt-1">Design and manage reusable message layouts for your campaigns.</p>
        </motion.div>
        <Button 
          id="new-template"
          onClick={() => {
            setSelectedTemplate(null);
            setIsModalOpen(true);
          }}
          className="h-11 px-6 font-semibold"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Template
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative flex-1">
          <Input 
            placeholder="Search templates by name or subject..."
            leftIcon={<Search className="w-4 h-4 text-silver" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-onyx border-onyx-400 h-11"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-onyx-400/50 border border-onyx-400 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 bg-onyx/30 rounded-2xl border-2 border-dashed border-onyx-400"
        >
          <div className="w-16 h-16 bg-onyx-400 rounded-full flex items-center justify-center mb-6">
            <FileText className="w-8 h-8 text-silver/50" />
          </div>
          <h3 className="text-soft-linen font-bold text-xl">No Templates Found</h3>
          <p className="text-silver text-sm max-w-xs text-center mt-2 leading-relaxed">Create your first template to start sending consistent messages to your contacts.</p>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="mt-8 font-semibold"
            variant="secondary"
          >
            Create Your First Template
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
              className="group bg-onyx border border-onyx-400 rounded-xl overflow-hidden hover:border-soft-linen/50 transition-all flex flex-col shadow-sm"
            >
              <div className="h-32 bg-onyx p-6 flex flex-col justify-end relative overflow-hidden">
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button 
                    id={`edit-template-${template.id}`}
                    onClick={() => {
                      setSelectedTemplate(template);
                      setIsModalOpen(true);
                    }}
                    className="w-8 h-8 flex items-center justify-center bg-onyx border border-onyx-400 rounded-lg hover:bg-onyx-400 text-silver hover:text-soft-linen transition-all shadow-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    id={`delete-template-${template.id}`}
                    onClick={() => handleDelete(template.id!)}
                    className="w-8 h-8 flex items-center justify-center bg-onyx border border-onyx-400 rounded-lg hover:bg-onyx-600 hover:border-soft-linen/20 text-silver hover:text-soft-linen transition-all shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <Mail className="w-16 h-16 text-soft-linen/5 absolute -bottom-4 -left-4 rotate-12 transition-transform duration-500 group-hover:scale-110" />
                <div className="relative z-10">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-soft-linen bg-soft-linen/10 px-2.5 py-1 rounded-md border border-soft-linen/10 inline-block mb-3">Email Template</span>
                  <h3 className="text-lg font-bold text-soft-linen truncate group-hover:text-soft-linen transition-colors">{template.name}</h3>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <p className="text-[10px] font-bold text-silver uppercase tracking-widest mb-1 ml-0.5">Subject Line</p>
                <p className="text-sm text-silver line-clamp-2 mb-6 font-medium leading-relaxed group-hover:text-white-smoke transition-colors italic">&quot;{template.subject}&quot;</p>
                <div className="flex items-center justify-between pt-6 border-t border-onyx-400 mt-auto">
                  <div className="flex items-center gap-2 text-xs font-medium text-silver">
                    <Clock className="w-3.5 h-3.5 text-onyx-700" />
                    {template.updatedAt ? format(new Date(template.updatedAt), 'MMM d, yyyy') : 'Recently Created'}
                  </div>
                  <button id={`preview-template-${template.id}`} className="text-xs font-bold text-silver hover:text-soft-linen flex items-center gap-2 transition-all uppercase tracking-wider bg-onyx px-3 py-1.5 rounded-lg border border-onyx-400">
                    Preview <Eye className="w-3.5 h-3.5" />
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-onyx/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0" 
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-onyx border border-onyx-400 rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col relative z-20 overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-onyx-400 flex items-center justify-between bg-onyx-100/50">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-xl bg-onyx-400 flex items-center justify-center border border-onyx-300 text-soft-linen">
                     <FileText className="w-6 h-6" />
                   </div>
                   <div>
                      <h3 className="text-xl font-bold text-soft-linen">{selectedTemplate ? 'Edit Template' : 'New Template'}</h3>
                      <p className="text-xs text-silver mt-0.5">Customize your email content and structure.</p>
                   </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center hover:bg-onyx-400 rounded-xl transition-all text-silver hover:text-soft-linen">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10">
                <div className="max-w-3xl mx-auto space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input 
                      label="Template Name" 
                      placeholder="e.g. Welcome Email" 
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      className="bg-onyx border-onyx-400"
                    />
                    <Input 
                      label="Email Subject" 
                      placeholder="e.g. Welcome to our platform!" 
                      value={templateSubject}
                      onChange={(e) => setTemplateSubject(e.target.value)}
                      className="bg-onyx border-onyx-400"
                    />
                  </div>

                  <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-bold text-silver uppercase tracking-wider">Template Content</label>
                    <div>
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-semibold text-soft-linen hover:text-white-smoke transition-all flex items-center gap-1.5 px-3 py-1.5 bg-onyx-400 border border-onyx-300 rounded-lg"
                      >
                        <Upload className="w-3.5 h-3.5" /> Upload .html
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleHtmlUpload} 
                        accept=".html" 
                        className="hidden" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <textarea 
                      placeholder="Write your email content here. Use {{name}} for dynamic tags..." 
                      rows={12} 
                      className="w-full bg-onyx border border-onyx-400 rounded-xl py-6 px-6 focus:ring-1 focus:ring-silver/50 outline-none text-soft-linen text-[14px] leading-relaxed transition-all resize-none placeholder:text-onyx-700"
                      value={templateContent}
                      onChange={(e) => setTemplateContent(e.target.value)}
                    ></textarea>
                    <p className="text-[10px] text-silver ml-1">Supports Markdown and HTML formatting.</p>
                  </div>
                </div>
              </div>

              <div className="px-8 py-6 border-t border-onyx-400 flex items-center justify-end gap-3 bg-onyx-100/50">
                <button 
                  id="cancel-template" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold text-silver hover:text-soft-linen hover:bg-onyx-400 transition-all border border-transparent"
                >
                  Cancel
                </button>
                <Button 
                  id="save-template"
                  className="px-8 font-semibold"
                  onClick={handleSaveTemplate}
                  loading={isSaving}
                  disabled={!templateName || !templateSubject}
                >
                  {selectedTemplate ? 'Save Changes' : 'Create Template'}
                </Button>
              </div>
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
