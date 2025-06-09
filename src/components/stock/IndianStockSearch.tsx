
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Loader2, Star, TrendingUp, TrendingDown } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface IndianStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  exchange: string;
}

const mockIndianStocks: IndianStock[] = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', price: 2456.30, change: 45.20, changePercent: 1.88, exchange: 'NSE' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3892.45, change: -32.15, changePercent: -0.82, exchange: 'NSE' },
  { symbol: 'INFY', name: 'Infosys Limited', price: 1654.20, change: 28.75, changePercent: 1.77, exchange: 'NSE' },
  { symbol: 'HDFC', name: 'HDFC Bank Limited', price: 1587.90, change: -12.45, changePercent: -0.78, exchange: 'NSE' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Limited', price: 987.35, change: 18.90, changePercent: 1.95, exchange: 'NSE' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Limited', price: 876.40, change: -8.60, changePercent: -0.97, exchange: 'NSE' },
  { symbol: 'ITC', name: 'ITC Limited', price: 432.15, change: 6.25, changePercent: 1.47, exchange: 'NSE' },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', price: 1789.80, change: -15.30, changePercent: -0.85, exchange: 'NSE' },
  { symbol: 'LT', name: 'Larsen & Toubro', price: 2345.60, change: 42.10, changePercent: 1.83, exchange: 'NSE' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', price: 2567.85, change: -22.40, changePercent: -0.86, exchange: 'NSE' }
];

export default function IndianStockSearch() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<IndianStock[]>([]);
  const [topGainers, setTopGainers] = useState<IndianStock[]>([]);
  const [topLosers, setTopLosers] = useState<IndianStock[]>([]);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Simulate real-time data with slight variations
    const updateData = () => {
      const updatedStocks = mockIndianStocks.map(stock => ({
        ...stock,
        price: stock.price + (Math.random() - 0.5) * 20,
        change: stock.change + (Math.random() - 0.5) * 10,
        changePercent: stock.changePercent + (Math.random() - 0.5) * 2
      }));

      const sorted = [...updatedStocks].sort((a, b) => b.changePercent - a.changePercent);
      setTopGainers(sorted.slice(0, 5));
      setTopLosers(sorted.slice(-5).reverse());
    };

    updateData();
    const interval = setInterval(updateData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user) {
      fetchWatchlist();
    }
  }, [user]);

  const fetchWatchlist = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', user.id)
        .eq('stock_type', 'indian');

      if (error) throw error;
      setWatchlist(data || []);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    }
  };

  const searchStocks = () => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const filtered = mockIndianStocks.filter(stock =>
        stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
        stock.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
      setLoading(false);
    }, 1000);
  };

  const addToWatchlist = async (stock: IndianStock) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add stocks to your watchlist.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('watchlist')
        .insert({
          user_id: user.id,
          symbol: stock.symbol,
          name: stock.name,
          stock_type: 'indian',
          price: stock.price,
          change_percent: stock.changePercent,
          exchange: stock.exchange
        });

      if (error) throw error;

      await fetchWatchlist();
      toast({
        title: "Added to Watchlist",
        description: `${stock.name} has been added to your watchlist.`,
      });
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      toast({
        title: "Error",
        description: "Failed to add stock to watchlist.",
        variant: "destructive",
      });
    }
  };

  const removeFromWatchlist = async (stockId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('id', stockId);

      if (error) throw error;

      await fetchWatchlist();
      toast({
        title: "Removed from Watchlist",
        description: "Stock has been removed from your watchlist.",
      });
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      toast({
        title: "Error",
        description: "Failed to remove stock from watchlist.",
        variant: "destructive",
      });
    }
  };

  const isInWatchlist = (symbol: string) => {
    return watchlist.some(item => item.symbol === symbol);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search Section */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <TrendingUp className="h-6 w-6 text-orange-600" />
            Indian Stock Search
            <Badge variant="outline" className="ml-auto bg-orange-100 text-orange-700">NSE/BSE</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search Indian stocks (e.g., RELIANCE, TCS, INFY)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchStocks()}
                className="pl-10 border-2 focus:border-orange-500 transition-all duration-200 hover:shadow-md"
              />
            </div>
            <Button 
              onClick={searchStocks}
              disabled={loading}
              className="hover:scale-105 transition-transform bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Search Results</h3>
              {searchResults.map((stock, index) => (
                <div
                  key={stock.symbol}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-all duration-200 animate-scale-in hover:shadow-md"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-lg">{stock.symbol}</span>
                      <Badge variant="outline" className="bg-orange-100 text-orange-700">{stock.exchange}</Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{stock.name}</p>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-lg">₹{stock.price.toFixed(2)}</span>
                      <div className={`flex items-center gap-1 ${stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stock.changePercent >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        <span className="text-sm font-medium">
                          {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  {isInWatchlist(stock.symbol) ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const watchlistItem = watchlist.find(item => item.symbol === stock.symbol);
                        if (watchlistItem) removeFromWatchlist(watchlistItem.id);
                      }}
                      className="ml-4 hover:scale-105 transition-transform"
                    >
                      <Star className="h-4 w-4 mr-2 fill-current text-yellow-500" />
                      In Watchlist
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => addToWatchlist(stock)}
                      className="ml-4 hover:scale-105 transition-transform bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Watchlist
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Gainers & Losers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="flex items-center gap-2 text-green-700">
              <TrendingUp className="h-5 w-5" />
              Top Gainers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {topGainers.map((stock, index) => (
                <div
                  key={stock.symbol}
                  className="flex items-center justify-between p-3 hover:bg-green-50 rounded-lg transition-all duration-200 animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div>
                    <div className="font-semibold">{stock.symbol}</div>
                    <div className="text-sm text-gray-600">₹{stock.price.toFixed(2)}</div>
                  </div>
                  <Badge className="bg-green-500 hover:bg-green-600">
                    +{stock.changePercent.toFixed(2)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-red-50 to-rose-50">
            <CardTitle className="flex items-center gap-2 text-red-700">
              <TrendingDown className="h-5 w-5" />
              Top Losers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {topLosers.map((stock, index) => (
                <div
                  key={stock.symbol}
                  className="flex items-center justify-between p-3 hover:bg-red-50 rounded-lg transition-all duration-200 animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div>
                    <div className="font-semibold">{stock.symbol}</div>
                    <div className="text-sm text-gray-600">₹{stock.price.toFixed(2)}</div>
                  </div>
                  <Badge variant="destructive">
                    {stock.changePercent.toFixed(2)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Watchlist */}
      {user && (
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Your Watchlist ({watchlist.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {watchlist.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No Indian stocks in your watchlist</p>
                <p className="text-sm">Search and add stocks to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {watchlist.map((stock, index) => (
                  <div
                    key={stock.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all duration-200 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-lg">{stock.symbol}</span>
                        <Badge variant="outline" className="bg-orange-100 text-orange-700">{stock.exchange}</Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{stock.name}</p>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-lg">₹{stock.price?.toFixed(2) || '-'}</span>
                        {stock.change_percent !== null && (
                          <div className={`flex items-center gap-1 ${stock.change_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stock.change_percent >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                            <span className="text-sm font-medium">
                              {stock.change_percent >= 0 ? '+' : ''}{stock.change_percent.toFixed(2)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeFromWatchlist(stock.id)}
                      className="hover:scale-105 transition-transform"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
