const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

async function request(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(API + path, { ...options, headers });
  const data = await res.json();
  if (!res.ok) {
    const errorMsg = Array.isArray(data.message) ? data.message.join(', ') : (data.message || 'Something went wrong');
    throw new Error(errorMsg);
  }
  return data;
}

export const api = {
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
};


