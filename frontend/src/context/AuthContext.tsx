import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role?: 'BUYER' | 'SELLER') => Promise<User>;
  signup: (data: any) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.auth.me();
      if (res && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
      localStorage.removeItem('ecoloop_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string, role?: 'BUYER' | 'SELLER'): Promise<User> => {
    setLoading(true);
    try {
      const res = await api.auth.login({ email, password, role });
      if (res.token) {
        localStorage.setItem('ecoloop_token', res.token);
      }
      setUser(res.user);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (formData: any): Promise<User> => {
    setLoading(true);
    try {
      const res = await api.auth.signup(formData);
      if (res.token) {
        localStorage.setItem('ecoloop_token', res.token);
      }
      setUser(res.user);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Ignore error on logout
    } finally {
      localStorage.removeItem('ecoloop_token');
      localStorage.removeItem('ecoloop_mock_user');
      localStorage.removeItem('ecoloop_user_role');
      setUser(null);
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
