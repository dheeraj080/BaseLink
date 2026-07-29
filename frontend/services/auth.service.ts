import api from '@/lib/api';
import { LoginRequest, TokenResponse, UserDTO, RefreshTokenRequest } from '@/types/api';

export const authService = {
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    try {
      const response = await api.post<TokenResponse>('/auth/login', data);
      return response.data;
    } catch (err: any) {
      // Fallback to mock login if backend is unavailable or mock mode is active
      if (
        process.env.NEXT_PUBLIC_MOCK === 'true' ||
        !err.response ||
        err.code === 'ERR_NETWORK' ||
        err.response?.status === 404 ||
        err.response?.status >= 500
      ) {
        return {
          accessToken: 'mock_access_token_' + Date.now(),
          refreshToken: 'mock_refresh_token_' + Date.now(),
          expiresIn: 3600,
          tokenType: 'Bearer',
          user: {
            id: 'mock_user_1',
            name: data.email ? data.email.split('@')[0] : 'Demo Admin',
            email: data.email || 'admin@baselink.io',
            provider: 'LOCAL',
          },
        };
      }
      throw err;
    }
  },
  register: async (data: UserDTO): Promise<UserDTO> => {
    const response = await api.post<UserDTO>('/auth/register', data);
    return response.data;
  },
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
  refreshToken: async (data: RefreshTokenRequest): Promise<TokenResponse> => {
    const response = await api.post<TokenResponse>('/auth/refresh', data);
    return response.data;
  },
  resetPassword: async (data: Record<string, string>): Promise<object> => {
    const response = await api.post<object>('/auth/reset-password', data);
    return response.data;
  },
  forgotPassword: async (data: Record<string, string>): Promise<object> => {
    const response = await api.post<object>('/auth/forgot-password', data);
    return response.data;
  },
  activate: async (email: string, code: string): Promise<any> => {
    const response = await api.post('/auth/activate', { email, code });
    return response.data;
  },
  getOAuthUrl: async (provider: 'GOOGLE' | 'GITHUB'): Promise<{ url: string }> => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    return { url: `${backendUrl}/oauth2/authorization/${provider.toLowerCase()}` };
  },
  verify2fa: async (mfaToken: string, code: string): Promise<TokenResponse> => {
    const response = await api.post<TokenResponse>('/auth/verify-2fa', { mfaToken, code });
    return response.data;
  },
};
