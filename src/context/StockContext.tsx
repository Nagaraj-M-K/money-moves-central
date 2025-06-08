import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Stock {
  id: string;
  symbol: string;
  name: string;
  type: 'us' | 'indian' | 'crypto';
  price?: number;
  change?: number;
  changePercent?: number;
  market_cap?: number;
}

interface StockContextType {
  watchlist: Stock[];
  popularStocks: Stock[];
  addToWatchlist: (stock: Stock) => void;
  removeFromWatchlist: (stockId: string) => void;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

export function StockProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useState<Stock[]>(() => {
    const saved = localStorage.getItem('watchlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [popularStocks, setPopularStocks] = useState<Stock[]>([
    // US Stocks
    { id: 'AAPL', symbol: 'AAPL', name: 'Apple Inc.', type: 'us' },
    { id: 'MSFT', symbol: 'MSFT', name: 'Microsoft Corporation', type: 'us' },
    { id: 'GOOGL', symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'us' },
    { id: 'AMZN', symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'us' },
    { id: 'TSLA', symbol: 'TSLA', name: 'Tesla Inc.', type: 'us' },
    
    // Indian Stocks
    { id: 'RELIANCE', symbol: 'RELIANCE', name: 'Reliance Industries', type: 'indian' },
    { id: 'TCS', symbol: 'TCS', name: 'Tata Consultancy Services', type: 'indian' },
    { id: 'HDFCBANK', symbol: 'HDFCBANK', name: 'HDFC Bank', type: 'indian' },
    { id: 'INFY', symbol: 'INFY', name: 'Infosys', type: 'indian' },
    { id: 'ICICIBANK', symbol: 'ICICIBANK', name: 'ICICI Bank', type: 'indian' },
    
    // Cryptocurrencies
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', type: 'crypto' },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', type: 'crypto' },
    { id: 'binancecoin', symbol: 'BNB', name: 'Binance Coin', type: 'crypto' },
    { id: 'cardano', symbol: 'ADA', name: 'Cardano', type: 'crypto' },
    { id: 'solana', symbol: 'SOL', name: 'Solana', type: 'crypto' },
  ]);

  useEffect(() => {
    // Save watchlist to localStorage whenever it changes
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const addToWatchlist = (stock: Stock) => {
    setWatchlist(prev => {
      if (!prev.find(s => s.id === stock.id)) {
        return [...prev, stock];
      }
      return prev;
    });
  };

  const removeFromWatchlist = (stockId: string) => {
    setWatchlist(prev => prev.filter(stock => stock.id !== stockId));
  };

  return (
    <StockContext.Provider value={{
      watchlist,
      popularStocks,
      addToWatchlist,
      removeFromWatchlist,
    }}>
      {children}
    </StockContext.Provider>
  );
}

export function useStock() {
  const context = useContext(StockContext);
  if (context === undefined) {
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
}
