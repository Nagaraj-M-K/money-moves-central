
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
        
        // Using mock data for Indian stocks since NSE API requires authentication
        // In production, you would use a proper API service
        const mockIndianStocks = [
          { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2456.75, change: 45.30, changePercent: 1.88 },
          { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3567.20, change: -23.45, changePercent: -0.65 },
          { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1654.30, change: 12.80, changePercent: 0.78 },
          { symbol: 'INFY', name: 'Infosys', price: 1423.65, change: -8.90, changePercent: -0.62 },
          { symbol: 'ICICIBANK', name: 'ICICI Bank', price: 987.45, change: 18.65, changePercent: 1.93 },
          { symbol: 'BHARTIARTL', name: 'Bharti Airtel', price: 876.30, change: -5.45, changePercent: -0.62 },
          { symbol: 'ITC', name: 'ITC Limited', price: 432.10, change: 3.25, changePercent: 0.76 },
          { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', price: 1789.55, change: -12.30, changePercent: -0.68 },
          { symbol: 'LT', name: 'Larsen & Toubro', price: 2345.80, change: 34.50, changePercent: 1.49 },
          { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', price: 2567.90, change: -18.75, changePercent: -0.73 }
        ];

        // Add some randomization to make it feel more real
        const randomizedStocks = mockIndianStocks.map(stock => ({
          ...stock,
          price: stock.price + (Math.random() - 0.5) * 20,
          change: stock.change + (Math.random() - 0.5) * 10,
          changePercent: stock.changePercent + (Math.random() - 0.5) * 2
        }));

        const sortedStocks = [...randomizedStocks].sort((a, b) => b.changePercent - a.changePercent);
        
        setTopGainers(sortedStocks.slice(0, 5));
        setTopLosers(sortedStocks.slice(-5).reverse());
        
        toast({
          title: "Market Data",
          description: "Showing simulated Indian market data. Connect to a real API for live prices.",
        });
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
    const interval = setInterval(fetchMarketData, 300000); // Update every 5 minutes
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
