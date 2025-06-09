
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, X } from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Set up your profile",
    description: "Complete your profile information to personalize your experience",
    action: "Edit Profile",
    link: "/profile"
  },
  {
    id: 2,
    title: "Add your first expense",
    description: "Start tracking your daily expenses to understand your spending",
    action: "Add Expense",
    link: "/expenses"
  },
  {
    id: 3,
    title: "Record a transaction",
    description: "Track your income and expenses for better financial management",
    action: "Add Transaction",
    link: "/transactions"
  },
  {
    id: 4,
    title: "Build your watchlist",
    description: "Add stocks to track and monitor your investment portfolio",
    action: "Explore Stocks",
    link: "/portfolio"
  }
];

export default function AppGuide() {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  const markStepComplete = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  if (!isVisible) return null;

  return (
    <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg">Getting Started Guide</CardTitle>
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
        <div className="space-y-4">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/60">
              <div className="flex-shrink-0">
                {completedSteps.includes(step.id) ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
                    {step.id}
                  </Badge>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{step.title}</h4>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  markStepComplete(step.id);
                  window.location.href = step.link;
                }}
                className="text-xs"
              >
                {step.action}
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
