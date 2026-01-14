import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import NewTransactionForm from "./pages/sales/TransactionForm";
import { Wrapper } from "./components/layout/Wrapper";
import TransactionListPage from "./pages/sales/TransactionListPage";
import CustomerListPage from "./pages/customers/CustomerListPage";
import ProductListPage from "./pages/inventory/ProductListPage";
import ServiceListPage from "./pages/services/ServiceListPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />

            {/* Transaction routes */}
            <Route
              path="/sales/transactions"
              element={
                <Wrapper>
                  <TransactionListPage />
                </Wrapper>
              }
            />
            <Route
              path="/sales/new"
              element={
                <Wrapper>
                  <EnhancedPOSForm />
                </Wrapper>
              }
            />

            {/* Customer routes */}
            <Route
              path="/customers"
              element={
                <Wrapper>
                  <CustomerListPage />
                </Wrapper>
              }
            />

            {/* Inventory routes */}
            <Route
              path="/inventory"
              element={
                <Wrapper>
                  <ProductListPage />
                </Wrapper>
              }
            />

            {/* Service routes */}
            <Route
              path="/services/orders"
              element={
                <Wrapper>
                  <ServiceListPage />
                </Wrapper>
              }
            />
            <Route
              path="/services/new"
              element={
                <Wrapper>
                  <EnhancedPOSForm />
                </Wrapper>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
