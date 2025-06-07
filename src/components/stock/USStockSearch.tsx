import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStock } from '@/context/StockContext';
import { useToast } from "@/components/ui/use-toast";
import { X, Search, Plus, Loader2, TrendingUp, TrendingDown } from "lucide-react";

interface SearchResult {
  id: string;
  symbol: string;
  name: string;
  type: 'us';
  price?: number;
  changePercent?: number;
}

interface YahooQuote {
  symbol: string;
  shortname?: string;
  longname?: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
}

interface YahooSearchResponse {
  quotes: YahooQuote[];
}

export default function USStockSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [topGainers, setTopGainers] = useState<SearchResult[]>([]);
  const [topLosers, setTopLosers] = useState<SearchResult[]>([]);
  const { watchlist, addToWatchlist, removeFromWatchlist } = useStock();
  const { toast } = useToast();

  useEffect(() => {
    fetchTopMovers();
    const interval = setInterval(fetchTopMovers, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchTopMovers = async () => {
    try {
      const response = await fetch(
        'https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?formatted=true&lang=en-US&region=US&scrIds=top_gainers&count=5',
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0',
            'Origin': 'https://finance.yahoo.com',
            'Referer': 'https://finance.yahoo.com'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const gainers = data.finance.result[0].quotes.map((quote: YahooQuote) => ({
        id: `us-${quote.symbol}`,
        symbol: quote.symbol,
        name: quote.shortname || quote.longname || quote.symbol,
        type: 'us' as const,
        price: quote.regularMarketPrice,
        changePercent: quote.regularMarketChangePercent
      }));

      const losersResponse = await fetch(
        'https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?formatted=true&lang=en-US&region=US&scrIds=top_losers&count=5',
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0',
            'Origin': 'https://finance.yahoo.com',
            'Referer': 'https://finance.yahoo.com'
          }
        }
      );

      if (!losersResponse.ok) {
        throw new Error(`HTTP error! status: ${losersResponse.status}`);
      }

      const losersData = await losersResponse.json();
      const losers = losersData.finance.result[0].quotes.map((quote: YahooQuote) => ({
        id: `us-${quote.symbol}`,
        symbol: quote.symbol,
        name: quote.shortname || quote.longname || quote.symbol,
        type: 'us' as const,
        price: quote.regularMarketPrice,
        changePercent: quote.regularMarketChangePercent
      }));

      setTopGainers(gainers);
      setTopLosers(losers);
    } catch (error) {
      console.error('Error fetching top movers:', error);
    }
  };

  const searchStocks = async () => {
    if (!query.trim() || query.length < 2) {
      toast({
        title: "Invalid Search",
        description: "Please enter at least 2 characters to search.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=5&newsCount=0`,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0',
            'Origin': 'https://finance.yahoo.com',
            'Referer': 'https://finance.yahoo.com'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as YahooSearchResponse;
      
      if (!data.quotes || data.quotes.length === 0) {
        setResults([]);
        toast({
          title: "No Results",
          description: `No US stocks found for "${query}"`,
        });
        return;
      }

      const searchResults: SearchResult[] = data.quotes
        .filter(quote => quote.symbol && quote.regularMarketPrice)
        .map((quote) => ({
          id: `us-${quote.symbol}`,
          symbol: quote.symbol,
          name: quote.shortname || quote.longname || quote.symbol,
          type: 'us',
          price: quote.regularMarketPrice,
          changePercent: quote.regularMarketChangePercent
        }));

      if (searchResults.length === 0) {
        toast({
          title: "No Valid Results",
          description: "No valid US stock data found. Please try a different search term.",
        });
      } else {
        setResults(searchResults);
      }
    } catch (error) {
      console.error('Error searching US stocks:', error);
      toast({
        title: "Search Failed",
        description: "Unable to search US stocks. Please check your internet connection and try again.",
        variant: "destructive",
      });
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = (stock: SearchResult) => {
    addToWatchlist(stock);
    toast({
      title: "Added to Watchlist",
      description: `${stock.name} (${stock.symbol}) has been added to your watchlist.`,
    });
  };

  const isInWatchlist = (symbol: string) => {
    return watchlist.some(stock => stock.symbol === symbol && stock.type === 'us');
  };

  const usWatchlist = watchlist.filter(stock => stock.type === 'us');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-semibold">US Stocks</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-lg">Search US Stocks</CardTitle>
            </CardHeader>
            <CardContent className="py-3">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search for US stocks (e.g., AAPL, MSFT, GOOGL)..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && searchStocks()}
                      className="pl-8 h-9 text-sm"
                    />
                  </div>
                  <Button 
                    onClick={searchStocks}
                    disabled={loading}
                    className="h-9 text-sm"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-3 w-3" />
                        Search
                      </>
                    )}
                  </Button>
                </div>

                {loading && (
                  <div className="text-center py-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                  </div>
                )}

                {!loading && results.length > 0 && (
                  <div className="space-y-1">
                    {results.map((result) => (
                      <div
                        key={`${result.type}-${result.symbol}`}
                        className="flex items-center justify-between p-1.5 hover:bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium">{result.name}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-2">
                            <span className="font-semibold">{result.symbol}</span>
                            {result.changePercent !== undefined && (
                              <Badge 
                                variant={result.changePercent >= 0 ? "default" : "destructive"}
                                className={result.changePercent >= 0 ? "bg-green-500 text-xs" : "text-xs"}
                              >
                                {result.changePercent >= 0 ? '+' : ''}
                                {result.changePercent.toFixed(2)}%
                              </Badge>
                            )}
                          </div>
                        </div>
                        {isInWatchlist(result.symbol) ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFromWatchlist(result.id)}
                            className="ml-2 h-7 w-7 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleAddToWatchlist(result)}
                            className="ml-2 h-7 w-7 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {!loading && query && results.length === 0 && (
                  <div className="text-center py-2 text-sm text-gray-500">
                    No US stocks found for "{query}"
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Top Gainers
                </CardTitle>
              </CardHeader>
              <CardContent className="py-3">
                <div className="space-y-1">
                  {topGainers.map((stock) => (
                    <div key={stock.id} className="flex items-center justify-between p-1.5 hover:bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="text-sm font-medium">{stock.name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          <span className="font-semibold">{stock.symbol}</span>
                          <Badge variant="default" className="bg-green-500 text-xs">
                            +{stock.changePercent?.toFixed(2)}%
                          </Badge>
                        </div>
                      </div>
                      {!isInWatchlist(stock.symbol) && (
                        <Button
                          size="sm"
                          onClick={() => handleAddToWatchlist(stock)}
                          className="ml-2 h-7 w-7 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  Top Losers
                </CardTitle>
              </CardHeader>
              <CardContent className="py-3">
                <div className="space-y-1">
                  {topLosers.map((stock) => (
                    <div key={stock.id} className="flex items-center justify-between p-1.5 hover:bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="text-sm font-medium">{stock.name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          <span className="font-semibold">{stock.symbol}</span>
                          <Badge variant="destructive" className="text-xs">
                            {stock.changePercent?.toFixed(2)}%
                          </Badge>
                        </div>
                      </div>
                      {!isInWatchlist(stock.symbol) && (
                        <Button
                          size="sm"
                          onClick={() => handleAddToWatchlist(stock)}
                          className="ml-2 h-7 w-7 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader className="py-3">
              <CardTitle className="text-lg">US Stocks Watchlist</CardTitle>
            </CardHeader>
            <CardContent className="py-3">
              {usWatchlist.length === 0 ? (
                <div className="text-center py-2 text-sm text-gray-500">
                  No US stocks in your watchlist. Search for stocks to add them.
                </div>
              ) : (
                <div className="space-y-1 max-h-[500px] overflow-y-auto pr-2">
                  {usWatchlist.map((stock) => (
                    <div
                      key={stock.id}
                      className="flex items-center justify-between p-1.5 hover:bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium">{stock.name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          <span className="font-semibold">{stock.symbol}</span>
                          {stock.changePercent !== undefined && (
                            <Badge 
                              variant={stock.changePercent >= 0 ? "default" : "destructive"}
                              className={stock.changePercent >= 0 ? "bg-green-500 text-xs" : "text-xs"}
                            >
                              {stock.changePercent >= 0 ? '+' : ''}
                              {stock.changePercent.toFixed(2)}%
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFromWatchlist(stock.id)}
                        className="ml-2 h-7 w-7 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 