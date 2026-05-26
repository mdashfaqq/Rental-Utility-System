
import React, { createContext, useContext, useState } from 'react';
import { tamilTranslations } from './translations/tamil';

// interface LanguageContextType {
//   language: 'en' | 'ta';
//   setLanguage: (lang: 'en' | 'ta') => void;
//   toggleLanguage: () => void;
//   t: (key: string) => string;
// }
interface LanguageContextType {
  language: 'en';
  setLanguage: (lang: 'en') => void;
  t: (key: string) => string;
}


const englishTranslations = {
  // Navigation
  dashboard: 'Dashboard',
  pos: 'POS',
  inventory: 'Inventory',
  products: 'Products',
  categories: 'Categories',
  vendors: 'Vendors',
  reports: 'Reports',
  settings: 'Settings',
  
  // Products
  addProduct: 'Add Product',
  editProduct: 'Edit Product',
  productName: 'Product Name',
  barcode: 'Barcode',
  price: 'Price',
  stock: 'Stock',
  category: 'Category',
  vendor: 'Vendor',
  searchProduct: 'Search Product',
  edit: 'Edit',
  delete: 'Delete',
  save: 'Save',
  cancel: 'Cancel',
  
  // Categories
  addCategory: 'Add Category',
  categoryName: 'Category Name',
  description: 'Description',
  
  // Vendors
  addVendor: 'Add Vendor',
  vendorName: 'Vendor Name',
  contact: 'Contact',
  email: 'Email',
  address: 'Address',
  
  // POS
  addToCart: 'Add to Cart',
  removeFromCart: 'Remove from Cart',
  total: 'Total',
  checkout: 'Checkout',
  receipt: 'Receipt',
  
  // Settings
  storeDetails: 'Store Details',
  taxSettings: 'Tax Settings',
  printSettings: 'Print Settings',
  systemSettings: 'System Settings',
  securitySettings: 'Security Settings',
  
  // Common
  name: 'Name',
  phone: 'Phone',
  submit: 'Submit',
  close: 'Close',
  loading: 'Loading...',
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  
  // Export
  export: 'Export',
  exportToExcel: 'Export to Excel',
  
  // Units
  kg: 'kg',
  gram: 'gram',
  litre: 'litre',
  ml: 'ml',
  piece: 'piece',
  packet: 'packet',
  dozen: 'dozen'
};

const translations = {
  en: englishTranslations,
  ta: tamilTranslations
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'en' | 'ta'>('en');

  // const toggleLanguage = () => {
  //   setLanguage(prev => prev === 'en' ? 'ta' : 'en');
  // };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof englishTranslations] || key;
  };

  return (
    // <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
