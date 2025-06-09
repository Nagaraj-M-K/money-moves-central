
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IndianRupee, TrendingUp, TrendingDown, BarChart3, PieChart } from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  category: string;
  description: string;
  date: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface TransactionAnalyticsProps {
  transactions: Transaction[];
}

export default function TransactionAnalytics({ transactions }: TransactionAnalyticsProps) {
  const totalCredits = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalDebits = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netBalance = totalCredits - totalDebits;

  // Category analysis
  const categoryStats = transactions.reduce((acc, transaction) => {
    if (!acc[transaction.category]) {
      acc[transaction.category] = { total: 0, count: 0, type: transaction.type };
    }
    acc[transaction.category].total += Number(transaction.amount);
    acc[transaction.category].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number; type: string }>);

  const topExpenseCategories = Object.entries(categoryStats)
    .filter(([_, data]) => data.type === 'debit')
    .sort(([_, a], [__, b]) => b.total - a.total)
    .slice(0, 5);

  const topIncomeCategories = Object.entries(categoryStats)
    .filter(([_, data]) => data.type === 'credit')
    .sort(([_, a], [__, b]) => b.total - a.total)
    .slice(0, 3);

  // Monthly analysis
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
  });

  const thisMonthCredits = thisMonthTransactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const thisMonthDebits = thisMonthTransactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-green-50/50 border-green-200 hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-green-700">
              <TrendingUp className="h-4 w-4" />
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 flex items-center">
              <IndianRupee className="h-5 w-5 mr-1" />
              {totalCredits.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-green-600 mt-1">
              {transactions.filter(t => t.type === 'credit').length} transactions
            </p>
          </CardContent>
        </Card>

        <Card className="bg-red-50/50 border-red-200 hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-red-700">
              <TrendingDown className="h-4 w-4" />
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700 flex items-center">
              <IndianRupee className="h-5 w-5 mr-1" />
              {totalDebits.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-red-600 mt-1">
              {transactions.filter(t => t.type === 'debit').length} transactions
            </p>
          </CardContent>
        </Card>

        <Card className={`${netBalance >= 0 ? 'bg-green-50/50 border-green-200' : 'bg-red-50/50 border-red-200'} hover-scale`}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4" />
              Net Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold flex items-center ${netBalance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              <IndianRupee className="h-5 w-5 mr-1" />
              {Math.abs(netBalance).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <p className={`text-xs mt-1 ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {netBalance >= 0 ? 'Surplus' : 'Deficit'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50/50 border-blue-200 hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-blue-700">
              <PieChart className="h-4 w-4" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-blue-700 flex items-center">
              <IndianRupee className="h-4 w-4 mr-1" />
              {(thisMonthCredits - thisMonthDebits).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              {thisMonthTransactions.length} transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="animate-scale-in">
          <CardHeader>
            <CardTitle className="text-lg">Top Expense Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {topExpenseCategories.length > 0 ? (
              <div className="space-y-3">
                {topExpenseCategories.map(([category, data]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {data.count} transactions
                      </span>
                    </div>
                    <div className="text-sm font-medium text-red-600">
                      ₹{data.total.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No expense data available. Start adding your transactions!
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="animate-scale-in">
          <CardHeader>
            <CardTitle className="text-lg">Top Income Sources</CardTitle>
          </CardHeader>
          <CardContent>
            {topIncomeCategories.length > 0 ? (
              <div className="space-y-3">
                {topIncomeCategories.map(([category, data]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs bg-green-50">
                        {category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {data.count} transactions
                      </span>
                    </div>
                    <div className="text-sm font-medium text-green-600">
                      ₹{data.total.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No income data available. Start adding your transactions!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
