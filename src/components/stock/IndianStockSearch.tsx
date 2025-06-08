
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStock } from '@/context/StockContext';
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Loader2, Star } from "lucide-react";
import IndianStocks from './IndianStocks';

export default function IndianStockSearch() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const { watchlist, addToWatchlist, removeFromWatchlist, popularStocks } = useStock();
  const { toast } = useToast();

  const indianPopularStocks = popularStocks.filter(stock => stock.type === 'indian');

  const handleAddToWatchlist = (stock: any) => {
    const stockToAdd = {
      id: `indian-${stock.symbol}`,
      symbol: stock.symbol,
      name: stock.name,
      type: 'indian' as const,
      price: Math.random() * 1000 + 100, // Mock price
      changePercent: (Math.random() - 0.5) * 10 // Mock change
    };
    
    addToWatchlist(stockToAdd);
    toast({
      title: "Added to Watchlist",
      description: `${stock.name} (${stock.symbol}) has been added to your watchlist.`,
    });
  };

  const isInWatchlist = (symbol: string) => {
    return watchlist.some(stock => stock.symbol === symbol && stock.type === 'indian');
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Indian Stocks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search Indian stocks (e.g., RELIANCE, TCS, HDFC)..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button disabled={loading}>
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

            {/* Popular Stocks */}
            <div>
              <h3 className="text-sm font-medium mb-3">Popular Indian Stocks</h3>
              <div className="grid grid-cols-1 gap-2">
                {indianPopularStocks.map((stock) => (
                  <div
                    key={stock.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{stock.name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <span className="font-semibold">{stock.symbol}</span>
                        <Badge variant="outline" className="text-xs">NSE</Badge>
                      </div>
                    </div>
                    {isInWatchlist(stock.symbol) ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFromWatchlist(stock.id)}
                        className="ml-4"
                      >
                        <Star className="h-4 w-4 mr-2 fill-current" />
                        In Watchlist
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleAddToWatchlist(stock)}
                        className="ml-4"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add to Watchlist
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Overview */}
      <IndianStocks />
    </div>
  );
}
