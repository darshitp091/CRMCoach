-- =====================================================
-- FIX: Users table RLS policies
-- =====================================================
-- Allow authenticated users to read their own profile
-- =====================================================

-- Enable RLS on users table if not already enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow system to insert user profiles (for the trigger)
DROP POLICY IF EXISTS "System can insert user profiles" ON public.users;
CREATE POLICY "System can insert user profiles"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

COMMENT ON POLICY "Users can view own profile" ON public.users IS 'Allow authenticated users to view their own profile data';
COMMENT ON POLICY "Users can update own profile" ON public.users IS 'Allow authenticated users to update their own profile data';
COMMENT ON POLICY "System can insert user profiles" ON public.users IS 'Allow system to create user profiles during signup';
