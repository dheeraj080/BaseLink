import api from '@/lib/api';
import { EmailTemplate, EmailRequest, EmailLog } from '@/types/api';

let cachedLogs: EmailLog[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 5000; // 5 seconds cache

export const emailService = {
  listTemplates: async (): Promise<EmailTemplate[]> => {
    const response = await api.get<EmailTemplate[]>('/email/templates');
    return response.data;
  },
  createTemplate: async (template: EmailTemplate): Promise<EmailTemplate> => {
    const response = await api.post<EmailTemplate>('/email/templates', template);
    return response.data;
  },
  getTemplate: async (id: string): Promise<EmailTemplate> => {
    const response = await api.get<EmailTemplate>(`/email/templates/${id}`);
    return response.data;
  },
  updateTemplate: async (id: string, template: EmailTemplate): Promise<EmailTemplate> => {
    const response = await api.put<EmailTemplate>(`/email/templates/${id}`, template);
    return response.data;
  },
  deleteTemplate: async (id: string): Promise<void> => {
    await api.delete(`/email/templates/${id}`);
  },
  sendEmail: async (request: EmailRequest): Promise<string> => {
    const response = await api.post<string>('/email/send', request);
    cachedLogs = null; // Invalidate cache on send
    return response.data;
  },
  sendEmailWithAttachments: async (request: EmailRequest, files: File[]): Promise<string> => {
    const formData = new FormData();
    formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    files.forEach(file => formData.append('files', file));
    
    const response = await api.post<string>('/email/send-with-attachments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    cachedLogs = null;
    return response.data;
  },
  scheduleEmail: async (request: EmailRequest, scheduleTime: string, files: File[] = []): Promise<string> => {
    const encodedTime = encodeURIComponent(scheduleTime);
    
    if (files.length > 0) {
      const formData = new FormData();
      formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));
      files.forEach(file => formData.append('files', file));
      
      const response = await api.post<string>(`/email/schedule?scheduleTime=${encodedTime}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    }
    
    const formData = new FormData();
    formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    const response = await api.post<string>(`/email/schedule?scheduleTime=${encodedTime}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  getScheduledJobs: async (): Promise<any[]> => {
    const response = await api.get<any[]>('/email/status');
    return response.data;
  },
  cancelScheduledJob: async (jobName: string, group: string = 'DEFAULT'): Promise<void> => {
    await api.delete(`/email/schedule/${jobName}?group=${group}`);
  },
  getLogs: async (): Promise<EmailLog[]> => {
    const now = Date.now();
    if (cachedLogs && (now - lastFetchTime < CACHE_TTL)) {
      return cachedLogs;
    }
    const response = await api.get<EmailLog[]>('/email/logs');
    cachedLogs = response.data;
    lastFetchTime = now;
    return response.data;
  },
};
