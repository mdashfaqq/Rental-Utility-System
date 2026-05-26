
import React, { createContext, useContext, useState, useEffect } from 'react';
import { productsApi, categoriesApi, vendorsApi, transactionsApi, stockMovementsApi, subCategoriesApi, customersApi } from '@/services/api';
import { useAuth } from '@/components/auth/AuthContext';
import {API_BASE_URL} from "@/services/api";
import axios from 'axios';
import { toast } from 'sonner';
export interface Product {
  id: string;
  name: string;
  barcode: string;
  price: string;
  stock: number;
  category: string;
  subcategory?: string;
  vendor: string;
  image?: string;
  unit: 'kg' | 'gram' | 'litre' | 'ml' | 'piece' | 'packet' | 'dozen';
  unitPrice: string;
  minQuantity: number;
  smallUnit?: string;
  conversionFactor?: number;
  description?: string;
  minStock?: number; 
  used_count?: number;
  inwardMovement?: number;
  outwardMovement?: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  subcategories?: string[];
}

export interface Vendor {
  id: string;
  name: string;
  contact: string;
  email: string;
  address: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  active?: boolean;
}

export interface CartItem extends Product {
  quantity: number;

  rentalStartDate: string;
  rentalEndDate: string;
  rentalDays: number;

  deposit?: number;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  total: number;
  tax: number;
  discount: number;
  paymentMethod: 'cash' | 'card';
  timestamp: Date;
  billNumber?: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  movement_type: 'in' | 'out';
  quantity: number;
  reference_type: 'purchase' | 'sale' | 'adjustment';
  reference_id: string;
  notes?: string;
  timestamp: Date;
}

interface DataContextType {
  products: Product[];
  categories: Category[];
  vendors: Vendor[];
  customers: Customer[];
  cart: CartItem[];
  transactions: Transaction[];
  stockMovements: StockMovement[];
  loading: boolean;
  error: string | null;
  
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addSubCategory: (subcategory: { name: string; category_id: string; description?: string }) => Promise<void>;
  updateSubCategory: (id: string, subcategory: { name: string; category_id: string; description?: string }) => Promise<void>;
  deleteSubCategory: (id: string) => Promise<void>;
  addVendor: (vendor: Omit<Vendor, 'id'>) => Promise<void>;
updateVendor: (vendor: Partial<Vendor> & { id: string }) => Promise<void>;
  deleteVendor: (id: string) => Promise<void>;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateRentalDates: (id: string, start?: string, end?: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => Promise<void>;
  addStockMovement: (movement: any) => Promise<void>;
  scanProduct: (barcode: string) => Product | null;
  fetchData: () => Promise<void>;
  

addCustomer: (data: Omit<Customer, 'id'>) => Promise<void>;
updateCustomer: (id: string, data: Partial<Customer>) => Promise<void>;
deleteCustomer: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);

const [discountType, setDiscountType] = useState("percentage");

const [gstEnabled, setGstEnabled] = useState(true);
const calculateRentalDays = (start?: string, end?: string) => {
  if (!start || !end) return 1;

  const startDate = new Date(start);
  const endDate = new Date(end);
const updateRentalDates = (
  id: string,
  start?: string,
  end?: string
) => {
  setCart(prev =>
    prev.map(item => {
      if (item.id !== id) return item;

      const newStart = start || item.rentalStartDate;
      const newEnd = end || item.rentalEndDate;

      return {
        ...item,
        rentalStartDate: newStart,
        rentalEndDate: newEnd,
        rentalDays: calculateRentalDays(newStart, newEnd)
      };
    })
  );
};
  const diffTime = endDate.getTime() - startDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 1;
};
  const { user, isAuthenticated } = useAuth();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsRes, categoriesRes, vendorsRes, transactionsRes] = await Promise.all([
        productsApi.getAll(),
        categoriesApi.getAll(),
        vendorsApi.getAll(),
        transactionsApi.getAll()
      ]);

      const getArray = (res: any) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.products)) return res.products;
  if (Array.isArray(res?.categories)) return res.categories;
  if (Array.isArray(res?.vendors)) return res.vendors;
  if (Array.isArray(res?.transactions)) return res.transactions;
  return [];
};
      // Transform API data to match frontend format
const productsArray = getArray(productsRes.data);

