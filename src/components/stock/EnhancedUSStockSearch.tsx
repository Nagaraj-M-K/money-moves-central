
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEnhancedStock } from '@/context/EnhancedStockContext';
import { Search, Plus, TrendingUp, TrendingDown, X, RefreshCw } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

export default function EnhancedUSStockSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const { watchlist, addToWatchlist, removeFromWatchlist, searchStocks, getRealTimePrice, loading } = useEnhancedStock();
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setSearching(true);
    try {
      const results = await searchStocks(searchTerm, 'us');
      setSearchResults(results);
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Unable to search stocks. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSearching(false);
    }
  };

  const handleAddStock = async (result: any) => {
    try {
      // Get real-time price data
      const priceData = await getRealTimePrice(result.symbol);
      
      const stock = {
        symbol: result.symbol,
        name: result.name,
        price: priceData?.price || 0,
        change: priceData?.change || 0,
        changePercent: priceData?.changePercent || 0,
        exchange: result.region,
        stockType: 'us' as const
      };
      
      await addToWatchlist(stock);
      setSearchResults(prev => prev.filter(r => r.symbol !== result.symbol));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add stock to watchlist",
        variant: "destructive"
      });
    }
  };

  const refreshPrices = async () => {
    for (const stock of watchlist.filter(s => s.stockType === 'us')) {
      const priceData = await getRealTimePrice(stock.symbol);
      if (priceData) {
        // Update the stock in watchlist - you might want to update this in Supabase too
        console.log(`Updated ${stock.symbol}: $${priceData.price}`);
      }
    }
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm.length >= 2) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search Section */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            US Stock Search
            <Button
              onClick={refreshPrices}
              size="sm"
              variant="outline"
              className="ml-auto hover:bg-blue-100"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Prices
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search US stocks (e.g., AAPL, MSFT, GOOGL)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-2 focus:border-blue-500 transition-colors"
            />
          </div>
          
          {searching && (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Searching stocks...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {searchResults.map((result, index) => (
                <div
                  key={result.symbol}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">{result.symbol}</span>
                      <Badge variant="outline" className="text-xs">
                        {result.region}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm">{result.name}</p>
                    <p className="text-xs text-gray-500">
                      Match Score: {(parseFloat(result.matchScore) * 100).toFixed(0)}%
                    </p>
                  </div>
                  <Button
                    onClick={() => handleAddStock(result)}
                    size="sm"
                    className="hover:scale-105 transition-transform"
                    disabled={watchlist.some(stock => stock.symbol === result.symbol)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {watchlist.some(stock => stock.symbol === result.symbol) ? 'Added' : 'Add'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Watchlist */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Your US Stocks Watchlist</CardTitle>
        </CardHeader>
        <CardContent>
          {watchlist.filter(stock => stock.stockType === 'us').length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No US stocks in your watchlist</p>
              <p className="text-sm">Search and add stocks to get started</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {watchlist.filter(stock => stock.stockType === 'us').map((stock, index) => (
                <div
                  key={`${stock.symbol}-${stock.stockType}`}
                  className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">{stock.symbol}</span>
                      <Badge variant="outline">{stock.exchange}</Badge>
                    </div>
                    <p className="text-gray-600 text-sm">{stock.name}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="font-bold text-lg">${stock.price.toFixed(2)}</span>
                      <div className={`flex items-center gap-1 ${stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stock.changePercent >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        <span className="text-sm font-medium">
                          {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => removeFromWatchlist(stock.symbol, stock.stockType)}
                    size="sm"
                    variant="destructive"
                    className="hover:scale-105 transition-transform"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
