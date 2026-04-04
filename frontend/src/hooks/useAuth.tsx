import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SUPER_ADMIN' | 'HR_MANAGER' | 'PROJECT_MANAGER' | 'EMPLOYEE';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        const res = await api.get('/auth/me');
        return res.data;
      } catch (err) {
        return null; // not authenticated
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const login = async (credentials: any) => {
    await api.post('/auth/login', credentials);
    await refetch();
  };

  const logout = async () => {
    await api.post('/auth/logout');
    await refetch();
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user: data || null, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
