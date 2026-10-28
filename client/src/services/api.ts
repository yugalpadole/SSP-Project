/**
 * Centralized TypeScript API Client Service
 * Provides typed HTTP requests, automatic header injection, and centralized error handling.
 */

import { User, Shop, Product, Category, Order, CustomerAddress } from '../types';

class ApiError extends Error {
  status: number;
  data?: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

function getAuthHeader(): Record<string, string> {
  try {
    const rawUser = localStorage.getItem('ebazaar_user');
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      if (parsed?.id) {
        return { 'x-user-id': String(parsed.id) };
      }
    }
  } catch {
    // Ignore JSON parse errors
  }
  return {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(res.status, data?.error || `Request failed with status ${res.status}`, data);
  }

  return data as T;
}

export const api = {
  get: <T>(url: string, options?: RequestInit) => request<T>(url, { method: 'GET', ...options }),
  post: <T>(url: string, body?: any, options?: RequestInit) =>
    request<T>(url, { method: 'POST', body: body ? JSON.stringify(body) : undefined, ...options }),
  put: <T>(url: string, body?: any, options?: RequestInit) =>
    request<T>(url, { method: 'PUT', body: body ? JSON.stringify(body) : undefined, ...options }),
  delete: <T>(url: string, options?: RequestInit) => request<T>(url, { method: 'DELETE', ...options }),
};

// ==========================================
// AUTH API
// ==========================================
export const authApi = {
  login: (credentials: { email: string; password: string; expectedRole?: string }) =>
    api.post<{ user: User; shop?: Shop }>('/api/auth/login', credentials),

  register: (payload: {
    name: string;
    email: string;
    password: string;
    role: 'customer' | 'shopkeeper';
    phone?: string;
    shopName?: string;
    shopCategory?: string;
    locality?: string;
    address?: string;
    whatsappNumber?: string;
  }) => api.post<{ user: User; shop?: Shop }>('/api/auth/register', payload),

  getMe: (userId: number) => api.get<{ user: User; shop?: Shop }>(`/api/auth/me?userId=${userId}`),

  recoverPassword: (email: string) =>
    api.post<{ message: string }>('/api/auth/recover', { email }),

  updateProfile: (profile: Partial<User>) =>
    api.put<{ user: User }>('/api/auth/profile', profile),
};

// ==========================================
// CATEGORIES API
// ==========================================
export const categoryApi = {
  getAll: () => api.get<Category[]>('/api/categories'),
  getBySlug: (slug: string) =>
    api.get<{ category: Category; products: Product[] }>(`/api/categories/${slug}`),
};

// ==========================================
// PRODUCTS API
// ==========================================
export const productApi = {
  getAll: (params?: { locality?: string; category?: string; search?: string; shopId?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.locality) searchParams.set('locality', params.locality);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.shopId) searchParams.set('shopId', String(params.shopId));
    const qs = searchParams.toString();
    return api.get<Product[]>(`/api/products${qs ? `?${qs}` : ''}`);
  },

  getById: (id: number | string) =>
    api.get<{ product: Product; relatedProducts: Product[] }>(`/api/products/${id}`),

  create: (product: Partial<Product>) => api.post<Product>('/api/shopkeeper/products', product),

  update: (id: number, product: Partial<Product>) =>
    api.put<Product>(`/api/shopkeeper/products/${id}`, product),

  delete: (id: number) => api.delete<{ success: boolean }>(`/api/shopkeeper/products/${id}`),
};

// ==========================================
// SHOPS API
// ==========================================
export const shopApi = {
  getAll: (params?: { locality?: string; category?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.locality) searchParams.set('locality', params.locality);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    const qs = searchParams.toString();
    return api.get<Shop[]>(`/api/shops${qs ? `?${qs}` : ''}`);
  },

  getById: (id: number | string) =>
    api.get<{ shop: Shop; products: Product[]; reviews: any[] }>(`/api/shops/${id}`),

  getDashboard: (shopId: number) =>
    api.get<any>(`/api/shopkeeper/dashboard?shopId=${shopId}`),

  getSales: (shopId: number) =>
    api.get<any>(`/api/shopkeeper/sales?shopId=${shopId}`),

  getProfile: () => api.get<{ shop: Shop }>('/api/shopkeeper/profile'),

  updateProfile: (profile: Partial<Shop>) =>
    api.put<{ shop: Shop }>('/api/shopkeeper/profile', profile),

  getDeliverySettings: (shopId: number) =>
    api.get<any>(`/api/shopkeeper/delivery-settings?shopId=${shopId}`),

  updateDeliverySettings: (settings: any) =>
    api.put<any>('/api/shopkeeper/delivery-settings', settings),

  getReservationSettings: (shopId: number) =>
    api.get<any>(`/api/shopkeeper/reservation-settings?shopId=${shopId}`),

  updateReservationSettings: (settings: any) =>
    api.put<any>('/api/shopkeeper/reservation-settings', settings),
};

// ==========================================
// ORDERS API
// ==========================================
export const orderApi = {
  create: (payload: {
    shopId: number;
    orderType: 'delivery' | 'reserve_collect';
    items: { productId: number; quantity: number }[];
    deliveryAddress?: string;
    contactPhone: string;
    notes?: string;
  }) => api.post<{ order: Order }>('/api/orders', payload),

  getCustomerOrders: (customerId: number) =>
    api.get<Order[]>(`/api/orders/customer?customerId=${customerId}`),

  getShopOrders: (shopId: number, status?: string) => {
    const url = `/api/shopkeeper/orders?shopId=${shopId}${status ? `&status=${status}` : ''}`;
    return api.get<Order[]>(url);
  },

  updateStatus: (orderId: number, status: string) =>
    api.put<Order>(`/api/shopkeeper/orders/${orderId}/status`, { status }),

  cancel: (orderId: number) => api.post<Order>(`/api/orders/${orderId}/cancel`),
};

// ==========================================
// CART & USER ADDRESSES API
// ==========================================
export const userApi = {
  getAddresses: () => api.get<CustomerAddress[]>('/api/users/addresses'),
  addAddress: (address: Partial<CustomerAddress>) =>
    api.post<CustomerAddress>('/api/users/addresses', address),
  deleteAddress: (id: number) => api.delete<{ success: boolean }>(`/api/users/addresses/${id}`),
};

export const reviewApi = {
  create: (review: { shopId: number; rating: number; comment?: string }) =>
    api.post('/api/reviews', review),
};
