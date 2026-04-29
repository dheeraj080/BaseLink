import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1', // Assuming the app proxies to the backend
  headers: {
    'Content-Type': 'application/json',
  },
});

if (process.env.NEXT_PUBLIC_MOCK === 'true') {
  api.defaults.adapter = async (config) => {
    const url = config.url || '';
    const method = config.method?.toLowerCase() || 'get';

    const mockData = {
      contacts: [
        { id: 'mock_1', name: 'Alpha Sequence', email: 'alpha@matrix.io', phoneNo: '+1 (555) 0199', description: 'Priority vector telemetry', selected: false, createdAt: '2026-04-29T00:00:00Z', groups: [{ id: 'cluster_1', name: 'RECON' }] },
        { id: 'mock_2', name: 'Beta Layer', email: 'beta@matrix.io', phoneNo: '+1 (555) 0244', description: 'Secondary node buffer', selected: false, createdAt: '2026-04-28T00:00:00Z', groups: [{ id: 'cluster_2', name: 'MARKETING' }] }
      ],
      stats: { 
        totalSent: 150, 
        totalDelivered: 148, 
        totalOpened: 85, 
        totalClicked: 42, 
        totalReplied: 14, 
        totalUnsubscribed: 3, 
        totalBounced: 2, 
        openRate: 57.4, 
        clickThroughRate: 28.3, 
        deliveryRate: 98.6, 
        conversionRate: 15.9, 
        activeCampaigns: 2 
      },
      groups: [
        { id: 'cluster_1', name: 'RECON', description: 'Early diagnostic parameters' },
        { id: 'cluster_2', name: 'MARKETING', description: 'Bulk transmission routes' }
      ],
      logs: [
        { id: 'l1', subject: 'Priority Sequence', recipient: 'alpha@matrix.io', status: 'SENT', sentAt: '2026-04-29T10:00:00Z' },
        { id: 'l2', subject: 'Secondary Buffer', recipient: 'beta@matrix.io', status: 'SENT', sentAt: '2026-04-28T14:30:00Z' },
        { id: 'l3', subject: 'Priority Sequence', recipient: 'gamma@matrix.io', status: 'SENT', sentAt: '2026-04-27T08:00:00Z' }
      ]
    };

    let data: any = null;
    let status = 200;

    if (url.includes('/contacts')) {
      if (method === 'get') {
        data = mockData.contacts;
      } else if (method === 'post') {
        const body = JSON.parse(config.data || '{}');
        data = { id: `mock_${Date.now()}`, ...body, createdAt: new Date().toISOString() };
        status = 201;
      } else {
        data = { success: true };
      }
    } else if (url.includes('/analytics') || url.includes('/stats')) {
      data = mockData.stats;
    } else if (url.includes('/groups') || url.includes('/list')) {
      data = mockData.groups;
    } else if (url.includes('/email/logs') || url.includes('/broadcasts') || url.includes('/logs')) {
      const generatedLogs = [];
      for (let i = 0; i < 150; i++) {
        const dayOffset = i % 5;
        generatedLogs.push({
          id: `mock_log_${i}`,
          subject: i % 2 === 0 ? 'Priority Sequence' : 'Secondary Buffer',
          recipient: `node_${i}@matrix.io`,
          status: 'SENT',
          sentAt: `2026-04-${25 + dayOffset}T12:00:00Z`
        });
      }
      data = generatedLogs;
    } else if (url.includes('/auth/login') || url.includes('/auth/refresh')) {
      data = { accessToken: 'mock_bearer_token', refreshToken: 'mock_refresh_token', user: { id: 'mock_user', name: 'Internal Auditor', email: 'admin@matrix.io' } };
    } else {
      data = {};
    }

    return {
      data,
      status,
      statusText: status === 201 ? 'Created' : 'OK',
      headers: config.headers as any,
      config
    };
  };
}

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle token refresh or redirects
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the request was for login and it failed with 401, just return the error so the login page can show it
    if (error.response?.status === 401 && originalRequest.url?.includes('/auth/login')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          const response = await axios.post('/api/v1/auth/refresh', { refreshToken });
          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/auth/login';
          return Promise.reject(refreshError);
        }
      } else {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
