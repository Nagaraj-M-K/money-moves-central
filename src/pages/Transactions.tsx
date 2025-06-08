
import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import TransactionForm from '@/components/transactions/TransactionForm';
import TransactionList from '@/components/transactions/TransactionList';
import TransactionAnalytics from '@/components/transactions/TransactionAnalytics';

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

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        amount: 50000,
        type: 'credit',
        category: 'Salary',
        description: 'Monthly salary from company',
        date: '2024-01-15',
        time: '09:00',
        timestamp: new Date('2024-01-15T09:00').getTime()
      },
      {
        id: '2',
        amount: 1200,
        type: 'debit',
        category: 'Bills & Utilities',
        description: 'Electricity bill payment',
        date: '2024-01-15',
        time: '14:30',
        timestamp: new Date('2024-01-15T14:30').getTime()
      },
      {
        id: '3',
        amount: 800,
        type: 'debit',
        category: 'Food & Dining',
        description: 'Grocery shopping at supermarket',
        date: '2024-01-16',
        time: '10:15',
        timestamp: new Date('2024-01-16T10:15').getTime()
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const handleAddTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Analytics Section */}
          <TransactionAnalytics transactions={transactions} />

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add Transaction Form */}
            <div className="lg:col-span-1">
              <TransactionForm onAddTransaction={handleAddTransaction} />
            </div>

            {/* Transactions List */}
            <div className="lg:col-span-2">
              <TransactionList 
                transactions={transactions} 
                onDeleteTransaction={handleDeleteTransaction}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
