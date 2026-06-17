import api from '@/lib/api';
import { AnalyticsStatsDto, EventRequest } from '@/types/api';

export const analyticsService = {
  getStats: async (subject?: string): Promise<AnalyticsStatsDto> => {
    const response = await api.get<AnalyticsStatsDto>('/analytics/stats', {
      params: { subject }
    });
    return response.data;
  },
  recordEvent: async (event: EventRequest): Promise<void> => {
    await api.post('/analytics/events', event);
  },
  getStatsForContact: async (email: string): Promise<AnalyticsStatsDto> => {
    const response = await api.get<AnalyticsStatsDto>(`/analytics/contact?email=${encodeURIComponent(email)}`);
    return response.data;
  },
  getTimeline: async (subject?: string): Promise<any[]> => {
    const response = await api.get<any[]>('/analytics/stats/timeline', {
      params: { subject }
    });
    return response.data;
  },
};
