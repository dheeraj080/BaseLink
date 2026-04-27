'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserDTO, TokenResponse } from '@/types/api';
import { authService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: UserDTO | null;
  loading: boolean;
  login: (response: TokenResponse) => void;
  logout: () => Promise<void>;
  updateUser: (user: UserDTO) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (response: TokenResponse) => {
    if (response.accessToken && response.user) {
      localStorage.setItem('accessToken', response.accessToken);
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      setUser(null);
      router.push('/auth/login');
    }
  };

  const updateUser = (updatedUser: UserDTO) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
