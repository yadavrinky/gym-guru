"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/utils/api';

interface UserProfile {
  age?: number;
  weight_kg?: number;
  height_cm?: number;
  fitness_goal?: string;
  experience_level?: string;
  workouts_per_week?: number;
}

interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  profile?: UserProfile;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async (authToken: string) => {
    try {
      const baseUrl = API_ENDPOINTS.AUTH.LOGIN.replace('/api/auth/login', '');
      const res = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser({
          id: data.id,
          email: data.email,
          name: data.name,
          avatar_url: data.avatar_url,
          profile: data.profile,
        });
      } else {
        // Token expired or invalid
        localStorage.removeItem('gym_guru_token');
        setToken(null);
        setUser(null);
      }
    } catch {
      console.error('Failed to fetch user profile');
    }
  };

  const refreshUser = async () => {
    const storedToken = localStorage.getItem('gym_guru_token');
    if (storedToken) {
      await fetchUserProfile(storedToken);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('gym_guru_token');
    if (storedToken) {
      setToken(storedToken);
      fetchUserProfile(storedToken).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem('gym_guru_token', newToken);
    setToken(newToken);
    fetchUserProfile(newToken);
  };

  const logout = () => {
    localStorage.removeItem('gym_guru_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
