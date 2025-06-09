
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, TrendingUp } from "lucide-react";

const mockCryptos = [
  { symbol: 'BTC', name: 'Bitcoin', price: 65432.10, change: 3.45, marketCap: 1280000000000 },
  { symbol: 'ETH', name: 'Ethereum', price: 3421.55, change: -1.23, marketCap: 411000000000 },
  { symbol: 'ADA', name: 'Cardano', price: 0.45, change: 2.67, marketCap: 15800000000 },
  { symbol: 'DOT', name: 'Polkadot', price: 7.89, change: -0.87, marketCap: 9200000000 },
  { symbol: 'SOL', name: 'Solana', price: 142.33, change: 5.12, marketCap: 63400000000 }
];

export default function CryptoSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [watchlist, setWatchlist] = useState<any[]>([]);

  const filteredCryptos = mockCryptos.filter(crypto =>
    crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToWatchlist = (crypto: any) => {
    if (!watchlist.find(w => w.symbol === crypto.symbol)) {
      setWatchlist([...watchlist, crypto]);
    }
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(watchlist.filter(crypto => crypto.symbol !== symbol));
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    return `$${marketCap.toFixed(2)}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border-0 shadow-lg bg-gradient-to-r from-yellow-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <TrendingUp className="h-6 w-6 text-yellow-600" />
            Cryptocurrency Search
            <Badge variant="outline" className="ml-auto">Real-time</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search cryptocurrencies (e.g., BTC, ETH, ADA)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-2 focus:border-yellow-500 transition-colors"
            />
          </div>
        </CardContent>
      </Card>

      {searchTerm && filteredCryptos.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {filteredCryptos.map((crypto, index) => (
                <div
                  key={crypto.symbol}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">{crypto.symbol}</span>
                      <Badge variant="outline">Crypto</Badge>
                    </div>
                    <p className="text-gray-600 text-sm">{crypto.name}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="font-bold text-lg">${crypto.price.toFixed(2)}</span>
                      <span className={`text-sm ${crypto.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {crypto.change >= 0 ? '+' : ''}{crypto.change}%
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatMarketCap(crypto.marketCap)}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => addToWatchlist(crypto)}
                    size="sm"
                    className="hover:scale-105 transition-transform"
                    disabled={watchlist.some(w => w.symbol === crypto.symbol)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {watchlist.some(w => w.symbol === crypto.symbol) ? 'Added' : 'Add'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Your Crypto Watchlist</CardTitle>
        </CardHeader>
        <CardContent>
          {watchlist.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No cryptocurrencies in your watchlist</p>
              <p className="text-sm">Search and add cryptos to get started</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {watchlist.map((crypto, index) => (
                <div
                  key={crypto.symbol}
                  className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">{crypto.symbol}</span>
                      <Badge variant="outline">Crypto</Badge>
                    </div>
                    <p className="text-gray-600 text-sm">{crypto.name}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="font-bold text-lg">${crypto.price.toFixed(2)}</span>
                      <span className={`text-sm ${crypto.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {crypto.change >= 0 ? '+' : ''}{crypto.change}%
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatMarketCap(crypto.marketCap)}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => removeFromWatchlist(crypto.symbol)}
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
