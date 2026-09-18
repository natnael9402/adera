const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.aderafoundation.com/api';

async function request(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const res = await fetch(API + path, { ...options, headers });
  const data = await res.json();
  if (!res.ok) {
    const errorMsg = Array.isArray(data.message) ? data.message.join(', ') : (data.message || 'Something went wrong');
    throw new Error(errorMsg);
  }
  return data;
}

export const api = {
  auth: {
    signup: (body: { email: string; name: string; password: string }) =>
      request('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
    verifyCode: (body: { email: string; code: string }) =>
      request('/auth/verify-code', { method: 'POST', body: JSON.stringify(body) }),
    login: (body: { email: string; password: string }) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    resendVerification: (email: string) =>
      request('/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email }) }),
    me: () => request('/auth/me'),
  },
  mail: {
    subscribeNewsletter: (email: string) =>
      request('/mail/subscribe', { method: 'POST', body: JSON.stringify({ email }) }),
    sendContactMessage: (body: { name: string; email: string; topic: string; message: string }) =>
      request('/mail/contact', { method: 'POST', body: JSON.stringify(body) }),
    checkSmtpStatus: () => request('/mail/smtp-status'),
  },
  posts: {
    list: () => request('/posts'),
    get: (id: number) => request('/posts/' + id),
    create: (body: any) =>
      request('/posts', { method: 'POST', body: JSON.stringify(body) }),
    activate: (id: number, body: { txHash?: string; paymentProofImage?: string; depositAmount?: number; cryptoSymbol?: string }) =>
      request('/posts/' + id + '/activate', { method: 'POST', body: JSON.stringify(body) }),
    donate: (id: number, body: { donorName?: string; donorEmail?: string; amountUsd: number; cryptoAmount: string; cryptoSymbol: string; txHash: string; message?: string; isAnonymous?: boolean; paymentProof?: string }) =>
      request('/posts/' + id + '/donate', { method: 'POST', body: JSON.stringify(body) }),
    getDonations: (id: number) => request('/posts/' + id + '/donations'),
    addUpdate: (id: number, body: { title: string; content: string; image?: string }) =>
      request('/posts/' + id + '/updates', { method: 'POST', body: JSON.stringify(body) }),
    myCampaigns: () => request('/posts/my/campaigns'),
    myDonations: () => request('/posts/my/donations'),
  },
  paymentMethods: {
    list: () => request('/payment-methods'),
  },
  products: {
    list: () => request('/products'),
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
