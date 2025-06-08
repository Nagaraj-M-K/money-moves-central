
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStock } from '@/context/StockContext';
import { useToast } from "@/hooks/use-toast";
import { X, Search, Plus, Loader2, Star } from "lucide-react";
import USStocks from './USStocks';

interface SearchResult {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  exchange: string;
}

export default function USStockSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { watchlist, addToWatchlist, removeFromWatchlist } = useStock();
  const { toast } = useToast();

  const searchStocks = async () => {
    if (!query.trim() || query.length < 1) {
      toast({
        title: "Invalid Search",
        description: "Please enter a stock symbol or company name.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Using Yahoo Finance API for real-time data
      const response = await fetch(
        `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      
      if (data.quotes && data.quotes.length > 0) {
        const searchResults = await Promise.all(
          data.quotes.slice(0, 5).map(async (quote: any) => {
            try {
              // Get detailed quote data
              const quoteResponse = await fetch(
                `https://query1.finance.yahoo.com/v8/finance/chart/${quote.symbol}?interval=1d&range=1d`,
                {
                  headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                  }
                }
              );
              const quoteData = await quoteResponse.json();
              
              if (quoteData.chart?.result?.[0]) {
                const result = quoteData.chart.result[0];
                const meta = result.meta;
                
                return {
                  symbol: quote.symbol,
                  name: quote.shortname || quote.longname || quote.symbol,
                  price: meta.regularMarketPrice || 0,
                  changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100) || 0,
                  exchange: quote.exchange || 'NASDAQ'
                };
              }
            } catch (error) {
              console.error('Error fetching quote data:', error);
            }
            
            return {
              symbol: quote.symbol,
              name: quote.shortname || quote.longname || quote.symbol,
              price: 0,
              changePercent: 0,
              exchange: quote.exchange || 'NASDAQ'
            };
          })
        );

        setResults(searchResults.filter(result => result.symbol));
      } else {
        setResults([]);
        toast({
          title: "No Results",
          description: `No stocks found for "${query}"`,
        });
      }
    } catch (error) {
      console.error('Error searching stocks:', error);
      toast({
        title: "Search Failed",
        description: "Unable to search stocks. Please try again.",
        variant: "destructive",
      });
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = (stock: SearchResult) => {
    const stockToAdd = {
      id: `us-${stock.symbol}`,
      symbol: stock.symbol,
      name: stock.name,
      type: 'us' as const,
      price: stock.price,
      changePercent: stock.changePercent
    };
    
    addToWatchlist(stockToAdd);
    toast({
      title: "Added to Watchlist",
      description: `${stock.name} (${stock.symbol}) has been added to your watchlist.`,
    });
  };

  const isInWatchlist = (symbol: string) => {
    return watchlist.some(stock => stock.symbol === symbol && stock.type === 'us');
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search US Stocks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search stocks (e.g., AAPL, Tesla, Microsoft)..."
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

            {results.length > 0 && (
              <div className="space-y-2">
                {results.map((result) => (
                  <div
                    key={result.symbol}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg border"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-lg">{result.name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <span className="font-semibold">{result.symbol}</span>
                        <Badge variant="outline" className="text-xs">
                          {result.exchange}
                        </Badge>
                        {result.price > 0 && (
                          <>
                            <span className="font-medium">${result.price.toFixed(2)}</span>
                            <Badge 
                              variant={result.changePercent >= 0 ? "default" : "destructive"}
                              className={result.changePercent >= 0 ? "bg-green-500" : ""}
                            >
                              {result.changePercent >= 0 ? '+' : ''}
                              {result.changePercent.toFixed(2)}%
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                    {isInWatchlist(result.symbol) ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFromWatchlist(`us-${result.symbol}`)}
                        className="ml-4"
                      >
                        <Star className="h-4 w-4 mr-2 fill-current" />
                        In Watchlist
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
          </div>
        </CardContent>
      </Card>

      {/* Market Overview */}
      <USStocks />
    </div>
  );
}
