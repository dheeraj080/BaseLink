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
  scheduleEmail: async (request: EmailRequest, scheduleTime: string): Promise<string> => {
    const response = await api.post<string>(`/email/schedule?scheduleTime=${scheduleTime}`, request);
    return response.data;
  },
  getScheduledJobs: async (): Promise<object[]> => {
    const response = await api.get<object[]>('/email/status');
    return response.data;
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
