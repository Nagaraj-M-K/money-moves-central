
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Calendar, TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, IndianRupee } from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  category: string;
  description: string;
  date: string;
  created_at: string;
}

interface SpendingAnalyticsProps {
  transactions: Transaction[];
  expenses: any[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export default function SpendingAnalytics({ transactions, expenses }: SpendingAnalyticsProps) {
  const [timeframe, setTimeframe] = useState('month');
  const [viewType, setViewType] = useState('spending');

  const chartConfig = {
    amount: {
      label: "Amount",
      color: "#2563eb",
    },
    income: {
      label: "Income",
      color: "#16a34a",
    },
    expense: {
      label: "Expense",
      color: "#dc2626",
    },
  };

  const processedData = useMemo(() => {
    const allData = [
      ...transactions.map(t => ({ ...t, source: 'transaction' })),
      ...expenses.map(e => ({ ...e, type: 'debit', source: 'expense' }))
    ];

    const now = new Date();
    let startDate = new Date();
    let groupBy = '';

    switch (timeframe) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        groupBy = 'day';
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        groupBy = 'day';
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        groupBy = 'month';
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
        groupBy = 'day';
    }

    const filteredData = allData.filter(item => {
      const itemDate = new Date(item.date || item.created_at);
      return itemDate >= startDate;
    });

    // Group data by time period
    const groupedData: { [key: string]: { income: number; expense: number; date: string } } = {};

    filteredData.forEach(item => {
      const itemDate = new Date(item.date || item.created_at);
      let key = '';

      if (groupBy === 'day') {
        key = itemDate.toISOString().split('T')[0];
      } else if (groupBy === 'month') {
        key = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!groupedData[key]) {
        groupedData[key] = { income: 0, expense: 0, date: key };
      }

      if (item.type === 'credit') {
        groupedData[key].income += Number(item.amount);
      } else {
        groupedData[key].expense += Number(item.amount);
      }
    });

    return Object.values(groupedData).sort((a, b) => a.date.localeCompare(b.date));
  }, [transactions, expenses, timeframe]);

  const categoryData = useMemo(() => {
    const categories: { [key: string]: number } = {};
    
    const allExpenses = [
      ...transactions.filter(t => t.type === 'debit'),
      ...expenses.map(e => ({ ...e, category: e.category || 'Other' }))
    ];

    allExpenses.forEach(item => {
      const category = item.category || 'Other';
      categories[category] = (categories[category] || 0) + Number(item.amount);
    });

    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [transactions, expenses]);

  const totalIncome = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpenses = [
    ...transactions.filter(t => t.type === 'debit'),
    ...expenses
  ].reduce((sum, item) => sum + Number(item.amount), 0);

  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Spending Analytics
            </CardTitle>
            <div className="flex gap-2">
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
              <Select value={viewType} onValueChange={setViewType}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spending">Spending Trends</SelectItem>
                  <SelectItem value="categories">By Categories</SelectItem>
                  <SelectItem value="comparison">Income vs Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-green-50/50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 mb-1">Total Income</p>
                <p className="text-2xl font-bold text-green-700 flex items-center">
                  <IndianRupee className="h-4 w-4 mr-1" />
                  {totalIncome.toLocaleString('en-IN')}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50/50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 mb-1">Total Expenses</p>
                <p className="text-2xl font-bold text-red-700 flex items-center">
                  <IndianRupee className="h-4 w-4 mr-1" />
                  {totalExpenses.toLocaleString('en-IN')}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={`${netSavings >= 0 ? 'bg-green-50/50 border-green-200' : 'bg-red-50/50 border-red-200'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Net Savings</p>
                <p className={`text-2xl font-bold flex items-center ${netSavings >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  <IndianRupee className="h-4 w-4 mr-1" />
                  {Math.abs(netSavings).toLocaleString('en-IN')}
                </p>
              </div>
              <BarChart3 className={`h-8 w-8 ${netSavings >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50/50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 mb-1">Savings Rate</p>
                <p className="text-2xl font-bold text-blue-700">
                  {savingsRate.toFixed(1)}%
                </p>
              </div>
              <PieChartIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {viewType === 'spending' && 'Daily Spending Trends'}
              {viewType === 'categories' && 'Spending by Categories'}
              {viewType === 'comparison' && 'Income vs Expenses'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {viewType === 'spending' && (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <LineChart data={processedData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="expense" stroke="var(--color-expense)" strokeWidth={2} />
                </LineChart>
              </ChartContainer>
            )}

            {viewType === 'comparison' && (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <BarChart data={processedData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="income" fill="var(--color-income)" />
                  <Bar dataKey="expense" fill="var(--color-expense)" />
                </BarChart>
              </ChartContainer>
            )}

            {viewType === 'categories' && (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Top Spending Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categoryData
              .sort((a, b) => b.value - a.value)
              .slice(0, 5)
              .map((category, index) => (
                <div key={category.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <Badge variant="outline">{category.name}</Badge>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold flex items-center">
                      <IndianRupee className="h-4 w-4 mr-1" />
                      {category.value.toLocaleString('en-IN')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {((category.value / totalExpenses) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
