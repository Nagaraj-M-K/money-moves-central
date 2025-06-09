
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Loader2, Star, TrendingUp, TrendingDown } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  image: string;
}

export default function CryptoSearch() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CryptoData[]>([]);
  const [topGainers, setTopGainers] = useState<CryptoData[]>([]);
  const [topLosers, setTopLosers] = useState<CryptoData[]>([]);
  const [popularCryptos, setPopularCryptos] = useState<CryptoData[]>([]);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user) {
      fetchWatchlist();
    }
  }, [user]);

  const fetchCryptoData = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false'
      );
      const data = await response.json();
      
      if (data && Array.isArray(data)) {
        const sorted = [...data].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
        setTopGainers(sorted.slice(0, 5));
        setTopLosers(sorted.slice(-5).reverse());
        setPopularCryptos(data.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch cryptocurrency data.",
        variant: "destructive",
      });
    }
  };

  const fetchWatchlist = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', user.id)
        .eq('stock_type', 'crypto');

      if (error) throw error;
      setWatchlist(data || []);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    }
  };

  const searchCrypto = async () => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`
      );
      const searchData = await response.json();

      if (searchData.coins && searchData.coins.length > 0) {
        const coinIds = searchData.coins.slice(0, 5).map((coin: any) => coin.id).join(',');
        const detailResponse = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&sparkline=false`
        );
        const detailData = await detailResponse.json();
        setSearchResults(detailData);
      } else {
        setSearchResults([]);
        toast({
          title: "No Results",
          description: `No cryptocurrencies found for "${query}"`,
        });
      }
    } catch (error) {
      console.error('Error searching crypto:', error);
      toast({
        title: "Search Failed",
        description: "Unable to search cryptocurrencies. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = async (crypto: CryptoData) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add cryptocurrencies to your watchlist.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('watchlist')
        .insert({
          user_id: user.id,
          symbol: crypto.symbol.toUpperCase(),
          name: crypto.name,
          stock_type: 'crypto',
          price: crypto.current_price,
          change_percent: crypto.price_change_percentage_24h,
          market_cap: crypto.market_cap
        });

      if (error) throw error;

      await fetchWatchlist();
      toast({
        title: "Added to Watchlist",
        description: `${crypto.name} has been added to your watchlist.`,
      });
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      toast({
        title: "Error",
        description: "Failed to add cryptocurrency to watchlist.",
        variant: "destructive",
      });
    }
  };

  const removeFromWatchlist = async (cryptoId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('id', cryptoId);

      if (error) throw error;

      await fetchWatchlist();
      toast({
        title: "Removed from Watchlist",
        description: "Cryptocurrency has been removed from your watchlist.",
      });
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  const isInWatchlist = (symbol: string) => {
    return watchlist.some(item => item.symbol === symbol.toUpperCase());
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    return `$${marketCap.toFixed(2)}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search Section */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <TrendingUp className="h-6 w-6 text-yellow-600" />
            Cryptocurrency Search
            <Badge variant="outline" className="ml-auto bg-yellow-100 text-yellow-700">Real-time</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search cryptocurrencies (e.g., Bitcoin, Ethereum, BTC)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchCrypto()}
                className="pl-10 border-2 focus:border-yellow-500 transition-all duration-200 hover:shadow-md"
              />
            </div>
            <Button 
              onClick={searchCrypto}
              disabled={loading}
              className="hover:scale-105 transition-transform bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
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
            <div className="space-y-3 mb-6">
              <h3 className="text-lg font-semibold">Search Results</h3>
              {searchResults.map((crypto, index) => (
                <div
                  key={crypto.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-all duration-200 animate-scale-in hover:shadow-md"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <img src={crypto.image} alt={crypto.name} className="w-8 h-8 rounded-full" />
                    <div>
                      <div className="font-semibold">{crypto.name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <span className="font-semibold">{crypto.symbol.toUpperCase()}</span>
                        <span className="font-medium">${crypto.current_price.toLocaleString()}</span>
                        <Badge 
                          variant={crypto.price_change_percentage_24h >= 0 ? "default" : "destructive"}
                          className={crypto.price_change_percentage_24h >= 0 ? "bg-green-500" : ""}
                        >
                          {crypto.price_change_percentage_24h >= 0 ? '+' : ''}
                          {crypto.price_change_percentage_24h.toFixed(2)}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {isInWatchlist(crypto.symbol) ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const watchlistItem = watchlist.find(item => item.symbol === crypto.symbol.toUpperCase());
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
                      onClick={() => addToWatchlist(crypto)}
                      className="ml-4 hover:scale-105 transition-transform bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Watchlist
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Popular Cryptocurrencies */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Popular Cryptocurrencies</h3>
            <div className="grid gap-3">
              {popularCryptos.slice(0, 5).map((crypto, index) => (
                <div
                  key={crypto.id}
                  className="flex items-center justify-between p-3 hover:bg-yellow-50 rounded-lg border transition-all duration-200 animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <img src={crypto.image} alt={crypto.name} className="w-6 h-6 rounded-full" />
                    <div>
                      <div className="font-medium text-sm">{crypto.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span className="font-semibold">{crypto.symbol.toUpperCase()}</span>
                        <span>${crypto.current_price.toLocaleString()}</span>
                        <span>{formatMarketCap(crypto.market_cap)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={crypto.price_change_percentage_24h >= 0 ? "default" : "destructive"}
                      className={`text-xs ${crypto.price_change_percentage_24h >= 0 ? "bg-green-500" : ""}`}
                    >
                      {crypto.price_change_percentage_24h >= 0 ? '+' : ''}
                      {crypto.price_change_percentage_24h.toFixed(1)}%
                    </Badge>
                    {isInWatchlist(crypto.symbol) ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const watchlistItem = watchlist.find(item => item.symbol === crypto.symbol.toUpperCase());
                          if (watchlistItem) removeFromWatchlist(watchlistItem.id);
                        }}
                      >
                        <Star className="h-3 w-3 fill-current text-yellow-500" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => addToWatchlist(crypto)}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Gainers & Losers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="flex items-center gap-2 text-green-700">
              <TrendingUp className="h-5 w-5" />
              Top Gainers (24h)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {topGainers.map((crypto, index) => (
                <div
                  key={crypto.id}
                  className="flex items-center justify-between p-3 hover:bg-green-50 rounded-lg transition-all duration-200 animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-2">
                    <img src={crypto.image} alt={crypto.name} className="w-6 h-6 rounded-full" />
                    <div>
                      <div className="font-semibold text-sm">{crypto.name}</div>
                      <div className="text-xs text-gray-600">${crypto.current_price.toFixed(2)}</div>
                    </div>
                  </div>
                  <Badge className="bg-green-500 hover:bg-green-600">
                    +{crypto.price_change_percentage_24h.toFixed(2)}%
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
              Top Losers (24h)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {topLosers.map((crypto, index) => (
                <div
                  key={crypto.id}
                  className="flex items-center justify-between p-3 hover:bg-red-50 rounded-lg transition-all duration-200 animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-2">
                    <img src={crypto.image} alt={crypto.name} className="w-6 h-6 rounded-full" />
                    <div>
                      <div className="font-semibold text-sm">{crypto.name}</div>
                      <div className="text-xs text-gray-600">${crypto.current_price.toFixed(2)}</div>
                    </div>
                  </div>
                  <Badge variant="destructive">
                    {crypto.price_change_percentage_24h.toFixed(2)}%
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
              Your Crypto Watchlist ({watchlist.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {watchlist.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No cryptocurrencies in your watchlist</p>
                <p className="text-sm">Search and add cryptos to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {watchlist.map((crypto, index) => (
                  <div
                    key={crypto.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all duration-200 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-lg">{crypto.symbol}</span>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-700">Crypto</Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{crypto.name}</p>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-lg">${crypto.price?.toFixed(2) || '-'}</span>
                        {crypto.change_percent !== null && (
                          <div className={`flex items-center gap-1 ${crypto.change_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {crypto.change_percent >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                            <span className="text-sm font-medium">
                              {crypto.change_percent >= 0 ? '+' : ''}{crypto.change_percent.toFixed(2)}%
                            </span>
                          </div>
                        )}
                        {crypto.market_cap && (
                          <span className="text-xs text-gray-500">
                            {formatMarketCap(crypto.market_cap)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeFromWatchlist(crypto.id)}
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
