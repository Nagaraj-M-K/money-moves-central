
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LineChart } from "lucide-react";
import Header from '@/components/layout/Header';
import EnhancedUSStockSearch from "@/components/stock/EnhancedUSStockSearch";
import IndianStockSearch from "@/components/stock/IndianStockSearch";
import CryptoSearch from "@/components/stock/CryptoSearch";


export default function PortfolioPage() {
  const navigate = useNavigate();
  const [quickType, setQuickType] = useState<'us' | 'indian' | 'crypto'>('us');
  const [quickSymbol, setQuickSymbol] = useState('');

  const openChart = () => {
    const sym = quickSymbol.trim().toUpperCase();
    if (!sym) return;
    navigate(`/stock/${quickType}/${sym}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Investment Portfolio
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Track real-time market data, manage your watchlist, and make informed investment decisions
          </p>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2 justify-center bg-white/70 rounded-lg p-3 shadow">
          <span className="text-sm font-medium text-muted-foreground">Open advanced chart:</span>
          <select
            value={quickType}
            onChange={(e) => setQuickType(e.target.value as any)}
            className="h-10 rounded border px-2 text-sm bg-white"
          >
            <option value="us">US</option>
            <option value="indian">Indian (NSE)</option>
            <option value="crypto">Crypto</option>
          </select>
          <Input
            placeholder="Symbol e.g. AAPL, RELIANCE, BTC"
            value={quickSymbol}
            onChange={(e) => setQuickSymbol(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && openChart()}
            className="max-w-xs"
          />
          <Button onClick={openChart}>
            <LineChart className="h-4 w-4 mr-1" /> View Chart
          </Button>
        </div>

        <Tabs defaultValue="us" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-white shadow-lg rounded-lg p-1 hover:shadow-xl transition-shadow duration-300">
            <TabsTrigger 

              value="us" 
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-200 hover:bg-blue-50 hover:scale-105"
            >
              🇺🇸 US Stocks
            </TabsTrigger>
            <TabsTrigger 
              value="indian"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-all duration-200 hover:bg-orange-50 hover:scale-105"
            >
              🇮🇳 Indian Stocks
            </TabsTrigger>
            <TabsTrigger 
              value="crypto"
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white transition-all duration-200 hover:bg-yellow-50 hover:scale-105"
            >
              ₿ Cryptocurrencies
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="us" className="space-y-6 animate-fade-in">
            <EnhancedUSStockSearch />
          </TabsContent>
          
          <TabsContent value="indian" className="space-y-6 animate-fade-in">
            <IndianStockSearch />
          </TabsContent>
          
          <TabsContent value="crypto" className="space-y-6 animate-fade-in">
            <CryptoSearch />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
