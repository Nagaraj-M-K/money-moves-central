
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStock } from '@/context/StockContext';
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Loader2, Star } from "lucide-react";
import CryptoStocks from './CryptoStocks';

interface CryptoSearchResult {
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
  const [results, setResults] = useState<CryptoSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [popularCryptos, setPopularCryptos] = useState<CryptoSearchResult[]>([]);
  const { watchlist, addToWatchlist, removeFromWatchlist } = useStock();
  const { toast } = useToast();

  useEffect(() => {
    // Fetch popular cryptocurrencies on component mount
    fetchPopularCryptos();
  }, []);

  const fetchPopularCryptos = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false'
      );
      const data = await response.json();
      setPopularCryptos(data);
    } catch (error) {
      console.error('Error fetching popular cryptos:', error);
    }
  };

  const searchCrypto = async () => {
    if (!query.trim()) {
      toast({
        title: "Invalid Search",
        description: "Please enter a cryptocurrency name or symbol.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`
      );
      const searchData = await response.json();

      if (searchData.coins && searchData.coins.length > 0) {
        // Get detailed data for search results
        const coinIds = searchData.coins.slice(0, 5).map((coin: any) => coin.id).join(',');
        const detailResponse = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&sparkline=false`
        );
        const detailData = await detailResponse.json();
        setResults(detailData);
      } else {
        setResults([]);
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
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = (crypto: CryptoSearchResult) => {
    const cryptoToAdd = {
      id: `crypto-${crypto.id}`,
      symbol: crypto.symbol.toUpperCase(),
      name: crypto.name,
      type: 'crypto' as const,
      price: crypto.current_price,
      changePercent: crypto.price_change_percentage_24h,
      market_cap: crypto.market_cap
    };
    
    addToWatchlist(cryptoToAdd);
    toast({
      title: "Added to Watchlist",
      description: `${crypto.name} (${crypto.symbol.toUpperCase()}) has been added to your watchlist.`,
    });
  };

  const isInWatchlist = (symbol: string) => {
    return watchlist.some(item => item.symbol === symbol.toUpperCase() && item.type === 'crypto');
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Cryptocurrencies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search crypto (e.g., Bitcoin, Ethereum, BTC)..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchCrypto()}
                  className="pl-8"
                />
              </div>
              <Button 
                onClick={searchCrypto}
                disabled={loading}
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
            {results.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3">Search Results</h3>
                <div className="space-y-2">
                  {results.map((crypto) => (
                    <div
                      key={crypto.id}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg border"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <img src={crypto.image} alt={crypto.name} className="w-8 h-8 rounded-full" />
                        <div>
                          <div className="font-medium">{crypto.name}</div>
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
                          onClick={() => removeFromWatchlist(`crypto-${crypto.id}`)}
                          className="ml-4"
                        >
                          <Star className="h-4 w-4 mr-2 fill-current" />
                          In Watchlist
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleAddToWatchlist(crypto)}
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
            )}

            {/* Popular Cryptocurrencies */}
            {popularCryptos.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3">Popular Cryptocurrencies</h3>
                <div className="grid grid-cols-1 gap-2">
                  {popularCryptos.slice(0, 5).map((crypto) => (
                    <div
                      key={crypto.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <img src={crypto.image} alt={crypto.name} className="w-6 h-6 rounded-full" />
                        <div>
                          <div className="font-medium text-sm">{crypto.name}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-2">
                            <span className="font-semibold">{crypto.symbol.toUpperCase()}</span>
                            <span>${crypto.current_price.toLocaleString()}</span>
                            <Badge 
                              variant={crypto.price_change_percentage_24h >= 0 ? "default" : "destructive"}
                              className={`text-xs ${crypto.price_change_percentage_24h >= 0 ? "bg-green-500" : ""}`}
                            >
                              {crypto.price_change_percentage_24h >= 0 ? '+' : ''}
                              {crypto.price_change_percentage_24h.toFixed(1)}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {isInWatchlist(crypto.symbol) ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFromWatchlist(`crypto-${crypto.id}`)}
                        >
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Added
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleAddToWatchlist(crypto)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Market Overview */}
      <CryptoStocks />
    </div>
  );
}
