const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.aderafoundation.com/api';

async function request(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
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
      list: (query?: { type?: string; search?: string; limit?: number }) => {
        const qs = query ? '?' + new URLSearchParams(Object.entries(query).filter(([_, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)])).toString() : '';
        return request('/admin/users' + qs);
      },
    },
    customers: {
      list: (query?: { search?: string; limit?: number; offset?: number }) => {
        const qs = query ? '?' + new URLSearchParams(Object.entries(query).filter(([_, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)])).toString() : '';
        return request('/admin/customers' + qs);
      },
      get: (id: number) => request(`/admin/customers/${id}`),
    },
    orders: {
      list: (query?: { status?: string; search?: string; limit?: number; offset?: number }) => {
        const qs = query ? '?' + new URLSearchParams(Object.entries(query).filter(([_, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)])).toString() : '';
        return request('/admin/orders' + qs);
      },
      get: (id: number) => request(`/admin/orders/${id}`),
      updateStatus: (id: number, body: { status: string; trackingNumber?: string; carrier?: string; estimatedDelivery?: string }) =>
        request(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(body) }),
      resendEmail: (id: number) =>
        request(`/admin/orders/${id}/resend-email`, { method: 'POST' }),
    },
    activities: {
      list: (query?: { type?: string; status?: string; search?: string; limit?: number; offset?: number }) => {
        const qs = query ? '?' + new URLSearchParams(Object.entries(query).filter(([_, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)])).toString() : '';
        return request('/admin/activities' + qs);
      },
      recent: (limit = 10) => request(`/admin/activities/recent?limit=${limit}`),
    },
    emails: {
      list: (query?: { template?: string; status?: string; search?: string; limit?: number; offset?: number }) => {
        const qs = query ? '?' + new URLSearchParams(Object.entries(query).filter(([_, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)])).toString() : '';
        return request('/admin/emails' + qs);
      },
      get: (id: number) => request(`/admin/emails/${id}`),
      resend: (id: number) => request(`/admin/emails/${id}/resend`, { method: 'POST' }),
      sendDirect: (body: {
        recipient: string;
        recipientName?: string;
        subject: string;
        message: string;
        category?: string;
      }) => request('/admin/emails/send', { method: 'POST', body: JSON.stringify(body) }),
    },
    donors: {
      list: () => request('/donors'),
      create: (body: any) => request('/donors', { method: 'POST', body: JSON.stringify(body) }),
      update: (id: number, body: any) => request('/donors/' + id, { method: 'PUT', body: JSON.stringify(body) }),
      remove: (id: number) => request('/donors/' + id, { method: 'DELETE' }),
    },
    donations: {
      listAll: () => request('/posts/donations/all'),
      updateStatus: (id: number, status: string, rejectionReason?: string) =>
        request(`/posts/donations/${id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status, rejectionReason }),
        }),
    },
    notifications: {
      list: (query?: { userEmail?: string; role?: string; unreadOnly?: boolean; limit?: number }) => {
        const qs = query ? '?' + new URLSearchParams(Object.entries(query).filter(([_, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)])).toString() : '';
        return request('/notifications' + qs);
      },
      broadcast: (body: {
        title: string;
        message: string;
        type?: string;
        link?: string;
        targetAudience?: 'ALL' | 'DONORS' | 'BUYERS' | 'ADMIN';
        specificEmail?: string;
      }) => request('/notifications/admin/broadcast', { method: 'POST', body: JSON.stringify(body) }),
      getUnreadCount: () => request('/notifications/unread-count?role=ADMIN'),
      markAsRead: (id: number) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
      markAllAsRead: () => request('/notifications/mark-all-read', { method: 'POST' }),
    },
  },
  products: {
    list: (query?: Record<string, any>) => {
      const qs = query ? '?' + new URLSearchParams(Object.entries(query).filter(([_, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)])).toString() : '';
      return request('/products' + qs);
    },
    get: (id: number) => request('/products/' + id),
    create: (body: any) =>
      request('/products', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: number, body: any) =>
      request('/products/' + id, { method: 'PATCH', body: JSON.stringify(body) }),
    remove: (id: number) =>
      request('/products/' + id, { method: 'DELETE' }),
    seed1000: () =>
      request('/products/seed-1000', { method: 'POST' }),
  },
  paymentMethods: {
    list: () => request('/payment-methods'),
    create: (body: any) =>
      request('/payment-methods', { method: 'POST', body: JSON.stringify(body) }),
    remove: (id: number) =>
      request('/payment-methods/' + id, { method: 'DELETE' }),
  },
};
