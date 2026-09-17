'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export interface BuyerUser {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  avatar?: string;
  savedAddress?: {
    address?: string;
    apartment?: string;
    city?: string;
    stateProvince?: string;
    zipCode?: string;
    country?: string;
  };
  verified?: boolean;
}

interface BuyerAuthContextType {
  buyer: BuyerUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ user: BuyerUser; token: string }>;
  signup: (data: { name: string; email: string; password: string; phone?: string }) => Promise<any>;
  verifyCode: (email: string, code: string) => Promise<{ user: BuyerUser; token: string }>;
  resendVerification: (email: string) => Promise<any>;
  logout: () => void;
  updateProfile: (data: any) => Promise<BuyerUser>;
  refreshProfile: () => Promise<void>;
}

const BuyerAuthContext = createContext<BuyerAuthContextType | undefined>(undefined);

export function BuyerAuthProvider({ children }: { children: React.ReactNode }) {
  const [buyer, setBuyer] = useState<BuyerUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = useCallback(async () => {
    const savedToken = typeof window !== 'undefined' ? localStorage.getItem('adera_buyer_token') : null;
    if (!savedToken) {
      setBuyer(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      setToken(savedToken);
      const user = await api.buyer.getProfile();
      setBuyer(user);
    } catch (err) {
      console.warn('Failed to load buyer session:', err);
      localStorage.removeItem('adera_buyer_token');
      setBuyer(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.buyer.login({ email, password: pass });
      if (res.token) {
        localStorage.setItem('adera_buyer_token', res.token);
        setToken(res.token);
        setBuyer(res.user);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: { name: string; email: string; password: string; phone?: string }) => {
    setIsLoading(true);
    try {
      return await api.buyer.signup(data);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async (email: string, code: string) => {
    setIsLoading(true);
    try {
      const res = await api.buyer.verifyCode({ email, code });
      if (res.token) {
        localStorage.setItem('adera_buyer_token', res.token);
        setToken(res.token);
        setBuyer(res.user);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async (email: string) => {
    return await api.buyer.resendVerification(email);
  };

  const logout = () => {
    localStorage.removeItem('adera_buyer_token');
    setToken(null);
    setBuyer(null);
  };

  const updateProfile = async (data: any) => {
    const updated = await api.buyer.updateProfile(data);
    setBuyer(updated);
    return updated;
  };

  return (
    <BuyerAuthContext.Provider
      value={{
        buyer,
        token,
        isLoading,
        login,
        signup,
        verifyCode,
        resendVerification,
        logout,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </BuyerAuthContext.Provider>
  );
}

export function useBuyerAuth() {
  const context = useContext(BuyerAuthContext);
  if (!context) {
    throw new Error('useBuyerAuth must be used within a BuyerAuthProvider');
  }
  return context;
}
