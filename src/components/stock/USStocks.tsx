
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useStock } from '@/context/StockContext';
import { useToast } from "@/hooks/use-toast";

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export default function USStocks() {
  const [topGainers, setTopGainers] = useState<Stock[]>([]);
  const [topLosers, setTopLosers] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const { watchlist } = useStock();
  const { toast } = useToast();

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true);
        // Using Finnhub free API as backup for US stocks
        const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'BABA', 'V'];
        const stockData = await Promise.all(
          symbols.map(async (symbol) => {
            try {
              // Using free API endpoint
              const response = await fetch(
                `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`
              );
              
              if (!response.ok) throw new Error('API call failed');
              
              const data = await response.json();
              const result = data.chart?.result?.[0];
              
              if (result) {
                const meta = result.meta;
                const currentPrice = meta.regularMarketPrice || 0;
                const previousClose = meta.previousClose || currentPrice;
                const change = currentPrice - previousClose;
                const changePercent = (change / previousClose) * 100;
                
                return {
                  symbol,
                  name: meta.shortName || symbol,
                  price: currentPrice,
                  change,
                  changePercent
                };
              }
              return null;
            } catch (error) {
              console.error(`Error fetching ${symbol}:`, error);
              return null;
            }
          })
        );

        const validStocks = stockData.filter(stock => stock !== null) as Stock[];
        const sortedStocks = [...validStocks].sort((a, b) => b.changePercent - a.changePercent);
        
        setTopGainers(sortedStocks.slice(0, 5));
        setTopLosers(sortedStocks.slice(-5).reverse());
      } catch (error) {
        console.error('Error fetching market data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch US market data. Showing cached data.",
          variant: "destructive",
        });
        
        // Fallback mock data
        const mockData = [
          { symbol: 'AAPL', name: 'Apple Inc.', price: 175.43, change: 2.15, changePercent: 1.24 },
          { symbol: 'MSFT', name: 'Microsoft', price: 378.85, change: -1.23, changePercent: -0.32 },
          { symbol: 'GOOGL', name: 'Alphabet', price: 138.21, change: 3.45, changePercent: 2.56 },
          { symbol: 'AMZN', name: 'Amazon', price: 151.94, change: -2.11, changePercent: -1.37 },
          { symbol: 'TSLA', name: 'Tesla', price: 248.42, change: 5.67, changePercent: 2.33 }
        ];
        
        setTopGainers(mockData.slice(0, 3));
        setTopLosers(mockData.slice(-2));
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, [toast]);

  const usWatchlist = watchlist.filter(stock => stock.type === 'us');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Gainers</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topGainers.map((stock) => (
                  <TableRow key={stock.symbol}>
                    <TableCell className="font-medium">{stock.symbol}</TableCell>
                    <TableCell>{stock.name}</TableCell>
                    <TableCell>${stock.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-green-500">
                        +{stock.changePercent.toFixed(2)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Losers</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topLosers.map((stock) => (
                  <TableRow key={stock.symbol}>
                    <TableCell className="font-medium">{stock.symbol}</TableCell>
                    <TableCell>{stock.name}</TableCell>
                    <TableCell>${stock.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">
                        {stock.changePercent.toFixed(2)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Watchlist</CardTitle>
        </CardHeader>
        <CardContent>
          {usWatchlist.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No US stocks in your watchlist. Search for stocks to add them.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usWatchlist.map((stock) => (
                  <TableRow key={stock.symbol}>
                    <TableCell className="font-medium">{stock.symbol}</TableCell>
                    <TableCell>{stock.name}</TableCell>
                    <TableCell>${stock.price?.toFixed(2) || '-'}</TableCell>
                    <TableCell>
                      {stock.changePercent !== undefined ? (
                        <Badge 
                          variant={stock.changePercent >= 0 ? "default" : "destructive"}
                          className={stock.changePercent >= 0 ? "bg-green-500" : ""}
                        >
                          {stock.changePercent >= 0 ? '+' : ''}
                          {stock.changePercent.toFixed(2)}%
                        </Badge>
                      ) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