const transformedProducts = productsArray.map((p: any) => ({
  id: String(p.id),
  name: p.name,
  barcode: p.barcode,
  price: Number(p.price),
  stock: Number(p.stock),
  category: p.category || '',
  vendor: p.vendor || '',
  unit: (p.unit || 'piece') ,
  unitPrice: p.unitPrice,
  minQuantity: 1,
  description: '',
  inwardMovement:
  Number(p.inwardMovement || 0),

outwardMovement:
  Number(p.outwardMovement || 0),
}));

const categoriesArray = getArray(categoriesRes.data);

const transformedCategories = categoriesArray.map((c: any) => ({
  id: String(c.id),
  name: c.name,
  description: c.description || '',
  subcategories: c.subcategories || [],
}));

const vendorsArray = getArray(vendorsRes.data);

const transformedVendors = vendorsArray.map((v: any) => ({
  id: String(v.id),
  name: v.name,
  contact: v.contact || '',
  email: v.email || '',
  address: v.address || ''
}));

const transactionsArray = getArray(transactionsRes.data);

const transformedTransactions = transactionsArray.map((t: any) => ({
  id: String(t.id),
  items: t.items || [],
  total: Number(t.total) || 0,
  tax: Number(t.tax) || 0,
  discount: Number(t.discount) || 0,
  paymentMethod: t.paymentMethod as 'cash' | 'card',
  timestamp: new Date(t.timestamp),
  billNumber: t.bill_number
}));

      setProducts(transformedProducts);
      setCategories(transformedCategories);
      setVendors(transformedVendors);
      setTransactions(transformedTransactions);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data from server');
      // Fallback to sample data
      setProducts([
        { 
          id: '1', 
          name: 'Tomato', 
          barcode: '1234567890', 
          price: 40, 
          stock: 50, 
          category: 'Vegetables',
          vendor: 'Fresh Farm Co.',
          unit: 'kg',
          unitPrice: 40,
          minQuantity: 1,
          description: 'Fresh red tomatoes'
        }
      ]);
      setCategories([
        { id: '1', name: 'Vegetables', description: 'Fresh vegetables', subcategories: [] }
      ]);
      setVendors([
        { id: '1', name: 'Fresh Farm Co.', contact: '+91 9876543210', email: 'contact@freshfarm.com', address: 'Chennai, Tamil Nadu' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchCustomers();
  }, []);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    if (!isAuthenticated || !user) {
      toast.error('Please login to add products');
      return;
    }

    try {
      console.log('Adding product:', product, 'User:', user.username);
      setLoading(true);
      await productsApi.create(product);
      // await fetchData(); // Refresh data
      await fetchData();
      toast.success(`Product added successfully by ${user.username}!`);
    } catch (err) {
      setError('Failed to add product');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    try {
      setLoading(true);
      await productsApi.update({ id, ...product });
      console.log(product);
      await fetchData();
    } catch (err) {
      setError('Failed to update product');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

const deleteProduct = async (id: string) => {
  try {

    const response = await axios.delete(
      `${API_BASE_URL}/products.php?id=${id}`
    );

    if (response.data?.success === false) {
      throw new Error(response.data.message);
    }

    setProducts((prev) =>
      prev.filter((product) => product.id !== id)
    );

    return response.data;

  } catch (error: any) {

    throw new Error(
      error?.response?.data?.message ||
      error?.message ||
      'Unable to delete product'
    );
  }
};

const addCategory = async (
  category: Omit<Category, 'id'>
) => {

  try {

    setLoading(true);

    const response =
      await categoriesApi.create(category);

    // Duplicate / validation error
    if (!response.data.success) {
      return response.data;
    }

    // Refresh only on success
    await fetchData();

    return response.data;

  } catch (err: any) {

    console.error(err);

    return {
      success: false,
      message:
        err?.response?.data?.message ||
        'Failed to connect to server'
    };

  } finally {

    setLoading(false);
  }
};

const updateCategory = async (
  id: string,
  category: Partial<Category>
) => {

  try {

    setLoading(true);

    const response =
      await categoriesApi.update({
        id,
        ...category
      });

    if (!response.data.success) {
      return response.data;
    }

    await fetchData();

    return response.data;

  } catch (err: any) {

    console.error(err);

    return {
      success: false,
      message:
        err?.response?.data?.message ||
        'Failed to connect to server'
    };

  } finally {

    setLoading(false);
  }
};

const deleteCategory = async (id: string) => {

  try {

    const response = await axios.delete(
      `${API_BASE_URL}/categories.php?id=${id}`
    );

    if (response.data?.success === false) {

      throw new Error(
        response.data.message
      );
    }

    await fetchData();

    return response.data;

  } catch (error: any) {

    throw new Error(
      error?.response?.data?.message ||
      error?.message ||
      'Unable to delete category'
    );
  }
};
const addSubCategory = async (
  subcategory: {
    name: string;
    category_id: string;
    description?: string;
  }
) => {

  try {

    setLoading(true);

    const response =
      await subCategoriesApi.create(subcategory);

    // Duplicate / validation
    if (!response.data.success) {
      return response.data;
    }

    // Refresh only on success
    await fetchData();

    return response.data;

  } catch (err: any) {

    console.error(err);

    return {
      success: false,
      message:
        err?.response?.data?.message ||
        'Failed to connect to server'
    };

  } finally {

    setLoading(false);
  }
};

const updateSubCategory = async (
  id: string,
  subcategory: {
    name: string;
    category_id: string;
    description?: string;
  }
) => {

  try {

    setLoading(true);

    const response =
      await subCategoriesApi.update({
        id,
        ...subcategory
      });

    // Duplicate / validation
    if (!response.data.success) {
      return response.data;
    }

    // Refresh only on success
    await fetchData();

    return response.data;

  } catch (err: any) {

    console.error(err);

    return {
      success: false,
      message:
        err?.response?.data?.message ||
        'Failed to connect to server'
    };

  } finally {

    setLoading(false);
  }
};

const deleteSubCategory = async (id: string) => {

  try {

    setLoading(true);

    const response = await subCategoriesApi.delete(id);

    if (response.data?.success === false) {

      throw new Error(
        response.data.message
      );
    }

    await fetchData();

    return response.data;

  } catch (error: any) {

    throw new Error(
      error?.response?.data?.message ||
      error?.message ||
      'Unable to delete sub-category'
    );

  } finally {

    setLoading(false);
  }
};




const addVendor = async (
  vendor: Omit<Vendor, 'id'>
) => {

  try {

    setLoading(true);

    const response = await vendorsApi.create(vendor);

    // ✅ Duplicate / validation
    if (!response.data.success) {
      return response.data;
    }

    // ✅ Refresh only on success
    await fetchData();

    return response.data;

  } catch (err) {

    console.error(err);

    return {
      success: false,
      message: 'Failed to connect to server'
    };

  } finally {

    setLoading(false);
  }
};


const updateVendor = async (vendor: Partial<Vendor> & { id: string }) => {
  try {
    setLoading(true);
    await vendorsApi.update(vendor);
    await fetchData();
  } catch (err) {
    setError('Failed to update vendor');
    console.error(err);
  } finally {
    setLoading(false);
  }
};
const deleteVendor = async (id: string) => {

  try {

    setLoading(true);

    const response = await vendorsApi.delete(id);

    if (response.data?.success === false) {

      throw new Error(
        response.data.message
      );
    }

    await fetchData();

    return response.data;

  } catch (error: any) {

    throw new Error(
      error?.response?.data?.message ||
      error?.message ||
      'Unable to delete vendor'
    );

  } finally {

    setLoading(false);
  }
};

const fetchCustomers = async () => {
  try {
    const res = await customersApi.getAll();

    console.log("CUSTOMERS API:", res); // 🔍 debug

    // ✅ handle multiple backend formats
    if (Array.isArray(res)) {
      setCustomers(res);
    } else if (res.data) {
      setCustomers(res.data);
    } else {
      setCustomers([]);
    }

  } catch (err) {
    console.error('Customer fetch failed', err);
    setCustomers([]);
  }
};

const calculateDays = (start: string, end: string) => {
  if (!start || !end) return 1;

  const s = new Date(start);
  const e = new Date(end);

  const diff = Math.ceil(
    (e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)
  );

  return diff > 0 ? diff : 1;
};

const addCustomer = async (data: Omit<Customer, 'id'>) => {
  try {
    await customersApi.create(data);
    await fetchCustomers();
  } catch (err) {
    console.error('Add customer failed', err);
  }
};

const updateCustomer = async (id: string, data: Partial<Customer>) => {
  try {
    await customersApi.update(id, data);
    await fetchCustomers();
  } catch (err) {
    console.error('Update customer failed', err);
  }
};

const deleteCustomer = async (id: string) => {
  try {
    await customersApi.delete(id);
    await fetchCustomers();
  } catch (err) {
    console.error('Delete customer failed', err);
  }
};
const addToCart = (product: Product, quantity = 1) => {
  setCart(prev => {
    const existingItem = prev.find(item => item.id === product.id);

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
   const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const startDate = formatDate(today);
    const endDate = formatDate(tomorrow);

    if (existingItem) {
      return prev.map(item => {
        if (item.id !== product.id) return item;

        return {
          ...item,
          quantity: item.quantity + quantity,

          // ✅ FORCE VALUES (important)
          rentalStartDate: item.rentalStartDate || startDate,
          rentalEndDate: item.rentalEndDate || endDate,
          rentalDays: calculateDays(
            item.rentalStartDate || startDate,
            item.rentalEndDate || endDate
          )
        };
      });
    }

    return [
      ...prev,
      {
        ...product,
        quantity,

        // ✅ ALWAYS SET
        rentalStartDate: startDate,
        rentalEndDate: endDate,
        rentalDays: calculateDays(startDate, endDate)
      }
    ];
  });
};



  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

const clearCart = () => {

  setCart([]);

  setDiscount(0);

  setDiscountType("percentage");

  setGstEnabled(true);

};

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
  try {
    setLoading(true);

    const payload = {
      items: transaction.items,
      subtotal: transaction.total - transaction.tax + transaction.discount,
      tax: transaction.tax,
      discount: transaction.discount,
      total: transaction.total,
      paymentMethod: transaction.paymentMethod,
      user_id: transaction.user_id, // make sure this is passed if required by backend
      cashier_name: transaction.customer?.name || 'Unknown' // ensure it maps to backend expectation
    };

    console.log('🔼 Submitting transaction payload:', payload);

    const response = await transactionsApi.create(payload);

    console.log('✅ Transaction saved successfully:', response.data);

    await fetchData(); // Refresh transactions
    clearCart(); // Clear cart after successful transaction
  } catch (err) {
    console.error('❌ Failed to save transaction:', err);
    setError('Failed to save transaction');
  } finally {
    setLoading(false);
  }
};


  const addStockMovement = async (movement: any) => {
    try {
      setLoading(true);
      await stockMovementsApi.create(movement);
      await fetchData(); // Refresh products to get updated stock
    } catch (err) {
      setError('Failed to add stock movement');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateRentalDates = (
  id: string,
  start?: string,
  end?: string
) => {
  setCart(prev =>
    prev.map(item => {
      if (item.id !== id) return item;

      const newStart = start || item.rentalStartDate;
      const newEnd = end || item.rentalEndDate;

      return {
        ...item,
        rentalStartDate: newStart,
        rentalEndDate: newEnd,
        rentalDays: calculateRentalDays(newStart, newEnd)
      };
    })
  );
};

  const scanProduct = (barcode: string): Product | null => {
    const product = products.find(p => p.barcode === barcode);
    return product || null;
  };

  return (
    <DataContext.Provider value={{
      products,
      categories,
      vendors,
      customers,
      cart,
      transactions,
      stockMovements,
      loading,
      error,
      addProduct,
      updateProduct,
      deleteProduct,
      addCategory,
      updateCategory,
      deleteCategory,
      addSubCategory,
      updateSubCategory,
      deleteSubCategory,
      addVendor,
      updateVendor,
      deleteVendor,
      addCustomer,
  updateCustomer,
  deleteCustomer,
      addToCart,
      removeFromCart,
      
      updateCartQuantity,
      updateRentalDates,
      clearCart,
      addTransaction,
      addStockMovement,
      scanProduct,
      fetchData,
    }}>
      {children}
    </DataContext.Provider>
  );
};

// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { productsApi, categoriesApi, vendorsApi, transactionsApi, stockMovementsApi, subCategoriesApi } from '@/services/api';
// import { toast } from 'sonner';

// export interface Product {
//   id: string;
//   name: string;
//   barcode: string;
//   price: number;
//   stock: number;
//   category: string;
//   subcategory?: string;
//   vendor: string;
//   image?: string;
//   unit: 'kg' | 'gram' | 'litre' | 'ml' | 'piece' | 'packet' | 'dozen';
//   unitPrice: number;
//   minQuantity: number;
//   smallUnit?: string;
//   conversionFactor?: number;
//   description?: string;
// }

// export interface Category {
//   id: string;
//   name: string;
//   description: string;
//   subcategories?: string[];
// }

// export interface Vendor {
//   id: string;
//   name: string;
//   contact: string;
//   email: string;
//   address: string;
// }

// export interface CartItem extends Product {
//   quantity: number;
// }

// export interface Transaction {
//   id: string;
//   items: CartItem[];
//   total: number;
//   tax: number;
//   discount: number;
//   paymentMethod: 'cash' | 'card';
//   timestamp: Date;
//   billNumber?: string;
// }

// export interface StockMovement {
//   id: string;
//   product_id: string;
//   movement_type: 'in' | 'out';
//   quantity: number;
//   reference_type: 'purchase' | 'sale' | 'adjustment';
//   reference_id: string;
//   notes?: string;
//   timestamp: Date;
// }

// interface DataContextType {
//   products: Product[];
//   categories: Category[];
//   vendors: Vendor[];
//   cart: CartItem[];
//   transactions: Transaction[];
//   stockMovements: StockMovement[];
//   loading: boolean;
//   error: string | null;
//   addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
//   updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
//   deleteProduct: (id: string) => Promise<void>;
//   addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
//   updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
//   deleteCategory: (id: string) => Promise<void>;
//   addSubCategory: (subcategory: { name: string; category_id: string; description?: string }) => Promise<void>;
//   updateSubCategory: (id: string, subcategory: { name: string; category_id: string; description?: string }) => Promise<void>;
//   deleteSubCategory: (id: string) => Promise<void>;
//   addVendor: (vendor: Omit<Vendor, 'id'>) => Promise<void>;
//   updateVendor: (id: string, vendor: Partial<Vendor>) => Promise<void>;
//   deleteVendor: (id: string) => Promise<void>;
//   addToCart: (product: Product, quantity?: number) => void;
//   removeFromCart: (productId: string) => void;
//   updateCartQuantity: (productId: string, quantity: number) => void;
//   clearCart: () => void;
//   addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => Promise<void>;
//   addStockMovement: (movement: any) => Promise<void>;
//   scanProduct: (barcode: string) => Product | null;
//   fetchData: () => Promise<void>;
// }

// const DataContext = createContext<DataContextType | undefined>(undefined);

// export const useData = () => {
//   const context = useContext(DataContext);
//   if (!context) {
//     throw new Error('useData must be used within a DataProvider');
//   }
//   return context;
// };

// export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [vendors, setVendors] = useState<Vendor[]>([]);
//   const [cart, setCart] = useState<CartItem[]>([]);
//   const [transactions, setTransactions] = useState<Transaction[]>([]);
//   const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const fetchData = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       console.log('Fetching data from backend...');
//       const [productsRes, categoriesRes, vendorsRes, transactionsRes] = await Promise.all([
//         productsApi.getAll(),
//         categoriesApi.getAll(),
//         vendorsApi.getAll(),
//         transactionsApi.getAll()
//       ]);

//       console.log('Raw API responses:', { productsRes: productsRes.data, categoriesRes: categoriesRes.data, vendorsRes: vendorsRes.data });

//       // Transform API data to match frontend format
//       const transformedProducts = productsRes.data.map((p: any) => ({
//         id: p.id.toString(),
//         name: p.name,
//         barcode: p.barcode || '',
//         price: parseFloat(p.price || 0),
//         stock: parseInt(p.stock || 0),
//         category: p.category || '',
//         vendor: p.vendor || '',
//         unit: 'piece' as const,
//         unitPrice: parseFloat(p.price || 0),
//         minQuantity: 1,
//         description: p.description || ''
//       }));

//       const transformedCategories = categoriesRes.data.map((c: any) => ({
//         id: c.id.toString(),
//         name: c.name,
//         description: c.description || '',
//         subcategories: []
//       }));

//       const transformedVendors = vendorsRes.data.map((v: any) => ({
//         id: v.id.toString(),
//         name: v.name,
//         contact: v.contact || '',
//         email: v.email || '',
//         address: v.address || ''
//       }));

//       const transformedTransactions = transactionsRes.data.map((t: any) => ({
//         id: t.id.toString(),
//         items: t.items || [],
//         total: parseFloat(t.total || 0),
//         tax: parseFloat(t.tax || 0),
//         discount: parseFloat(t.discount || 0),
//         paymentMethod: t.paymentMethod as 'cash' | 'card',
//         timestamp: new Date(t.timestamp),
//         billNumber: t.bill_number
//       }));

//       setProducts(transformedProducts);
//       setCategories(transformedCategories);
//       setVendors(transformedVendors);
//       setTransactions(transformedTransactions);
      
//       console.log('Data successfully loaded:', {
//         products: transformedProducts.length,
//         categories: transformedCategories.length,
//         vendors: transformedVendors.length,
//         transactions: transformedTransactions.length
//       });
//     } catch (err) {
//       console.error('Error fetching data:', err);
//       setError('Failed to connect to backend server. Using sample data.');
//       toast.error('Failed to connect to backend server. Please check if the server is running.');
      
//       // Fallback to sample data
//       setProducts([
//         { 
//           id: '1', 
//           name: 'Tomato', 
//           barcode: '1234567890', 
//           price: 40, 
//           stock: 50, 
//           category: 'Vegetables',
//           vendor: 'Fresh Farm Co.',
//           unit: 'kg',
//           unitPrice: 40,
//           minQuantity: 0.25,
//           description: 'Fresh red tomatoes'
//         }
//       ]);
//       setCategories([
//         { id: '1', name: 'Vegetables', description: 'Fresh vegetables', subcategories: [] }
//       ]);
//       setVendors([
//         { id: '1', name: 'Fresh Farm Co.', contact: '+91 9876543210', email: 'contact@freshfarm.com', address: 'Chennai, Tamil Nadu' }
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const addProduct = async (product: Omit<Product, 'id'>) => {
//     try {
//       console.log('Adding product:', product);
//       setLoading(true);
//       const response = await productsApi.create(product);
//       console.log('Product creation response:', response.data);
//       await fetchData(); // Refresh data
//       toast.success('Product added successfully!');
//     } catch (err: any) {
//       const errorMessage = err.response?.data?.message || 'Failed to add product';
//       setError(errorMessage);
//       toast.error(errorMessage);
//       console.error('Error adding product:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateProduct = async (id: string, product: Partial<Product>) => {
//     try {
//       console.log('Updating product:', { id, ...product });
//       setLoading(true);
//       const response = await productsApi.update({ id, ...product });
//       console.log('Product update response:', response.data);
//       await fetchData();
//       toast.success('Product updated successfully!');
//     } catch (err: any) {
//       const errorMessage = err.response?.data?.message || 'Failed to update product';
//       setError(errorMessage);
//       toast.error(errorMessage);
//       console.error('Error updating product:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const deleteProduct = async (id: string) => {
//     try {
//       console.log('Deleting product:', id);
//       setLoading(true);
//       const response = await productsApi.delete(id);
//       console.log('Product deletion response:', response.data);
//       await fetchData();
//       toast.success('Product deleted successfully!');
//     } catch (err: any) {
//       const errorMessage = err.response?.data?.message || 'Failed to delete product';
//       setError(errorMessage);
//       toast.error(errorMessage);
//       console.error('Error deleting product:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const addCategory = async (category: Omit<Category, 'id'>) => {
//     try {
//       setLoading(true);
//       await categoriesApi.create(category);
//       await fetchData();
//     } catch (err) {
//       setError('Failed to add category');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateCategory = async (id: string, category: Partial<Category>) => {
//     try {
//       setLoading(true);
//       await categoriesApi.update({ id, ...category });
//       await fetchData();
//     } catch (err) {
//       setError('Failed to update category');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const deleteCategory = async (id: string) => {
//     try {
//       setLoading(true);
//       await categoriesApi.delete(id);
//       await fetchData();
//     } catch (err) {
//       setError('Failed to delete category');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const addSubCategory = async (subcategory: { name: string; category_id: string; description?: string }) => {
//     try {
//       setLoading(true);
//       await subCategoriesApi.create(subcategory);
//       await fetchData();
//     } catch (err) {
//       setError('Failed to add subcategory');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateSubCategory = async (id: string, subcategory: { name: string; category_id: string; description?: string }) => {
//     try {
//       setLoading(true);
//       await subCategoriesApi.update({ id, ...subcategory });
//       await fetchData();
//     } catch (err) {
//       setError('Failed to update subcategory');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const deleteSubCategory = async (id: string) => {
//     try {
//       setLoading(true);
//       await subCategoriesApi.delete(id);
//       await fetchData();
//     } catch (err) {
//       setError('Failed to delete subcategory');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const addVendor = async (vendor: Omit<Vendor, 'id'>) => {
//     try {
//       setLoading(true);
//       await vendorsApi.create(vendor);
//       await fetchData();
//     } catch (err) {
//       setError('Failed to add vendor');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateVendor = async (id: string, vendor: Partial<Vendor>) => {
//     try {
//       setLoading(true);
//       await vendorsApi.update({ id, ...vendor });
//       await fetchData();
//     } catch (err) {
//       setError('Failed to update vendor');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const deleteVendor = async (id: string) => {
//     try {
//       setLoading(true);
//       await vendorsApi.delete(id);
//       await fetchData();
//     } catch (err) {
//       setError('Failed to delete vendor');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Cart operations remain local for better UX
//   const addToCart = (product: Product, quantity = 1) => {
//     setCart(prev => {
//       const existingItem = prev.find(item => item.id === product.id);
//       if (existingItem) {
//         return prev.map(item =>
//           item.id === product.id
//             ? { ...item, quantity: item.quantity + quantity }
//             : item
//         );
//       }
//       return [...prev, { ...product, quantity }];
//     });
//   };

//   const removeFromCart = (productId: string) => {
//     setCart(prev => prev.filter(item => item.id !== productId));
//   };

//   const updateCartQuantity = (productId: string, quantity: number) => {
//     if (quantity <= 0) {
//       removeFromCart(productId);
//       return;
//     }
//     setCart(prev =>
//       prev.map(item =>
//         item.id === productId ? { ...item, quantity } : item
//       )
//     );
//   };

//   const clearCart = () => {
//     setCart([]);
//   };

//   const addTransaction = async (transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
//     try {
//       setLoading(true);
//       const response = await transactionsApi.create({
//         items: transaction.items,
//         subtotal: transaction.total - transaction.tax + transaction.discount,
//         tax: transaction.tax,
//         discount: transaction.discount,
//         total: transaction.total,
//         paymentMethod: transaction.paymentMethod
//       });
      
//       console.log('Transaction saved:', response.data);
//       await fetchData(); // Refresh transactions
//       clearCart(); // Clear cart after successful transaction
//       toast.success('Transaction saved successfully!');
//     } catch (err) {
//       setError('Failed to save transaction');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const addStockMovement = async (movement: any) => {
//     try {
//       console.log('Adding stock movement:', movement);
//       setLoading(true);
//       const response = await stockMovementsApi.create(movement);
//       console.log('Stock movement response:', response.data);
//       await fetchData(); // Refresh products to get updated stock
//       toast.success(`Stock ${movement.movement_type === 'in' ? 'added' : 'removed'} successfully!`);
//     } catch (err: any) {
//       const errorMessage = err.response?.data?.message || 'Failed to update stock';
//       setError(errorMessage);
//       toast.error(errorMessage);
//       console.error('Error adding stock movement:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const scanProduct = (barcode: string): Product | null => {
//     const product = products.find(p => p.barcode === barcode);
//     return product || null;
//   };

//   return (
//     <DataContext.Provider value={{
//       products,
//       categories,
//       vendors,
//       cart,
//       transactions,
//       stockMovements,
//       loading,
//       error,
//       addProduct,
//       updateProduct,
//       deleteProduct,
//       addCategory,
//       updateCategory,
//       deleteCategory,
//       addSubCategory,
//       updateSubCategory,
//       deleteSubCategory,
//       addVendor,
//       updateVendor,
//       deleteVendor,
//       addToCart,
//       removeFromCart,
//       updateCartQuantity,
//       clearCart,
//       addTransaction,
//       addStockMovement,
//       scanProduct,
//       fetchData,
//     }}>
//       {children}
//     </DataContext.Provider>
//   );
// };
