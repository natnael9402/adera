const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.aderafoundation.com/api';
let activeApiBase = API;

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('auth_token') || params.get('token');
    if (urlToken && urlToken !== 'undefined' && urlToken !== 'null' && urlToken.trim().length > 10) return urlToken;
  } catch (e) {}

  const local = localStorage.getItem('adera_buyer_token') || localStorage.getItem('token');
  if (local && local !== 'undefined' && local !== 'null' && local.trim().length > 10) return local;

  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/(?:^|;\s*)adera_auth_token=([^;]+)/);
    if (match && match[1]) {
      const decoded = decodeURIComponent(match[1]);
      if (decoded && decoded !== 'undefined' && decoded !== 'null' && decoded.trim().length > 10) return decoded;
    }
  }
  return null;
}

async function request(path: string, options: RequestInit = {}) {
  const buyerToken = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(buyerToken ? { Authorization: `Bearer ${buyerToken}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const controller = new AbortController();
  const timeoutMs = 15000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let res: Response;
    const targetUrl = `${activeApiBase}${path}`;
    
    try {
      res = await fetch(targetUrl, {
        ...options,
        headers,
        signal: options.signal || controller.signal,
      });
    } catch (fetchErr: any) {
      // If external domain fails (CORS blocked, network refused, timeout), fall back to same-origin /api rewrite
      if (
        typeof window !== 'undefined' &&
        activeApiBase.startsWith('http') &&
        !activeApiBase.startsWith(window.location.origin)
      ) {
        const fallbackUrl = `/api${path}`;
        res = await fetch(fallbackUrl, {
          ...options,
          headers,
          signal: options.signal || controller.signal,
        });
        activeApiBase = '/api'; // Switch to reliable same-origin rewrite
      } else {
        throw fetchErr;
      }
    }
    clearTimeout(timeoutId);

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const errorMsg = Array.isArray(data.message) 
        ? data.message.join(', ') 
        : (data.message || (
            res.status === 401 
              ? 'Session expired or invalid credentials.' 
              : res.status === 504 
              ? 'Server gateway timed out. Please check if backend API service is running.' 
              : res.status === 502 
              ? 'API service is currently unavailable or restarting (502 Bad Gateway).' 
              : 'Something went wrong. Please try again.'
          ));
      const err: any = new Error(errorMsg);
      err.status = res.status;
      throw err;
    }
    return data;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Connection timed out. The backend server (api.aderafoundation.com) did not respond within 15 seconds. Please ensure the backend container is running.');
    }
    throw err;
  }
}

export const api = {
  buyer: {
    signup: (body: { name: string; email: string; password: string; phone?: string; role?: string; savedAddress?: any }) =>
      request('/auth/signup', { method: 'POST', body: JSON.stringify({ ...body, role: 'BUYER' }) }),
    verifyCode: (body: { email: string; code: string }) =>
      request('/auth/verify-code', { method: 'POST', body: JSON.stringify(body) }),
    resendVerification: (email: string) =>
      request('/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email }) }),
    login: (body: { email: string; password: string }) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    getProfile: () =>
      request('/auth/profile'),
    updateProfile: (body: any) =>
      request('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),
    getOrders: () =>
      request('/auth/orders'),
  },
  orders: {
    create: (body: any) =>
      request('/orders', { method: 'POST', body: JSON.stringify(body) }),
    track: (identifier: string) =>
      request('/orders/track/' + encodeURIComponent(identifier)),
  },
  products: {
    list: () => request('/products'),
  },
  paymentMethods: {
    list: () => request('/payment-methods'),
  },
  resellers: {
    register: (body: any) =>
      request('/resellers/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body: any) =>
      request('/resellers/login', { method: 'POST', body: JSON.stringify(body) }),
    getProfile: (token: string) =>
      request('/resellers/me', { headers: { Authorization: `Bearer ${token}` } }),
    updateProfile: (token: string, body: any) =>
      request('/resellers/me', { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(body) }),
    upgradeTier: (token: string, tier: string) =>
      request('/resellers/upgrade-tier', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ tier }) }),
    getCatalog: (token: string) =>
      request('/resellers/catalog', { headers: { Authorization: `Bearer ${token}` } }),
    getInventory: (token: string) =>
      request('/resellers/inventory', { headers: { Authorization: `Bearer ${token}` } }),
    importProduct: (token: string, body: { productId: number; customPrice: number }) =>
      request('/resellers/inventory', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(body) }),
    updateInventoryItem: (token: string, id: number, body: { customPrice?: number; isActive?: boolean }) =>
      request(`/resellers/inventory/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(body) }),
    removeInventoryItem: (token: string, id: number) =>
      request(`/resellers/inventory/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
    getPublicShops: () =>
      request('/resellers/public/shops'),
    getPublicShopByHandle: (handle: string) =>
      request(`/resellers/public/shops/${encodeURIComponent(handle)}`),
    getWallet: (token: string) =>
      request('/resellers/wallet', { headers: { Authorization: `Bearer ${token}` } }),
    requestWithdrawal: (token: string, body: { amount: number; currency?: string; walletAddress?: string }) =>
      request('/resellers/wallet/withdraw', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(body) }),
    getOrders: (token: string) =>
      request('/resellers/orders', { headers: { Authorization: `Bearer ${token}` } }),
    getMessages: (token: string) =>
      request('/resellers/messages', { headers: { Authorization: `Bearer ${token}` } }),
    markMessageRead: (token: string, id: number) =>
      request(`/resellers/messages/${id}/read`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }),
    recordVisit: (handle: string) =>
      request(`/resellers/public/visit/${encodeURIComponent(handle)}`, { method: 'POST' }),
    sendMessage: (body: { handle?: string; shopId?: number; sender: string; subject: string; content: string }) =>
      request('/resellers/public/message', { method: 'POST', body: JSON.stringify(body) }),
  },
  upload: {
    proof: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(API + '/upload/proof', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      return data;
    },
    proofBase64: (base64Data: string, filename?: string) =>
      request('/upload/proof-base64', {
        method: 'POST',
        body: JSON.stringify({ base64Data, filename }),
      }),
  },
  notifications: {
    list: (query?: { userEmail?: string; role?: string; unreadOnly?: boolean; limit?: number }) => {
      const qs = query ? '?' + new URLSearchParams(Object.entries(query).filter(([_, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)])).toString() : '';
      return request('/notifications' + qs);
    },
    unreadCount: (query?: { userEmail?: string; role?: string }) => {
      const qs = query ? '?' + new URLSearchParams(Object.entries(query).filter(([_, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)])).toString() : '';
      return request('/notifications/unread-count' + qs);
    },
    markAsRead: (id: number) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllAsRead: (query?: { userEmail?: string; role?: string }) => {
      const qs = query ? '?' + new URLSearchParams(Object.entries(query).filter(([_, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)])).toString() : '';
      return request('/notifications/mark-all-read' + qs, { method: 'POST' });
    },
  },
};
