
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
import { Register } from '@/components/auth/Register';
import GlassPrescriptionSlip from '@/components/GlassPrescriptionSlip';
import { QuotationList } from "@/components/QuotationList";
import { QuotationDetails } from "@/components/QuotationDetails";
import { DeliveryChallanList } from "@/components/DeliveryChallanList";
import { DeliveryChallanDetails } from "@/components/DeliveryChallanDetails";
import { InvoiceList } from "@/components/InvoiceList";
import { InvoiceDetails } from "@/components/InvoiceDetails";
import { CustomerMaster } from '@/components/masters/CustomerMaster';
import { ReturnChallanPage } from '@/components/ReturnChallanPage';
import { CustomerListForLedger } from '@/components/CustomerListForLedger';
import { CustomerLedgerPage } from '@/components/CustomerLedgerPage';

const AppContent: React.FC<{ initialTab?: string }> = ({ initialTab = 'dashboard' }) => {
const [activeTab, setActiveTabState] = useState(() => {
  return localStorage.getItem("activeTab") || initialTab || "dashboard";
});

const [inventoryFilter, setInventoryFilter] =
  useState("");
const setActiveTab = (tab: string) => {
  localStorage.setItem("activeTab", tab);
  setActiveTabState(tab);
};
  const { loading, error, fetchData } = useData();
const [selectedQuotationId, setSelectedQuotationIdState] = useState(() => {
  return localStorage.getItem("selectedQuotationId");
});

const [selectedChallanId, setSelectedChallanIdState] = useState(() => {
  return localStorage.getItem("selectedChallanId");
});


const [selectedInvoiceId, setSelectedInvoiceIdState] = useState(() => {
  return Number(localStorage.getItem("selectedInvoiceId")) || null;
});
const [selectedCustomer, setSelectedCustomer] = useState(null);

const setSelectedQuotationId = (id: any) => {
  localStorage.setItem("selectedQuotationId", id);
  setSelectedQuotationIdState(id);
};

const setSelectedChallanId = (id: any) => {
  localStorage.setItem("selectedChallanId", id);
  setSelectedChallanIdState(id);
};

const setSelectedInvoiceId = (id: any) => {
  localStorage.setItem("selectedInvoiceId", String(id));
  setSelectedInvoiceIdState(id);
};
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
  return <Dashboard
  onTabChange={setActiveTab}
  setSelectedInvoiceId={setSelectedInvoiceId}
  setInventoryFilter={setInventoryFilter}
/>;
      case 'pos':
        return <POSInterface 
          setActiveTab={setActiveTab}
  setSelectedQuotationId={setSelectedQuotationId}
  setSelectedChallanId={setSelectedChallanId}
  />;
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
  case "delivery-challans":
  return (
    <DeliveryChallanList
      onView={(id) => {
        setSelectedChallanId(id);  
        setActiveTab("delivery-challan-details");
      }}
    />
  );

case "delivery-challan-details":
  return (
<DeliveryChallanDetails
  key={selectedChallanId}
  id={selectedChallanId}
  onBack={() => setActiveTab("delivery-challans")}
  setActiveTab={setActiveTab}
  setSelectedQuotationId={setSelectedQuotationId}
  setSelectedChallanId={setSelectedChallanId}
  setSelectedInvoiceId={setSelectedInvoiceId}
/>
  );
case "return-challan":
  return (
    <ReturnChallanPage
      id={selectedChallanId}
      quotationId={selectedQuotationId}
      onBack={() => setActiveTab("delivery-challans")}
      setActiveTab={setActiveTab}
      setSelectedChallanId={setSelectedChallanId}
      setSelectedInvoiceId={setSelectedInvoiceId}
    />
  );
case "rental-quotations":
  return (
    <QuotationList
      onView={(id) => {
        setSelectedQuotationId(id);
        setActiveTab("quotation-details");
      }}
    />
  );

case "quotation-details":
  return (
        <QuotationDetails
          key={selectedQuotationId}
          id={selectedQuotationId}
          setActiveTab={setActiveTab}
          setSelectedQuotationId={setSelectedQuotationId}
          setSelectedChallanId={setSelectedChallanId}
          setSelectedInvoiceId={setSelectedInvoiceId}
          onBack={() => setActiveTab("rental-quotations")}
        />
  );

  case "invoices":
  return (
<InvoiceList
  onView={(id) => {
    setSelectedInvoiceId(id);
    setActiveTab("invoice-details");
  }}
/>
  );

case "invoice-details":
  return (
<InvoiceDetails
  key={selectedInvoiceId}
  id={selectedInvoiceId}
  onBack={() => setActiveTab("invoices")}
  setActiveTab={setActiveTab}
  setSelectedQuotationId={setSelectedQuotationId}
  setSelectedChallanId={setSelectedChallanId}
/>
  );
  case "ledger-list":
  return (
    <CustomerListForLedger
      onSelect={(customer) => {
        setSelectedCustomer(customer);
        setActiveTab("ledger-details");
      }}
    />
  );

  case "ledger-details":
  return (
<CustomerLedgerPage
  customer={selectedCustomer}
  onBack={() => {
    setSelectedCustomer(null);
    setActiveTab("ledger-list");
  }}
  onTabChange={setActiveTab}
  setSelectedInvoiceId={setSelectedInvoiceId}
/>
  );
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
         case 'master-customers':
    return <CustomerMaster />; 
        case 'prescriptions': // 👈 add this
    // TODO: pass real selected customer from your POS/customer picker
    return <GlassPrescriptionSlip customerId={0} customerName="" />;
     case 'Login':
        return <Login />;
      default:
        return <Dashboard onTabChange={setActiveTab} />;
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

const Index: React.FC<{ initialTab?: string }> = ({ initialTab }) => {
  return (
    <LanguageProvider>
      <DataProvider>
        <AppContent initialTab={initialTab} />
        <Toaster />
      </DataProvider>
    </LanguageProvider>
  );
};

export default Index;
