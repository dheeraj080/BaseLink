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
};
