
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
    if (!user) return;

    try {
      setLoading(true);

      // Fetch expenses
      const { data: expenses } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', user.id);

      // Fetch transactions
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id);

      // Fetch watchlist
      const { data: watchlist } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', user.id);

      const totalExpenses = (expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0) +
                           (transactions?.filter(t => t.type === 'debit').reduce((sum, t) => sum + Number(t.amount), 0) || 0);
      
      const credits = transactions?.filter(t => t.type === 'credit')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      
      const debits = transactions?.filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      const netBalance = credits - debits - (expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0);
      
      // Calculate portfolio growth (dummy calculation for now)
      const portfolioGrowth = watchlist?.length ? Math.random() * 20 - 10 : 0;

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

  // Set up real-time subscriptions
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
        () => fetchUserStats()
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
        () => fetchUserStats()
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
        () => fetchUserStats()
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
