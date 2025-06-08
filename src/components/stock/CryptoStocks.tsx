
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useStock } from '@/context/StockContext';

interface Crypto {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
}

export default function CryptoStocks() {
  const [topGainers, setTopGainers] = useState<Crypto[]>([]);
  const [topLosers, setTopLosers] = useState<Crypto[]>([]);
  const { watchlist } = useStock();

  useEffect(() => {
    // Fetch crypto data from CoinGecko
    const fetchCryptoData = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false'
        );
        const data = await response.json();
        
        // Sort by 24h price change
        const sortedData = [...data].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
        
        setTopGainers(sortedData.slice(0, 5));
        setTopLosers(sortedData.slice(-5).reverse());
      } catch (error) {
        console.error('Error fetching crypto data:', error);
      }
    };

    fetchCryptoData();
    // Set up polling for real-time updates
    const interval = setInterval(fetchCryptoData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const cryptoWatchlist = watchlist.filter(stock => stock.type === 'crypto');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Gainers (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topGainers.map((crypto) => (
                  <TableRow key={crypto.id}>
                    <TableCell className="font-medium">{crypto.name}</TableCell>
                    <TableCell>${crypto.current_price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-green-500">
                        +{crypto.price_change_percentage_24h.toFixed(2)}%
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
            <CardTitle>Top Losers (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topLosers.map((crypto) => (
                  <TableRow key={crypto.id}>
                    <TableCell className="font-medium">{crypto.name}</TableCell>
                    <TableCell>${crypto.current_price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">
                        {crypto.price_change_percentage_24h.toFixed(2)}%
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Change (24h)</TableHead>
                <TableHead>Market Cap</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cryptoWatchlist.map((crypto) => (
                <TableRow key={crypto.id}>
                  <TableCell className="font-medium">{crypto.name}</TableCell>
                  <TableCell>{crypto.symbol.toUpperCase()}</TableCell>
                  <TableCell>${crypto.price?.toFixed(2) || '-'}</TableCell>
                  <TableCell>
                    {crypto.changePercent !== undefined ? (
                      <Badge 
                        variant={crypto.changePercent >= 0 ? "default" : "destructive"}
                        className={crypto.changePercent >= 0 ? "bg-green-500" : ""}
                      >
                        {crypto.changePercent >= 0 ? '+' : ''}
                        {crypto.changePercent.toFixed(2)}%
                      </Badge>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    {crypto.market_cap ? `$${(crypto.market_cap / 1000000).toFixed(2)}M` : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 
