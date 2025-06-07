import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStock } from '@/context/StockContext';
import { X, Search } from "lucide-react";
import USStockSearch from './USStockSearch';
import IndianStockSearch from './IndianStockSearch';
import CryptoSearch from './CryptoSearch';
import Header from '@/components/layout/Header';

export default function StockPortfolio() {
  const [activeTab, setActiveTab] = useState('us');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="us" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="us">US Stocks</TabsTrigger>
            <TabsTrigger value="indian">Indian Stocks</TabsTrigger>
            <TabsTrigger value="crypto">Cryptocurrencies</TabsTrigger>
          </TabsList>
          <TabsContent value="us">
            <USStockSearch />
          </TabsContent>
          <TabsContent value="indian">
            <IndianStockSearch />
          </TabsContent>
          <TabsContent value="crypto">
            <CryptoSearch />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 