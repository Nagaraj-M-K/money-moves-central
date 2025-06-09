
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from '@/components/layout/Header';
import EnhancedUSStockSearch from "@/components/stock/EnhancedUSStockSearch";
import IndianStockSearch from "./IndianStockSearch";
import CryptoSearch from "./CryptoSearch";

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Investment Portfolio
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Track real-time market data, manage your watchlist, and make informed investment decisions
          </p>
        </div>
        
        <Tabs defaultValue="us" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-white shadow-lg rounded-lg p-1">
            <TabsTrigger 
              value="us" 
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-200 hover:bg-blue-50"
            >
              🇺🇸 US Stocks
            </TabsTrigger>
            <TabsTrigger 
              value="indian"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-all duration-200 hover:bg-orange-50"
            >
              🇮🇳 Indian Stocks
            </TabsTrigger>
            <TabsTrigger 
              value="crypto"
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white transition-all duration-200 hover:bg-yellow-50"
            >
              ₿ Cryptocurrencies
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="us" className="space-y-6">
            <EnhancedUSStockSearch />
          </TabsContent>
          
          <TabsContent value="indian" className="space-y-6">
            <IndianStockSearch />
          </TabsContent>
          
          <TabsContent value="crypto" className="space-y-6">
            <CryptoSearch />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
