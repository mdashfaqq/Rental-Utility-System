
import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { POSInterface } from '@/components/POSInterface';
import { ProductManagement } from '@/components/ProductManagement';
import { CategoryManagement } from '@/components/CategoryManagement';
import { VendorManagement } from '@/components/VendorManagement';
import { InventoryManagement } from '@/components/InventoryManagement';
import { Reports } from '@/components/Reports';
import { Settings } from '@/components/Settings';
import { ProductMaster } from '@/components/masters/ProductMaster';
import { CategoryMaster } from '@/components/masters/CategoryMaster';
import { SubCategoryMaster } from '@/components/masters/SubCategoryMaster';
import { VendorMaster } from '@/components/masters/VendorMaster';
import { DataProvider, useData } from '@/contexts/DataContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Toaster } from '@/components/ui/sonner';
import { Loading } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Login } from '@/components/auth/Login';

const AppContent = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { loading, error, fetchData } = useData();

  const renderContent = () => {
    if (loading) {
      return <Loading message="Loading application data..." className="min-h-[400px]" />;
    }

    if (error) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Connection Error</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <p className="text-sm text-red-600 mb-4">
              Make sure the backend server is running and accessible.
            </p>
            <Button onClick={fetchData} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Connection
            </Button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'pos':
        return <POSInterface />;
      case 'products':
        return <ProductManagement />;
      case 'categories':
        return <CategoryManagement />;
      case 'vendors':
        return <VendorManagement />;
      case 'inventory':
        return <InventoryManagement />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      case 'master-products':
        return <ProductMaster />;
      case 'master-categories':
        return <CategoryMaster />;
      case 'master-subcategories':
        return <SubCategoryMaster />;
      case 'master-vendors':
        return <VendorMaster />;
    case 'login':
        return <Logn />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
};

const Index = () => {
  return (
    <LanguageProvider>
      <DataProvider>
        <AppContent />
        <Toaster />
      </DataProvider>
    </LanguageProvider>
  );
};

export default Index;
