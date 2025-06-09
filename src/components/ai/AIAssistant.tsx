
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, MessageCircle, TrendingUp, DollarSign, X } from "lucide-react";
import { useUserData } from '@/hooks/useUserData';

const aiSuggestions = [
  {
    icon: DollarSign,
    title: "Start Expense Tracking",
    message: "Begin by adding your daily expenses to get insights into your spending patterns.",
    action: "Go to Expenses",
    link: "/expenses"
  },
  {
    icon: TrendingUp,
    title: "Build Your Portfolio",
    message: "Add stocks to your watchlist and track market performance in real-time.",
    action: "Explore Stocks",
    link: "/portfolio"
  },
  {
    icon: MessageCircle,
    title: "Track Income & Expenses",
    message: "Record your income and expenses to see your financial flow.",
    action: "Add Transactions",
    link: "/transactions"
  }
];

export default function AIAssistant() {
  const [isVisible, setIsVisible] = useState(true);
  const { stats } = useUserData();

  if (!isVisible) return null;

  const getPersonalizedSuggestion = () => {
    if (stats.transactionCount === 0 && stats.totalExpenses === 0) {
      return aiSuggestions[0];
    } else if (stats.watchlistCount === 0) {
      return aiSuggestions[1];
    } else {
      return aiSuggestions[2];
    }
  };

  const suggestion = getPersonalizedSuggestion();
  const SuggestionIcon = suggestion.icon;

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 animate-fade-in">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-blue-600" />
          AI Assistant
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <SuggestionIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">{suggestion.title}</h4>
            <p className="text-sm text-muted-foreground mb-3">{suggestion.message}</p>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => window.location.href = suggestion.link}
            >
              {suggestion.action}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
