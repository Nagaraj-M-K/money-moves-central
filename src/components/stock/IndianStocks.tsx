import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useStock } from '@/context/StockContext';
import { useToast } from "@/components/ui/use-toast";

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface NSEStock {
  symbol: string;
  name: string;
  lastPrice: number;
  change: number;
  pChange: number;
}

interface NSEResponse {
  data: NSEStock[];
}

export default function IndianStocks() {
  const [topGainers, setTopGainers] = useState<Stock[]>([]);
  const [topLosers, setTopLosers] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const { watchlist } = useStock();
  const { toast } = useToast();

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true);
        // Fetch NIFTY 50 data from NSE India
        const response = await fetch(
          'https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%2050',
          {
            headers: {
              'Accept': 'application/json',
              'Accept-Language': 'en-US,en;q=0.9',
              'User-Agent': 'Mozilla/5.0'
            }
          }
        );
        const data = await response.json() as NSEResponse;
        
        if (!data.data || data.data.length === 0) {
          throw new Error('No data available');
        }

        // Sort stocks by percentage change
        const sortedStocks = [...data.data].sort((a, b) => b.pChange - a.pChange);
        
        const gainers = sortedStocks.slice(0, 5).map((stock) => ({
          symbol: stock.symbol,
          name: stock.name,
          price: stock.lastPrice,
          change: stock.change,
          changePercent: stock.pChange
        }));
        
        const losers = sortedStocks.slice(-5).reverse().map((stock) => ({
          symbol: stock.symbol,
          name: stock.name,
          price: stock.lastPrice,
          change: stock.change,
          changePercent: stock.pChange
        }));
        
        setTopGainers(gainers);
        setTopLosers(losers);
      } catch (error) {
        console.error('Error fetching market data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch Indian market data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
    // Set up polling for real-time updates
    const interval = setInterval(fetchMarketData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [toast]);

  const indianWatchlist = watchlist.filter(stock => stock.type === 'indian');

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
                    <TableCell>₹{stock.price.toFixed(2)}</TableCell>
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
                    <TableCell>₹{stock.price.toFixed(2)}</TableCell>
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
          {indianWatchlist.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No Indian stocks in your watchlist. Search for stocks to add them.
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
                {indianWatchlist.map((stock) => (
                  <TableRow key={stock.symbol}>
                    <TableCell className="font-medium">{stock.symbol}</TableCell>
                    <TableCell>{stock.name}</TableCell>
                    <TableCell>₹{stock.price?.toFixed(2) || '-'}</TableCell>
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