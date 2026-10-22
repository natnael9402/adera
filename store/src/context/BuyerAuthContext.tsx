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
  signup: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    savedAddress?: {
      address?: string;
      apartment?: string;
      city?: string;
      stateProvince?: string;
      zipCode?: string;
      country?: string;
    };
  }) => Promise<any>;
  verifyCode: (email: string, code: string) => Promise<{ user: BuyerUser; token: string }>;
  resendVerification: (email: string) => Promise<any>;
  logout: () => void;
  updateProfile: (data: any) => Promise<BuyerUser>;
  refreshProfile: () => Promise<void>;
}

const BuyerAuthContext = createContext<BuyerAuthContextType | undefined>(undefined);

function setCrossDomainCookie(token: string) {
  if (typeof document === 'undefined') return;
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const domainAttr = isLocalhost ? '' : '; domain=.aderafoundation.com';
  document.cookie = `adera_auth_token=${encodeURIComponent(token)}; path=/${domainAttr}; max-age=2592000; SameSite=Lax`;
  document.cookie = `adera_auth_token=${encodeURIComponent(token)}; path=/; max-age=2592000; SameSite=Lax`;
}

function clearCrossDomainCookie() {
  if (typeof document === 'undefined') return;
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const domainAttr = isLocalhost ? '' : '; domain=.aderafoundation.com';
  document.cookie = `adera_auth_token=; path=/${domainAttr}; max-age=0; SameSite=Lax`;
  document.cookie = `adera_auth_token=; path=/; max-age=0; SameSite=Lax`;
}

export function BuyerAuthProvider({ children }: { children: React.ReactNode }) {
  const [buyer, setBuyer] = useState<BuyerUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = useCallback(async () => {
    let savedToken: string | null = null;

    // 1. Check URL parameters for seamless single-sign-on handoff
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get('auth_token') || params.get('token');
        if (urlToken) {
          savedToken = urlToken;
          localStorage.setItem('adera_buyer_token', urlToken);
          localStorage.setItem('token', urlToken);
          setCrossDomainCookie(urlToken);

          // Clean URL without reloading page
          params.delete('auth_token');
          params.delete('token');
          const newQuery = params.toString();
          const cleanUrl = window.location.pathname + (newQuery ? `?${newQuery}` : '') + window.location.hash;
          window.history.replaceState({}, '', cleanUrl);
        }
      } catch (e) {
        console.warn('URL token check failed:', e);
      }
    }

    // 2. Check localStorage
    if (!savedToken && typeof window !== 'undefined') {
      savedToken = localStorage.getItem('adera_buyer_token') || localStorage.getItem('token');
    }

    // 3. Check document cookie
    if (!savedToken && typeof document !== 'undefined') {
      const match = document.cookie.match(/(?:^|;\s*)adera_auth_token=([^;]+)/);
      if (match && match[1]) {
        savedToken = decodeURIComponent(match[1]);
        localStorage.setItem('adera_buyer_token', savedToken);
        localStorage.setItem('token', savedToken);
      }
    }

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
      localStorage.removeItem('token');
      clearCrossDomainCookie();
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
        localStorage.setItem('token', res.token);
        setCrossDomainCookie(res.token);
        setToken(res.token);
        setBuyer(res.user);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    savedAddress?: {
      address?: string;
      apartment?: string;
      city?: string;
      stateProvince?: string;
      zipCode?: string;
      country?: string;
    };
  }) => {
    setIsLoading(true);
    try {
      const res = await api.buyer.signup(data);
      if (res?.token) {
        localStorage.setItem('adera_buyer_token', res.token);
        localStorage.setItem('token', res.token);
        setCrossDomainCookie(res.token);
        setToken(res.token);
        setBuyer(res.user);
      }
      return res;
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
        localStorage.setItem('token', res.token);
        setCrossDomainCookie(res.token);
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
    localStorage.removeItem('token');
    clearCrossDomainCookie();
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
