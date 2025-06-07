
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, CreditCard, PiggyBank, ArrowRight } from "lucide-react";

const Index = () => {
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
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-6 animate-fade-in">
            Money Moves Central
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in">
            Your complete financial management solution. Track expenses, manage transactions, 
            and monitor your investment portfolio all in one place.
          </p>
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
                  <Button 
                    variant="outline" 
                    className="group/btn hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-300" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="bg-card rounded-2xl p-8 shadow-lg border animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-3xl font-bold text-primary mb-2">₹0</h3>
              <p className="text-muted-foreground">Total Expenses</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-primary mb-2">₹0</h3>
              <p className="text-muted-foreground">Net Balance</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-primary mb-2">0%</h3>
              <p className="text-muted-foreground">Portfolio Growth</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 animate-fade-in">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to take control of your finances?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Start managing your money smarter with our comprehensive suite of financial tools.
          </p>
          <Button size="lg" className="px-8 py-3 text-lg">
            Start Your Journey
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
