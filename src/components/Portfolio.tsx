import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStock } from '@/context/StockContext';
import { X, Search } from "lucide-react";
import StockPortfolio from './stock/StockPortfolio';

export function Portfolio() {
  return (
    <div className="space-y-6">
      <StockPortfolio />
    </div>
  );
} 