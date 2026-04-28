import api from '@/lib/api';
import { LoginRequest, TokenResponse, UserDTO, RefreshTokenRequest } from '@/types/api';

export const authService = {
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const response = await api.post<TokenResponse>('/auth/login', data);
    return response.data;
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
  activate: async (code: string): Promise<string> => {
    const response = await api.get<string>(`/auth/activate?code=${code}`);
    return response.data;
  },
  getOAuthUrl: async (provider: 'GOOGLE' | 'GITHUB'): Promise<{ url: string }> => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    return { url: `${backendUrl}/oauth2/authorization/${provider.toLowerCase()}` };
  },
};
