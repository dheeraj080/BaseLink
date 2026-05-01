import api from '@/lib/api';
import { AnalyticsStatsDto, EventRequest } from '@/types/api';

export const analyticsService = {
  getStats: async (): Promise<AnalyticsStatsDto> => {
    const response = await api.get<AnalyticsStatsDto>('/analytics/stats');
    return response.data;
  },
  recordEvent: async (event: EventRequest): Promise<void> => {
    await api.post('/analytics/events', event);
  },
  getStatsForContact: async (email: string): Promise<AnalyticsStatsDto> => {
    const response = await api.get<AnalyticsStatsDto>(`/analytics/contact?email=${encodeURIComponent(email)}`);
    return response.data;
  },
  getTimeline: async (): Promise<any[]> => {
    const response = await api.get<any[]>('/analytics/stats/timeline');
    return response.data;
  },
};
