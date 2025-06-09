
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle, Star, TrendingUp, Mail, Brain, Shield, Zap } from "lucide-react";
import MockPayment from '@/components/payments/MockPayment';

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  interval: string;
  features: string[];
  popular?: boolean;
  color: string;
}

export default function PremiumFeatures() {
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  const plans: PricingPlan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: '$9.99',
      interval: 'month',
      color: 'blue',
      features: [
        'Real-time stock alerts via email',
        'Basic portfolio analytics',
        'Expense categorization',
        'Monthly financial reports',
        'Email support'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$19.99',
      interval: 'month',
      popular: true,
      color: 'purple',
      features: [
        'All Basic features',
        'AI-powered expense insights',
        'Trending stocks suggestions',
        'Advanced portfolio optimization',
        'Real-time market notifications',
        'Custom alerts & reminders',
        'Export to Excel/PDF',
        'Priority support'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$49.99',
      interval: 'month',
      color: 'gold',
      features: [
        'All Pro features',
        'Personal AI financial advisor',
        'Advanced market analysis',
        'Custom investment strategies',
        'White-label reports',
        'API access for developers',
        'Dedicated account manager',
        '24/7 phone support'
      ]
    }
  ];

  const handleSubscribe = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    setSelectedPlan(null);
    window.location.reload();
  };

  return (
    <div className="space-y-8">
      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="text-center hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <Mail className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Email Alerts</h3>
            <p className="text-sm text-muted-foreground">
              Get instant notifications for price changes and market movements
            </p>
          </CardContent>
        </Card>
        
        <Card className="text-center hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <TrendingUp className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Trending Stocks</h3>
            <p className="text-sm text-muted-foreground">
              AI-curated suggestions based on market trends and your portfolio
            </p>
          </CardContent>
        </Card>
        
        <Card className="text-center hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <Brain className="h-12 w-12 text-purple-500 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">AI Insights</h3>
            <p className="text-sm text-muted-foreground">
              Smart analysis of your expenses and investment patterns
            </p>
          </CardContent>
        </Card>
        
        <Card className="text-center hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <Shield className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Secure & Private</h3>
            <p className="text-sm text-muted-foreground">
              Bank-grade security with end-to-end encryption
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative hover:shadow-lg transition-all duration-300 ${plan.popular ? 'ring-2 ring-purple-500 shadow-lg scale-105' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-purple-500 text-white px-4 py-1">
                  <Star className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <div className="space-y-2">
                <div className="text-3xl font-bold">{plan.price}</div>
                <div className="text-sm text-muted-foreground">per {plan.interval}</div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Dialog open={showPayment && selectedPlan?.id === plan.id} onOpenChange={setShowPayment}>
                <DialogTrigger asChild>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-purple-500 hover:bg-purple-600' : ''}`}
                    onClick={() => handleSubscribe(plan)}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Subscribe Now
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Complete Your Purchase</DialogTitle>
                  </DialogHeader>
                  {selectedPlan && (
                    <MockPayment 
                      planId={selectedPlan.id}
                      planName={selectedPlan.name}
                      price={selectedPlan.price}
                      onSuccess={handlePaymentSuccess}
                    />
                  )}
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">How does the AI analysis work?</h4>
            <p className="text-sm text-muted-foreground">
              Our AI analyzes your spending patterns, investment history, and market trends to provide personalized insights and recommendations.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Can I cancel my subscription anytime?</h4>
            <p className="text-sm text-muted-foreground">
              Yes, you can cancel your subscription at any time. You'll continue to have access to premium features until the end of your billing period.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Is my financial data secure?</h4>
            <p className="text-sm text-muted-foreground">
              Absolutely. We use bank-grade encryption and never store sensitive information like account passwords or PINs.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
