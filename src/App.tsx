
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/AuthContext';
import { StockProvider } from '@/context/StockContext';
import { EnhancedStockProvider } from '@/context/EnhancedStockContext';
import { UserProvider } from '@/context/UserContext';
import Index from '@/pages/Index';
import SignIn from '@/pages/SignIn';
import SignUp from '@/pages/SignUp';
import Expenses from '@/pages/Expenses';
import Transactions from '@/pages/Transactions';
import PortfolioPage from '@/pages/Portfolio';
import NotFound from '@/pages/NotFound';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserProvider>
          <StockProvider>
            <EnhancedStockProvider>
              <Router>
                <div className="min-h-screen bg-background">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/expenses" element={<Expenses />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/portfolio" element={<PortfolioPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
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
