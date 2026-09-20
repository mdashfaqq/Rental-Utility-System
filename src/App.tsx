import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from "@/contexts/UserContext";
import { AuthProvider } from "./components/auth/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Login } from '@/components/auth/Login';
import 'react-toastify/dist/ReactToastify.css';
import React from "react";
import { useAuth } from "./components/auth/AuthContext";
import { QuotationDetails } from "@/components/QuotationDetails";
import { QuotationList } from "@/components/QuotationList";
import { DeliveryChallanList } from "@/components/DeliveryChallanList";
import { DeliveryChallanDetails } from "@/components/DeliveryChallanDetails";
import { ReturnChallanPage } from "@/components/ReturnChallanPage";
import { CustomerLedgerPage } from "@/components/CustomerLedgerPage";
const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();

  // ⛔ WAIT until auth is resolved
  if (loading) {
    return <div className="p-6 text-center">Checking session...</div>;
  }

  return user ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  return (
  <Routes>
  <Route path="/login" element={<Login />} />


  <Route
    path="/"
    element={
      <ProtectedRoute>
        <Index initialTab="dashboard" />
      </ProtectedRoute>
    }
  />

  {/* <Route
    path="/quotation/:id"
    element={
      <ProtectedRoute>
        <QuotationDetails />
      </ProtectedRoute>
    }
  /> */}

  <Route
    path="/quotation-list"
    element={
      <ProtectedRoute>
        <QuotationList />
      </ProtectedRoute>
    }
  />

  <Route
    path="/challans"
    element={
      <ProtectedRoute>
        <DeliveryChallanList />
      </ProtectedRoute>
    }
  />

  <Route
    path="/challan/:id"
    element={
      <ProtectedRoute>
        <DeliveryChallanDetails />
      </ProtectedRoute>
    }
  />

  <Route
  path="/quotation/:id"
  element={
    <ProtectedRoute>
      <Index initialTab="quotation-details" />
    </ProtectedRoute>
  }
/>

<Route
  path="/ledger/:phone"
  element={
    <ProtectedRoute>
      <CustomerLedgerPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/return/:id"
  element={
    <ProtectedRoute>
      <ReturnChallanPage />
    </ProtectedRoute>
  }
/>
  <Route path="*" element={<NotFound />} />
</Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider> 
      <UserProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </UserProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
