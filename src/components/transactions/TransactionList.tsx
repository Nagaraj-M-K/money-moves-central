
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Search, Filter, Trash2 } from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  category: string;
  description: string;
  date: string;
  time: string;
  timestamp: number;
}

interface TransactionListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
}

export default function TransactionList({ transactions, onDeleteTransaction }: TransactionListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const filteredTransactions = transactions
    .filter(transaction => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || transaction.type === filterType;
      const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
      return matchesSearch && matchesType && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.timestamp - a.timestamp;
        case 'oldest':
          return a.timestamp - b.timestamp;
        case 'highest':
          return b.amount - a.amount;
        case 'lowest':
          return a.amount - b.amount;
        default:
          return b.timestamp - a.timestamp;
      }
    });

  const uniqueCategories = [...new Set(transactions.map(t => t.category))];

  const getCategoryColor = (type: 'credit' | 'debit', category: string) => {
    const colors: { [key: string]: string } = {
      'Salary': 'bg-green-100 text-green-800',
      'Investment Return': 'bg-blue-100 text-blue-800',
      'Freelance': 'bg-purple-100 text-purple-800',
      'Food & Dining': 'bg-orange-100 text-orange-800',
      'Transportation': 'bg-indigo-100 text-indigo-800',
      'Shopping': 'bg-pink-100 text-pink-800',
      'Bills & Utilities': 'bg-red-100 text-red-800',
      'Healthcare': 'bg-teal-100 text-teal-800',
      'Entertainment': 'bg-violet-100 text-violet-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-4 w-4" />
          Transaction History
        </CardTitle>
        <CardDescription className="text-xs">
          View and manage all your financial transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8"
            />
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[120px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="credit">Credit</SelectItem>
              <SelectItem value="debit">Debit</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {uniqueCategories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[120px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="highest">Highest</SelectItem>
              <SelectItem value="lowest">Lowest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredTransactions.length > 0 ? (
          <div className="max-h-[600px] overflow-y-auto pr-2">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="text-xs">Date & Time</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Category</TableHead>
                  <TableHead className="text-xs">Description</TableHead>
                  <TableHead className="text-xs text-right">Amount</TableHead>
                  <TableHead className="text-xs w-[50px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
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
                    <TableCell className="text-xs max-w-[200px] truncate">{transaction.description}</TableCell>
                    <TableCell className={`text-xs text-right font-medium ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDeleteTransaction(transaction.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-sm font-medium text-muted-foreground">No transactions found</h3>
            <p className="text-xs text-muted-foreground">
              {searchTerm || filterType !== 'all' || filterCategory !== 'all' 
                ? 'Try adjusting your filters'
                : 'Add your first transaction to get started'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
