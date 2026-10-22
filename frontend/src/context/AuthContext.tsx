'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  verified?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, name: string, password: string) => Promise<any>;
  setAuthSession: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let t: string | null = null;

    // 1. Check URL parameters
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get('auth_token') || params.get('token');
        if (urlToken) {
          t = urlToken;
          localStorage.setItem('token', urlToken);
          localStorage.setItem('adera_buyer_token', urlToken);
          setCrossDomainCookie(urlToken);

          params.delete('auth_token');
          params.delete('token');
          const newQuery = params.toString();
          const cleanUrl = window.location.pathname + (newQuery ? `?${newQuery}` : '') + window.location.hash;
          window.history.replaceState({}, '', cleanUrl);
        }
      } catch (e) {}
    }

    // 2. Check localStorage
    if (!t && typeof window !== 'undefined') {
      t = localStorage.getItem('token') || localStorage.getItem('adera_buyer_token');
    }

    // 3. Check cookie
    if (!t && typeof document !== 'undefined') {
      const match = document.cookie.match(/(?:^|;\s*)adera_auth_token=([^;]+)/);
      if (match && match[1]) {
        t = decodeURIComponent(match[1]);
        localStorage.setItem('token', t);
        localStorage.setItem('adera_buyer_token', t);
      }
    }

    const u = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (u) {
      try {
        setUser(JSON.parse(u));
      } catch (e) {}
    }

    if (t) {
      setToken(t);
      api.auth.me()
        .then((freshUser) => {
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('adera_buyer_token');
          localStorage.removeItem('user');
          clearCrossDomainCookie();
          setUser(null);
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    localStorage.setItem('token', res.token);
    localStorage.setItem('adera_buyer_token', res.token);
    setCrossDomainCookie(res.token);
    if (res.user) {
      localStorage.setItem('user', JSON.stringify(res.user));
      setUser(res.user);
    }
    setToken(res.token);
  };

  const signup = async (email: string, name: string, password: string) => {
    return api.auth.signup({ email, name, password });
  };

  const setAuthSession = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('adera_buyer_token', newToken);
    setCrossDomainCookie(newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adera_buyer_token');
    localStorage.removeItem('user');
    clearCrossDomainCookie();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, setAuthSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
