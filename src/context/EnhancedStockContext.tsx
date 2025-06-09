
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Stock {
  id?: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap?: number;
  exchange?: string;
  stockType: 'us' | 'indian' | 'crypto';
}

interface StockContextType {
  watchlist: Stock[];
  addToWatchlist: (stock: Stock) => Promise<void>;
  removeFromWatchlist: (symbol: string, stockType: string) => Promise<void>;
  searchStocks: (query: string, type: 'us' | 'indian' | 'crypto') => Promise<any[]>;
  getRealTimePrice: (symbol: string) => Promise<Stock | null>;
  loading: boolean;
  error: string | null;
}

const EnhancedStockContext = createContext<StockContextType | undefined>(undefined);

export function EnhancedStockProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load watchlist from Supabase
  useEffect(() => {
    if (user) {
      loadWatchlist();
    }
  }, [user]);

  const loadWatchlist = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const formattedStocks = data?.map(item => ({
        id: item.id,
        symbol: item.symbol,
        name: item.name,
        price: Number(item.price) || 0,
        change: 0,
        changePercent: Number(item.change_percent) || 0,
        marketCap: item.market_cap,
        exchange: item.exchange,
        stockType: item.stock_type as 'us' | 'indian' | 'crypto'
      })) || [];
      
      setWatchlist(formattedStocks);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error loading watchlist",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = async (stock: Stock) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add stocks to your watchlist",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('watchlist')
        .insert({
          user_id: user.id,
          symbol: stock.symbol,
          name: stock.name,
          stock_type: stock.stockType,
          price: stock.price,
          change_percent: stock.changePercent,
          market_cap: stock.marketCap,
          exchange: stock.exchange
        });

      if (error) throw error;

      setWatchlist(prev => [...prev, stock]);
      toast({
        title: "Stock Added",
        description: `${stock.symbol} added to your watchlist`,
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error adding stock",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchlist = async (symbol: string, stockType: string) => {
    if (!user) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', user.id)
        .eq('symbol', symbol)
        .eq('stock_type', stockType);

      if (error) throw error;

      setWatchlist(prev => prev.filter(stock => !(stock.symbol === symbol && stock.stockType === stockType)));
      toast({
        title: "Stock Removed",
        description: `${symbol} removed from your watchlist`,
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error removing stock",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const searchStocks = async (query: string, type: 'us' | 'indian' | 'crypto') => {
    if (!query || query.length < 2) return [];

    try {
      setLoading(true);
      setError(null);

      if (type === 'us') {
        const { data, error } = await supabase.functions.invoke('stock-search', {
          body: { query }
        });

        if (error) throw error;
        return data.results || [];
      } else if (type === 'indian') {
        // Mock Indian stocks for now - you can integrate with NSE API later
        const mockIndianStocks = [
          { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', exchange: 'NSE' },
          { symbol: 'TCS', name: 'Tata Consultancy Services Ltd', exchange: 'NSE' },
          { symbol: 'INFY', name: 'Infosys Ltd', exchange: 'NSE' },
          { symbol: 'HDFC', name: 'HDFC Bank Ltd', exchange: 'NSE' },
          { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', exchange: 'NSE' }
        ];
        return mockIndianStocks.filter(stock => 
          stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
          stock.name.toLowerCase().includes(query.toLowerCase())
        );
      } else {
        // Mock crypto for now - you can integrate with CoinGecko API later
        const mockCrypto = [
          { symbol: 'BTC', name: 'Bitcoin', exchange: 'Crypto' },
          { symbol: 'ETH', name: 'Ethereum', exchange: 'Crypto' },
          { symbol: 'ADA', name: 'Cardano', exchange: 'Crypto' },
          { symbol: 'DOT', name: 'Polkadot', exchange: 'Crypto' }
        ];
        return mockCrypto.filter(crypto => 
          crypto.symbol.toLowerCase().includes(query.toLowerCase()) ||
          crypto.name.toLowerCase().includes(query.toLowerCase())
        );
      }
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Search Error",
        description: err.message,
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getRealTimePrice = async (symbol: string): Promise<Stock | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-stock-data', {
        body: { symbol }
      });

      if (error) throw error;

      const quote = data["Global Quote"];
      if (!quote) return null;

      return {
        symbol: quote["01. symbol"],
        name: quote["01. symbol"], // Alpha Vantage doesn't provide name in quote
        price: parseFloat(quote["05. price"]),
        change: parseFloat(quote["09. change"]),
        changePercent: parseFloat(quote["10. change percent"].replace('%', '')),
        stockType: 'us'
      };
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  return (
    <EnhancedStockContext.Provider value={{
      watchlist,
      addToWatchlist,
      removeFromWatchlist,
      searchStocks,
      getRealTimePrice,
      loading,
      error
    }}>
      {children}
    </EnhancedStockContext.Provider>
  );
}

export function useEnhancedStock() {
  const context = useContext(EnhancedStockContext);
  if (context === undefined) {
    throw new Error('useEnhancedStock must be used within an EnhancedStockProvider');
  }
  return context;
}
