// import axios from 'axios';

// const API_BASE_URL = 'http://localhost/grocery-pos-backend/api';

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Add request interceptor for debugging
// api.interceptors.request.use(
//   (config) => {
//     console.log('Making API request to:', config.baseURL + config.url);
//     return config;
//   },
//   (error) => {
//     console.error('Request error:', error);
//     return Promise.reject(error);
//   }
// );

// // Add response interceptor for debugging
// api.interceptors.response.use(
//   (response) => {
//     console.log('API response received:', response.status, response.data);
//     return response;
//   },
//   (error) => {
//     console.error('API error:', error.response?.status, error.response?.data || error.message);
//     return Promise.reject(error);
//   }
// );

// // Products API
// export const productsApi = {
//   getAll: () => api.get('/products.php'),
//   create: (product: any) => {
//     console.log('Creating product with data:', product);
//     return api.post('/products.php', {
//       name: product.name,
//       barcode: product.barcode,
//       price: parseFloat(product.price || product.unitPrice),
//       stock: parseInt(product.stock || 0),
//       category: product.category,
//       vendor: product.vendor,
//       unit: product.unit || 'piece',
//       description: product.description || ''
//     });
//   },
//   update: (product: any) => {
//     console.log('Updating product with data:', product);
//     return api.put('/products.php', {
//       id: product.id,
//       name: product.name,
//       barcode: product.barcode,
//       price: parseFloat(product.price || product.unitPrice),
//       stock: parseInt(product.stock || 0),
//       category: product.category,
//       vendor: product.vendor,
//       unit: product.unit || 'piece',
//       description: product.description || ''
//     });
//   },
//   delete: (id: string) => api.delete(`/products.php?id=${id}`),
// };

// // Categories API
// export const categoriesApi = {
//   getAll: () => api.get('/categories.php'),
//   create: (category: any) => api.post('/categories.php', category),
//   update: (category: any) => api.put('/categories.php', category),
//   delete: (id: string) => api.delete(`/categories.php?id=${id}`),
// };

// // SubCategories API
// export const subCategoriesApi = {
//   getAll: () => api.get('/subcategories.php'),
//   create: (subcategory: any) => api.post('/subcategories.php', subcategory),
//   update: (subcategory: any) => api.put('/subcategories.php', subcategory),
//   delete: (id: string) => api.delete(`/subcategories.php?id=${id}`),
// };

// // Vendors API
// export const vendorsApi = {
//   getAll: () => api.get('/vendors.php'),
//   create: (vendor: any) => api.post('/vendors.php', vendor),
//   update: (vendor: any) => api.put('/vendors.php', vendor),
//   delete: (id: string) => api.delete(`/vendors.php?id=${id}`),
// };

// // Transactions API
// export const transactionsApi = {
//   getAll: () => api.get('/transactions.php'),
//   create: (transaction: any) => api.post('/transactions.php', transaction),
// };

// // Stock Movements API
// export const stockMovementsApi = {
//   getAll: (params?: any) => api.get('/stock-movements.php', { params }),
//   create: (movement: any) => api.post('/stock-movements.php', movement),
// };

// // Dashboard API
// export const dashboardApi = {
//   getStats: () => api.get('/dashboard.php'),
// };

// // Auth API
// export const authApi = {
//   login: (credentials: any) => api.post('/auth.php?action=login', credentials),
//   register: (userData: any) => api.post('/auth.php?action=register', userData),
// };

// // Settings API
// export const settingsApi = {
//   getStoreSettings: () => api.get('/settings.php?type=store'),
//   updateStoreSettings: (settings: any) => api.post('/settings.php', { type: 'store', ...settings }),
//   getTaxSettings: () => api.get('/settings.php?type=tax'),
//   updateTaxSettings: (settings: any) => api.post('/settings.php', { type: 'tax', ...settings }),
//   getPrintSettings: () => api.get('/settings.php?type=print'),
//   updatePrintSettings: (settings: any) => api.post('/settings.php', { type: 'print', ...settings }),
//   getSystemSettings: () => api.get('/settings.php?type=system'),
//   updateSystemSettings: (settings: any) => api.post('/settings.php', { type: 'system', ...settings }),
//   getSecuritySettings: () => api.get('/settings.php?type=security'),
//   updateSecuritySettings: (settings: any) => api.post('/settings.php', { type: 'security', ...settings }),
// };

// // Export API
// export const exportApi = {
//   exportProducts: () => api.get('/export.php?type=products', { responseType: 'blob' }),
//   exportCategories: () => api.get('/export.php?type=categories', { responseType: 'blob' }),
//   exportVendors: () => api.get('/export.php?type=vendors', { responseType: 'blob' }),
//   exportTransactions: () => api.get('/export.php?type=transactions', { responseType: 'blob' }),
//   exportStockMovements: () => api.get('/export.php?type=stock-movements', { responseType: 'blob' }),
// };

import axios from 'axios';

const API_BASE_URL = 'http://localhost/grocery-pos-backend/api';

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
    console.log('Creating product with data:', product);
    return api.post('/products.php', {
      name: product.name,
      barcode: product.barcode,
      price: parseFloat(product.price || product.unitPrice),
      stock: parseInt(product.stock || 0),
      category: product.category,
      vendor: product.vendor,
      unit: product.unit || 'piece',
      description: product.description || ''
    });
  },
  update: (product: any) => {
    console.log('Updating product with data:', product);
    return api.put('/products.php', {
      id: product.id,
      name: product.name,
      barcode: product.barcode,
      price: parseFloat(product.price || product.unitPrice),
      stock: parseInt(product.stock || 0),
      category: product.category,
      vendor: product.vendor,
      unit: product.unit || 'piece',
      description: product.description || ''
    });
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
  update: (vendor: any) => api.put('/vendors.php', vendor),
  delete: (id: string) => api.delete(`/vendors.php?id=${id}`),
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
};

// Export API
export const exportApi = {
  exportProducts: () => api.get('/export.php?type=products', { responseType: 'blob' }),
  exportCategories: () => api.get('/export.php?type=categories', { responseType: 'blob' }),
  exportVendors: () => api.get('/export.php?type=vendors', { responseType: 'blob' }),
  exportTransactions: () => api.get('/export.php?type=transactions', { responseType: 'blob' }),
  exportStockMovements: () => api.get('/export.php?type=stock-movements', { responseType: 'blob' }),
};
