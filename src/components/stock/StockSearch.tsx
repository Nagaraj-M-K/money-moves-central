import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStock } from '@/context/StockContext';
import { useToast } from "@/components/ui/use-toast";
import { X, Search, Plus, Loader2 } from "lucide-react";

interface SearchResult {
  id: string;
  symbol: string;
  name: string;
  type: 'us' | 'indian' | 'crypto';
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

export default function StockSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { watchlist, addToWatchlist, removeFromWatchlist } = useStock();
  const { toast } = useToast();

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
      // Search US stocks using Yahoo Finance API with proper headers
      const response = await fetch(
        `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`,
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
          description: `No stocks found for "${query}"`,
        });
        return;
      }

      // Filter out invalid quotes and map to our format
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
          description: "No valid stock data found. Please try a different search term.",
        });
      } else {
        setResults(searchResults);
      }
    } catch (error) {
      console.error('Error searching stocks:', error);
      toast({
        title: "Search Failed",
        description: "Unable to search stocks. Please check your internet connection and try again.",
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
    return watchlist.some(stock => stock.symbol === symbol);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Search Stocks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for stocks (e.g., AAPL, MSFT, GOOGL)..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchStocks()}
                  className="pl-8"
                />
              </div>
              <Button 
                onClick={searchStocks}
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

            {loading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="space-y-2">
                {results.map((result) => (
                  <div
                    key={`${result.type}-${result.symbol}`}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg border"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-lg">{result.name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <span className="font-semibold">{result.symbol}</span>
                        <Badge variant="outline">
                          {result.type.toUpperCase()}
                        </Badge>
                        {result.price && (
                          <span className="font-medium">${result.price.toFixed(2)}</span>
                        )}
                        {result.changePercent !== undefined && (
                          <Badge 
                            variant={result.changePercent >= 0 ? "default" : "destructive"}
                            className={result.changePercent >= 0 ? "bg-green-500" : ""}
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
                        className="ml-4"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleAddToWatchlist(result)}
                        className="ml-4"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add to Watchlist
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!loading && query && results.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No results found for "{query}"
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Watchlist</CardTitle>
        </CardHeader>
        <CardContent>
          {watchlist.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              Your watchlist is empty. Search for stocks to add them.
            </div>
          ) : (
            <div className="space-y-2">
              {watchlist.map((stock) => (
                <div
                  key={stock.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg border"
                >
                  <div className="flex-1">
                    <div className="font-medium text-lg">{stock.name}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                      <span className="font-semibold">{stock.symbol}</span>
                      <Badge variant="outline">
                        {stock.type.toUpperCase()}
                      </Badge>
                      {stock.price && (
                        <span className="font-medium">${stock.price.toFixed(2)}</span>
                      )}
                      {stock.changePercent !== undefined && (
                        <Badge 
                          variant={stock.changePercent >= 0 ? "default" : "destructive"}
                          className={stock.changePercent >= 0 ? "bg-green-500" : ""}
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
                    className="ml-4"
                  >
                    <X className="h-4 w-4 mr-2" />
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