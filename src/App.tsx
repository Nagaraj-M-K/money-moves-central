import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { StockProvider } from '@/context/StockContext';
import { EnhancedStockProvider } from '@/context/EnhancedStockContext';
import { UserProvider } from '@/context/UserContext';

import Index from '@/pages/Index';
import SignIn from '@/pages/SignIn';
import SignUp from '@/pages/SignUp';
import Profile from '@/pages/Profile';
import Expenses from '@/pages/Expenses';
import Transactions from '@/pages/Transactions';
import Analytics from '@/pages/Analytics';
import PortfolioPage from '@/pages/Portfolio';
import StockDetail from '@/pages/StockDetail';

import NotFound from '@/pages/NotFound';
import './App.css';
import { GoogleCallback } from '@/components/auth/GoogleCallback';

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/signin" element={!user ? <SignIn /> : <Navigate to="/" replace />} />
      <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/" replace />} />
      <Route path="/auth/callback" element={<GoogleCallback />} />
      <Route path="/" element={<Index />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/expenses" element={<Expenses />} />
      <Route path="/transactions" element={<Transactions />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/portfolio" element={<PortfolioPage />} />
      <Route path="/stock/:type/:symbol" element={<StockDetail />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserProvider>
          <StockProvider>
            <EnhancedStockProvider>
              <Router>
                <div className="min-h-screen bg-background w-full">
                  <AppRoutes />
                </div>
                <Toaster />
              </Router>
            </EnhancedStockProvider>
          </StockProvider>
        </UserProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
