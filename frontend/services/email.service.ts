import api from '@/lib/api';
import { EmailTemplate, EmailRequest, EmailLog } from '@/types/api';

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
    const response = await api.get<EmailLog[]>('/email/logs');
    return response.data;
  },
};
