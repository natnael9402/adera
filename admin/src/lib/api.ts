const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

async function request(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const res = await fetch(API + path, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

export const api = {
  auth: {
    login: (body: { email: string; password: string }) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    me: () => request('/auth/me'),
  },
  admin: {
    stats: () => request('/admin/stats'),
    posts: {
      list: () => request('/posts/all'),
      get: (id: number) => request('/posts/' + id),
      create: (body: any) =>
        request('/posts', { method: 'POST', body: JSON.stringify(body) }),
      updateStatus: (id: number, status: string) =>
        request('/posts/' + id + '/status', { method: 'PATCH', body: JSON.stringify({ status }) }),
      update: (id: number, body: any) =>
        request('/posts/' + id, { method: 'PATCH', body: JSON.stringify(body) }),
      generateDescription: (body: {
        title: string;
        category?: string;
        beneficiary?: string;
        goal?: number;
        location?: string;
        urgency?: string;
        tone?: string;
        additionalDetails?: string;
      }) =>
        request('/posts/generate-description', { method: 'POST', body: JSON.stringify(body) }),
      addUpdate: (id: number, body: { title: string; content: string; image?: string }) =>
        request('/posts/' + id + '/updates', { method: 'POST', body: JSON.stringify(body) }),
    },
    users: {
      list: () => request('/admin/users'),
    },
    donors: {
      list: () => request('/donors'),
      create: (body: any) => request('/donors', { method: 'POST', body: JSON.stringify(body) }),
      update: (id: number, body: any) => request('/donors/' + id, { method: 'PUT', body: JSON.stringify(body) }),
      remove: (id: number) => request('/donors/' + id, { method: 'DELETE' }),
    },
  },
  products: {
    list: () => request('/products'),
    create: (body: any) =>
      request('/products', { method: 'POST', body: JSON.stringify(body) }),
    remove: (id: number) =>
      request('/products/' + id, { method: 'DELETE' }),
  },
  paymentMethods: {
    list: () => request('/payment-methods'),
    create: (body: any) =>
      request('/payment-methods', { method: 'POST', body: JSON.stringify(body) }),
    remove: (id: number) =>
      request('/payment-methods/' + id, { method: 'DELETE' }),
  },
};
