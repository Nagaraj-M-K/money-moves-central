import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Calendar, IndianRupee, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from '@/components/layout/Header';

interface Transaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  category: string;
  description: string;
  date: string;
  time: string;
}

const Transactions = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      amount: 5000,
      type: 'credit',
      category: 'Salary',
      description: 'Monthly salary',
      date: '2024-01-15',
      time: '09:00'
    },
    {
      id: '2',
      amount: 1000,
      type: 'debit',
      category: 'Bills',
      description: 'Electricity bill',
      date: '2024-01-15',
      time: '14:30'
    }
  ]);

  const [formData, setFormData] = useState({
    amount: '',
    type: 'credit',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5)
  });

  const categories = {
    credit: ['Salary', 'Investment', 'Refund', 'Gift', 'Other'],
    debit: ['Bills', 'Shopping', 'Food', 'Transport', 'Entertainment', 'Other']
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.category || !formData.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      amount: parseFloat(formData.amount),
      type: formData.type as 'credit' | 'debit',
      category: formData.category,
      description: formData.description,
      date: formData.date,
      time: formData.time
    };

    setTransactions([newTransaction, ...transactions]);
    setFormData({
      amount: '',
      type: 'credit',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5)
    });

    toast({
      title: "Success",
      description: "Transaction added successfully"
    });
  };

  const totalCredits = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDebits = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalCredits - totalDebits;

  const getCategoryColor = (type: 'credit' | 'debit', category: string) => {
    const colors: { [key: string]: string } = {
      'Salary': 'bg-green-100 text-green-800',
      'Investment': 'bg-blue-100 text-blue-800',
      'Refund': 'bg-purple-100 text-purple-800',
      'Gift': 'bg-pink-100 text-pink-800',
      'Bills': 'bg-red-100 text-red-800',
      'Shopping': 'bg-orange-100 text-orange-800',
      'Food': 'bg-yellow-100 text-yellow-800',
      'Transport': 'bg-indigo-100 text-indigo-800',
      'Entertainment': 'bg-pink-100 text-pink-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <Header />
      <div className="container mx-auto px-4 py-6 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Transaction Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <PlusCircle className="h-4 w-4" />
                  Add New Transaction
                </CardTitle>
                <CardDescription className="text-xs">
                  Record your credits and debits with detailed information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <Label htmlFor="type" className="text-sm">Transaction Type</Label>
                    <select
                      id="type"
                      className="w-full h-8 rounded-md border border-input bg-background px-2 py-1 text-sm"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'credit' | 'debit' })}
                      required
                    >
                      <option value="credit">Credit</option>
                      <option value="debit">Debit</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="amount" className="text-sm">Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                      className="h-8 text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category" className="text-sm">Category</Label>
                    <select
                      id="category"
                      className="w-full h-8 rounded-md border border-input bg-background px-2 py-1 text-sm"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    >
                      <option value="">Select category</option>
                      {categories[formData.type].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-sm">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="What is this transaction for?"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      className="min-h-[60px] text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="date" className="text-sm">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="time" className="text-sm">Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        required
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-8 text-sm">
                    Add Transaction
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Transactions List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-4 w-4" />
                  Recent Transactions
                </CardTitle>
                <CardDescription className="text-xs">
                  Your transaction history sorted by date and time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length > 0 ? (
                  <div className="max-h-[600px] overflow-y-auto pr-2">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                          <TableHead className="text-xs">Date & Time</TableHead>
                          <TableHead className="text-xs">Type</TableHead>
                          <TableHead className="text-xs">Category</TableHead>
                          <TableHead className="text-xs">Description</TableHead>
                          <TableHead className="text-xs text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((transaction) => (
                          <TableRow key={transaction.id} className="text-sm">
                            <TableCell>
                              <div className="text-xs">
                                <div className="font-medium">{transaction.date}</div>
                                <div className="text-muted-foreground">{transaction.time}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={transaction.type === 'credit' ? 'default' : 'destructive'} className="text-xs">
                                {transaction.type.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={`text-xs ${getCategoryColor(transaction.type, transaction.category)}`}>
                                {transaction.category}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs">{transaction.description}</TableCell>
                            <TableCell className={`text-xs text-right font-medium ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-sm font-medium text-muted-foreground">No transactions yet</h3>
                    <p className="text-xs text-muted-foreground">Add your first transaction to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Fixed Summary Cards */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
        <div className="container mx-auto px-4 py-2">
          <div className="grid grid-cols-3 gap-6">
            <Card className="border-none shadow-none bg-green-50/50 hover:bg-green-50/80 transition-colors">
              <CardHeader className="pb-1 pt-2">
                <CardTitle className="flex items-center gap-2 text-xs text-green-700">
                  <div className="p-1 rounded-full bg-green-100">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  </div>
                  Total Credits
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-1 pb-2">
                <div className="text-lg font-bold text-green-700 flex items-center">
                  <IndianRupee className="h-4 w-4 mr-1" />
                  {totalCredits.toFixed(2)}
                </div>
                <p className="text-[10px] text-green-600/80 mt-0.5">
                  {transactions.filter(t => t.type === 'credit').length} credit transactions
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-none bg-red-50/50 hover:bg-red-50/80 transition-colors">
              <CardHeader className="pb-1 pt-2">
                <CardTitle className="flex items-center gap-2 text-xs text-red-700">
                  <div className="p-1 rounded-full bg-red-100">
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  </div>
                  Total Debits
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-1 pb-2">
                <div className="text-lg font-bold text-red-700 flex items-center">
                  <IndianRupee className="h-4 w-4 mr-1" />
                  {totalDebits.toFixed(2)}
                </div>
                <p className="text-[10px] text-red-600/80 mt-0.5">
                  {transactions.filter(t => t.type === 'debit').length} debit transactions
                </p>
              </CardContent>
            </Card>

            <Card className={`border-none shadow-none transition-colors ${netBalance >= 0 ? 'bg-green-50/50 hover:bg-green-50/80' : 'bg-red-50/50 hover:bg-red-50/80'}`}>
              <CardHeader className="pb-1 pt-2">
                <CardTitle className="flex items-center gap-2 text-xs">
                  <div className={`p-1 rounded-full ${netBalance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    <IndianRupee className={`h-3 w-3 ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                  Net Balance
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-1 pb-2">
                <div className={`text-lg font-bold flex items-center ${netBalance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  <IndianRupee className="h-4 w-4 mr-1" />
                  {netBalance.toFixed(2)}
                </div>
                <p className={`text-[10px] mt-0.5 ${netBalance >= 0 ? 'text-green-600/80' : 'text-red-600/80'}`}>
                  {netBalance >= 0 ? 'Positive balance' : 'Negative balance'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions; 