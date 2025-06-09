
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, CreditCard, PiggyBank, ArrowRight, Crown, IndianRupee } from "lucide-react";
import { Link } from "react-router-dom";
import Header from '@/components/layout/Header';
import PremiumFeatures from '@/components/premium/PremiumFeatures';
import AIAssistant from '@/components/ai/AIAssistant';
import AppGuide from '@/components/onboarding/AppGuide';
import { useUserData } from '@/hooks/useUserData';

const Index = () => {
  const { stats, loading } = useUserData();

  const features = [
    {
      title: "Expenditure Tracker",
      description: "Track and categorize your daily expenses with detailed analytics and spending insights.",
      icon: PiggyBank,
      color: "text-green-600",
      bgColor: "bg-green-50",
      href: "/expenses"
    },
    {
      title: "Credits & Debit Manager", 
      description: "Manage your financial transactions, monitor cash flow, and keep track of credits and debits.",
      icon: CreditCard,
      color: "text-blue-600", 
      bgColor: "bg-blue-50",
      href: "/transactions"
    },
    {
      title: "Real-time Stock Portfolio",
      description: "Monitor your investment portfolio with live stock prices and performance analytics.",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50", 
      href: "/portfolio"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 animate-fade-in">
            Take Control of Your Finances
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in">
            Your complete financial management solution. Track expenses, manage transactions, 
            and monitor your investment portfolio all in one place.
          </p>
        </div>

        {/* AI Assistant and App Guide */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <AIAssistant />
          <AppGuide />
        </div>

        {/* Stats Section - User Specific Data */}
        <div className="bg-card rounded-2xl p-6 md:p-8 shadow-lg border animate-fade-in mb-16">
          <h2 className="text-2xl font-bold text-center mb-6">Your Financial Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-red-50 p-4 rounded-xl">
              <h3 className="text-2xl md:text-3xl font-bold text-red-600 mb-2 flex items-center justify-center">
                <IndianRupee className="h-6 w-6 mr-1" />
                {loading ? '...' : stats.totalExpenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </h3>
              <p className="text-muted-foreground text-sm">Total Expenses</p>
            </div>
            <div className={`p-4 rounded-xl ${stats.netBalance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <h3 className={`text-2xl md:text-3xl font-bold mb-2 flex items-center justify-center ${stats.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <IndianRupee className="h-6 w-6 mr-1" />
                {loading ? '...' : Math.abs(stats.netBalance).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </h3>
              <p className="text-muted-foreground text-sm">Net Balance</p>
            </div>
            <div className={`p-4 rounded-xl ${stats.portfolioGrowth >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <h3 className={`text-2xl md:text-3xl font-bold mb-2 ${stats.portfolioGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {loading ? '...' : (stats.portfolioGrowth >= 0 ? '+' : '')}{stats.portfolioGrowth.toFixed(1)}%
              </h3>
              <p className="text-muted-foreground text-sm">Portfolio Growth</p>
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {stats.transactionCount} transactions • {stats.watchlistCount} stocks in watchlist
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={feature.title} 
                className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 shadow-md animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 ${feature.bgColor} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-muted-foreground mb-6 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                  <Link to={feature.href}>
                    <Button 
                      variant="outline" 
                      className="group/btn hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                    >
                      Get Started
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Premium Features Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Crown className="h-8 w-8 text-yellow-500" />
              <h2 className="text-3xl font-bold text-foreground">Premium Features</h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upgrade to unlock AI-powered insights, real-time alerts, and professional-grade analytics
            </p>
          </div>
          <PremiumFeatures />
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Ready to take control of your finances?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Start managing your money smarter with our comprehensive suite of financial tools.
          </p>
          <Link to="/expenses">
            <Button size="lg" className="px-8 py-3 text-lg">
              Start Your Journey
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
