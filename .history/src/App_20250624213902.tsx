import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Login } from '@/components/auth/Login';
import { Dashboard } from "./components/Dashboard";
import 'react-toastify/dist/ReactToastify.css';
import React from "react";
import { QuotationPage } from "@/components/rental/QuotationPage";


const queryClient = new QueryClient();

const AppRoutes = () => {
  const navigate = useNavigate();

  const handleLogin = (username: string, password: string) => {

    if (username && password) {

      navigate("/dashboard");
    } else {
      alert("Invalid login");
    }
  };

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login onLogin={handleLogin} onSwitchToRegister={() => {}} />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*" element={<NotFound />} />
      <Route path="/rental/quotations" element={<QuotationPage />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;