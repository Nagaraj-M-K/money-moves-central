
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TransactionFormProps {
  onAddTransaction: (transaction: any) => void;
}

export default function TransactionForm({ onAddTransaction }: TransactionFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    amount: '',
    type: 'credit',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5)
  });

  const categories = {
    credit: ['Salary', 'Investment Return', 'Freelance', 'Business Income', 'Refund', 'Gift', 'Other Income'],
    debit: ['Food & Dining', 'Transportation', 'Shopping', 'Bills & Utilities', 'Healthcare', 'Entertainment', 'Education', 'Investment', 'Other Expense']
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

    const newTransaction = {
      id: Date.now().toString(),
      amount: parseFloat(formData.amount),
      type: formData.type as 'credit' | 'debit',
      category: formData.category,
      description: formData.description,
      date: formData.date,
      time: formData.time,
      timestamp: new Date(`${formData.date}T${formData.time}`).getTime()
    };

    onAddTransaction(newTransaction);
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

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <PlusCircle className="h-4 w-4" />
          Add New Transaction
        </CardTitle>
        <CardDescription className="text-xs">
          Record your income and expenses with detailed categorization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type" className="text-sm">Transaction Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value, category: '' })}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit">Income (Credit)</SelectItem>
                <SelectItem value="debit">Expense (Debit)</SelectItem>
              </SelectContent>
            </Select>
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
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories[formData.type as keyof typeof categories].map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
  );
}
