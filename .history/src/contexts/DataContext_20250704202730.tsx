
import React, { createContext, useContext, useState, useEffect } from 'react';
import { productsApi, categoriesApi, vendorsApi, transactionsApi, stockMovementsApi, subCategoriesApi } from '@/services/api';
import { useAuth } from '@/components/auth/AuthContext';
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

export interface CartItem extends Product {
  quantity: number;
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
  updateVendor: (id: string, vendor: Partial<Vendor>) => Promise<void>;
  deleteVendor: (id: string) => Promise<void>;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => Promise<void>;
  addStockMovement: (movement: any) => Promise<void>;
  scanProduct: (barcode: string) => Product | null;
  fetchData: () => Promise<void>;
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
  const [cart, setCart] = useState<CartItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      // Transform API data to match frontend format
      const transformedProducts = productsRes.data.map((p: any) => ({
        id: p.id.toString(),
        name: p.name,
        barcode: p.barcode,
        price: p.price,
        stock: p.stock,
        category: p.category || '',
        vendor: p.vendor || '',
        unit: 'kg' as const,
        unitPrice: p.unitPrice,
        minQuantity: 0.25,
        description: ''
      }));

      const transformedCategories = categoriesRes.data.map((c: any) => ({
        id: c.id.toString(),
        name: c.name,
        description: c.description || '',
        subcategories: []
      }));

      const transformedVendors = vendorsRes.data.map((v: any) => ({
        id: v.id.toString(),
        name: v.name,
        contact: v.contact || '',
        email: v.email || '',
        address: v.address || ''
      }));

      const transformedTransactions = transactionsRes.data.map((t: any) => ({
        id: t.id.toString(),
        items: t.items || [],
        total: t.total,
        tax: t.tax || 0,
        discount: t.discount || 0,
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
          minQuantity: 0.25,
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
      setLoading(true);
      await productsApi.delete(id);
      await fetchData();
    } catch (err) {
      setError('Failed to delete product');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    try {
      setLoading(true);
      await categoriesApi.create(category);
      await fetchData();
    } catch (err) {
      setError('Failed to add category');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: string, category: Partial<Category>) => {
    try {
      setLoading(true);
      await categoriesApi.update({ id, ...category });
      await fetchData();
    } catch (err) {
      setError('Failed to update category');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      setLoading(true);
      await categoriesApi.delete(id);
      await fetchData();
    } catch (err) {
      setError('Failed to delete category');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addSubCategory = async (subcategory: { name: string; category_id: string; description?: string }) => {
    try {
      setLoading(true);
      await subCategoriesApi.create(subcategory);
      await fetchData();
    } catch (err) {
      setError('Failed to add subcategory');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateSubCategory = async (id: string, subcategory: { name: string; category_id: string; description?: string }) => {
    try {
      setLoading(true);
      await subCategoriesApi.update({ id, ...subcategory });
      await fetchData();
    } catch (err) {
      setError('Failed to update subcategory');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteSubCategory = async (id: string) => {
    try {
      setLoading(true);
      await subCategoriesApi.delete(id);
      await fetchData();
    } catch (err) {
      setError('Failed to delete subcategory');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addVendor = async (vendor: Omit<Vendor, 'id'>) => {
    try {
      setLoading(true);
      await vendorsApi.create(vendor);
      await fetchData();
    } catch (err) {
      setError('Failed to add vendor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateVendor = async (id: string, vendor: Partial<Vendor>) => {
    try {
      setLoading(true);
      await vendorsApi.update({ id, ...vendor });
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
      await vendorsApi.delete(id);
      await fetchData();
    } catch (err) {
      setError('Failed to delete vendor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Cart operations remain local for better UX
  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
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
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
    try {
      setLoading(true);
      const response = await transactionsApi.create({
        items: transaction.items,
        subtotal: transaction.total - transaction.tax + transaction.discount,
        tax: transaction.tax,
        discount: transaction.discount,
        total: transaction.total,
        paymentMethod: transaction.paymentMethod
      });
      
      console.log('Transaction saved:', response.data);
      await fetchData(); // Refresh transactions
      clearCart(); // Clear cart after successful transaction
    } catch (err) {
      setError('Failed to save transaction');
      console.error(err);
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

  const scanProduct = (barcode: string): Product | null => {
    const product = products.find(p => p.barcode === barcode);
    return product || null;
  };

  return (
    <DataContext.Provider value={{
      products,
      categories,
      vendors,
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
      addToCart,
      removeFromCart,
      updateCartQuantity,
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
