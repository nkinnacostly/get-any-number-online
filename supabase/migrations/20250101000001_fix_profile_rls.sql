-- Fix RLS policy to allow profile creation during signup
-- Drop the existing insert policy
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create a new policy that allows profile creation for unauthenticated users
-- This is needed because during signup, the user is not yet authenticated
CREATE POLICY "Allow profile creation during signup" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- Also create a policy for authenticated users to insert their own profile
CREATE POLICY "Authenticated users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
