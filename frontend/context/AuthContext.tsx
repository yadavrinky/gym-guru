"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface UserInfo {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  profile: Record<string, any>;
}

interface AuthContextType {
  token: string | null;
  user: UserInfo | null;
  login: (token: string, redirectTo?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const router = useRouter();

  const fetchUser = useCallback(async (t: string) => {
    try {
      const res = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${t}` },
      });
      setUser(res.data);
    } catch {
      // Token invalid — clear
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      fetchUser(savedToken);
    }
  }, [fetchUser]);

  const login = (newToken: string, redirectTo?: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    fetchUser(newToken);
    router.push(redirectTo || "/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  const refreshUser = async () => {
    if (token) await fetchUser(token);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
