-- Enable anonymous authentication and fix RLS policies for demo users
-- This allows anonymous users to access their own data while maintaining security

-- Update RLS policies to allow anonymous users to access their own data
-- The auth.uid() function works for both authenticated and anonymous users

-- Update expenses policies to work with anonymous users
DROP POLICY IF EXISTS "Users can manage own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can view own expenses" ON public.expenses;

CREATE POLICY "Users can manage own expenses" 
ON public.expenses 
FOR ALL 
TO authenticated, anon
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Update transactions policies
DROP POLICY IF EXISTS "Users can manage own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;

CREATE POLICY "Users can manage own transactions" 
ON public.transactions 
FOR ALL 
TO authenticated, anon
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Update watchlist policies
DROP POLICY IF EXISTS "Users can manage own watchlist" ON public.watchlist;
DROP POLICY IF EXISTS "Users can view own watchlist" ON public.watchlist;

CREATE POLICY "Users can manage own watchlist" 
ON public.watchlist 
FOR ALL 
TO authenticated, anon
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Update profiles policies
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated, anon
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated, anon
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated, anon
USING (auth.uid() = user_id);