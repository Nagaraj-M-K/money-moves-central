
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserStats {
  totalExpenses: number;
  netBalance: number;
  portfolioGrowth: number;
  transactionCount: number;
  watchlistCount: number;
}

export function useUserData() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<UserStats>({
    totalExpenses: 0,
    netBalance: 0,
    portfolioGrowth: 0,
    transactionCount: 0,
    watchlistCount: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchUserStats = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch expenses - user specific
      const { data: expenses } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', user.id);

      // Fetch transactions - user specific
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id);

      // Fetch watchlist - user specific
      const { data: watchlist } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', user.id);

      // Calculate totals from actual user data (starts at 0 for new users)
      const expenseTotal = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
      const transactionExpenses = transactions?.filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      
      const totalExpenses = expenseTotal + transactionExpenses;
      
      const credits = transactions?.filter(t => t.type === 'credit')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      
      const debits = transactions?.filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      const netBalance = credits - debits - expenseTotal;
      
      // Portfolio growth calculation based on actual watchlist data
      const portfolioGrowth = watchlist && watchlist.length > 0 
        ? watchlist.reduce((avg, stock) => avg + (Number(stock.change_percent) || 0), 0) / watchlist.length
        : 0;

      setStats({
        totalExpenses,
        netBalance,
        portfolioGrowth,
        transactionCount: transactions?.length || 0,
        watchlistCount: watchlist?.length || 0
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  // Set up real-time subscriptions for live updates
  useEffect(() => {
    if (!user) return;

    const expensesChannel = supabase
      .channel('expenses-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Expenses updated, refreshing stats...');
          fetchUserStats();
        }
      )
      .subscribe();

    const transactionsChannel = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Transactions updated, refreshing stats...');
          fetchUserStats();
        }
      )
      .subscribe();

    const watchlistChannel = supabase
      .channel('watchlist-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'watchlist',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Watchlist updated, refreshing stats...');
          fetchUserStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(expensesChannel);
      supabase.removeChannel(transactionsChannel);
      supabase.removeChannel(watchlistChannel);
    };
  }, [user]);

  return { stats, loading, refetch: fetchUserStats };
}
