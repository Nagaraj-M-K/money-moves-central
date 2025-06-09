
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, TrendingUp } from "lucide-react";

const mockIndianStocks = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', price: 2456.30, change: 2.15, exchange: 'NSE' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3892.45, change: -0.85, exchange: 'NSE' },
  { symbol: 'INFY', name: 'Infosys Limited', price: 1654.20, change: 1.25, exchange: 'NSE' },
  { symbol: 'HDFC', name: 'HDFC Bank Limited', price: 1587.90, change: -0.45, exchange: 'NSE' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Limited', price: 987.35, change: 0.75, exchange: 'NSE' }
];

export default function IndianStockSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [watchlist, setWatchlist] = useState<any[]>([]);

  const filteredStocks = mockIndianStocks.filter(stock =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToWatchlist = (stock: any) => {
    if (!watchlist.find(w => w.symbol === stock.symbol)) {
      setWatchlist([...watchlist, stock]);
    }
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(watchlist.filter(stock => stock.symbol !== symbol));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-50 to-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <TrendingUp className="h-6 w-6 text-orange-600" />
            Indian Stock Search
            <Badge variant="outline" className="ml-auto">NSE/BSE</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search Indian stocks (e.g., RELIANCE, TCS, INFY)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-2 focus:border-orange-500 transition-colors"
            />
          </div>
        </CardContent>
      </Card>

      {searchTerm && filteredStocks.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {filteredStocks.map((stock, index) => (
                <div
                  key={stock.symbol}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">{stock.symbol}</span>
                      <Badge variant="outline">{stock.exchange}</Badge>
                    </div>
                    <p className="text-gray-600 text-sm">{stock.name}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="font-bold text-lg">₹{stock.price.toFixed(2)}</span>
                      <span className={`text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stock.change >= 0 ? '+' : ''}{stock.change}%
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => addToWatchlist(stock)}
                    size="sm"
                    className="hover:scale-105 transition-transform"
                    disabled={watchlist.some(w => w.symbol === stock.symbol)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {watchlist.some(w => w.symbol === stock.symbol) ? 'Added' : 'Add'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Your Indian Stocks Watchlist</CardTitle>
        </CardHeader>
        <CardContent>
          {watchlist.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No Indian stocks in your watchlist</p>
              <p className="text-sm">Search and add stocks to get started</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {watchlist.map((stock, index) => (
                <div
                  key={stock.symbol}
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
                      <span className="font-bold text-lg">₹{stock.price.toFixed(2)}</span>
                      <span className={`text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stock.change >= 0 ? '+' : ''}{stock.change}%
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => removeFromWatchlist(stock.symbol)}
                    size="sm"
                    variant="destructive"
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
    </div>
  );
}
