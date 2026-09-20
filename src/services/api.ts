import axios from 'axios';

const isVercelOrRemoteFrontend =
  typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1' &&
  !window.location.hostname.includes('unreadymades.com');

export const API_BASE_URL =
  import.meta.env.API_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  (isVercelOrRemoteFrontend
    ? '/api'
    : 'https://unreadymades.com/Premier-Rentals/grocery-pos-backend/api');

export const FILE_BASE_URL = 'https://unreadymades.com/Premier-Rentals/grocery-pos-backend';


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('Making API request to:', config.baseURL + config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API response received:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API error:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Products API
export const productsApi = {
  getAll: () => api.get('/products.php'),

create: (product: any) => {
  const payload = {
    ...product,
    price: product.price ?? product.unit_price, // 🔥 FIX
  };

  console.log('Creating product with data:', payload);
  return api.post('/products.php', payload);
},

  update: (product: any) => {
    console.log('Updating product with data:', product);
    return api.put('/products.php', product); 
  
  },
  delete: (id: string) => api.delete(`/products.php?id=${id}`),
};

// Categories API
export const categoriesApi = {
  getAll: () => api.get('/categories.php'),
  create: (category: any) => api.post('/categories.php', category),
  update: (category: any) => api.put('/categories.php', category),
  delete: (id: string) => api.delete(`/categories.php?id=${id}`),
};

// SubCategories API
export const subCategoriesApi = {
  getAll: () => api.get('/subcategories.php'),
  create: (subcategory: any) => api.post('/subcategories.php', subcategory),
  update: (subcategory: any) => api.put('/subcategories.php', subcategory),
  delete: (id: string) => api.delete(`/subcategories.php?id=${id}`),
};

// Vendors API
export const vendorsApi = {
  getAll: () => api.get('/vendors.php'),
  create: (vendor: any) => api.post('/vendors.php', vendor),
 update: (vendor: any) => {
  const payload = {
    ...vendor,
    id: vendor.id, // 🔥 force include
  };

  console.log("FINAL UPDATE PAYLOAD:", payload);
  return api.put('/vendors.php', payload);
},
  delete: (id: string) => api.delete(`/vendors.php?id=${id}`),
};
export const customersApi = {
  getAll: async () => {
    const res = await fetch(`${API_BASE_URL}/customers.php`);
    return res.json();
  },

  create: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/customers.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    return res.json();
  },

  update: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE_URL}/customers.php?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    return res.json();
  },

  delete: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/customers.php?id=${id}`, {
      method: 'DELETE',
    });

    return res.json();
  },
};

// Transactions API
export const transactionsApi = {
  getAll: () => api.get('/transactions.php'),
  create: (transaction: any) => api.post('/transactions.php', transaction),
};

// Stock Movements API
export const stockMovementsApi = {
  getAll: (params?: any) => api.get('/stock-movements.php', { params }),
  create: (movement: any) => api.post('/stock-movements.php', movement),
};

// Dashboard API
export const dashboardApi = {
  getStats: () => api.get('/dashboard.php'),
};

// Auth API
export const authApi = {
  login: (credentials: any) => api.post('/auth.php?action=login', credentials),
  register: (userData: any) => api.post('/auth.php?action=register', userData),
};

// Users API
export const usersApi = {
  getAll: () => api.get('/users.php'),
  create: (user: any) => api.post('/users.php', user),
  update: (user: any) => api.put('/users.php', user),
  delete: (id: string) => api.delete(`/users.php?id=${id}`),
};

// Settings API
export const settingsApi = {
  getStoreSettings: () => api.get('/settings.php?type=store'),
  updateStoreSettings: (settings: any) => api.post('/settings.php', { type: 'store', ...settings }),
  getTaxSettings: () => api.get('/settings.php?type=tax'),
  updateTaxSettings: (settings: any) => api.post('/settings.php', { type: 'tax', ...settings }),
  getPrintSettings: () => api.get('/settings.php?type=print'),
  updatePrintSettings: (settings: any) => api.post('/settings.php', { type: 'print', ...settings }),
  getSystemSettings: () => api.get('/settings.php?type=system'),
  updateSystemSettings: (settings: any) => api.post('/settings.php', { type: 'system', ...settings }),
  getSecuritySettings: () => api.get('/settings.php?type=security'),
  updateSecuritySettings: (settings: any) => api.post('/settings.php', { type: 'security', ...settings }),
  getRentalSettings: () =>
  axios.get(`${API_BASE_URL}/settings.php?type=rental`),

updateRentalSettings: (data) =>
  axios.post(`${API_BASE_URL}/settings.php`, {
    type: "rental",
    late_fee_per_day: data.lateFee
  }),
};

// Export API
export const exportApi = {
  exportProducts: () => api.get('/export.php?type=products', { responseType: 'blob' }),
  exportCategories: () => api.get('/export.php?type=categories', { responseType: 'blob' }),
  exportVendors: () => api.get('/export.php?type=vendors', { responseType: 'blob' }),
  exportTransactions: () => api.get('/export.php?type=transactions', { responseType: 'blob' }),
  exportStockMovements: () => api.get('/export.php?type=stock-movements', { responseType: 'blob' }),
};
