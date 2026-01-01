import { supabase } from '@/lib/supabase/client';

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  organizationName: string;
  organizationSlug: string;
  selectedPlan?: string;
  role?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export class AuthService {
  /**
   * Sign up a new user and create their organization
   */
  static async signUp(data: SignUpData) {
    // 1. Create auth user with metadata and email verification
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          organization_name: data.organizationName,
          organization_slug: data.organizationSlug,
          selected_plan: data.selectedPlan || 'standard',
          selected_role: data.role || 'owner',
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('User creation failed');

    // Check if email confirmation is required
    if (authData.user && !authData.user.email_confirmed_at) {
      // Email verification required - return special response
      return {
        user: authData.user,
        organization: null,
        emailVerificationRequired: true,
      };
    }

    // Wait a bit for the trigger to create the user profile
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 2. Create organization with 7-day trial
    const { data: org, error: orgError } = await ((supabase
      .from('organizations') as any)
      .insert({
        name: data.organizationName,
        slug: data.organizationSlug,
        subscription_plan: 'standard',
        subscription_status: 'trial',
        trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single());

    if (orgError) throw orgError;
    if (!org) throw new Error('Organization creation failed');

    // 3. Update user with organization_id and role
    const { error: updateError } = await ((supabase
      .from('users') as any)
      .update({
        organization_id: org.id,
        role: data.role || 'owner',
      })
      .eq('id', authData.user.id));

    if (updateError) throw updateError;

    return { user: authData.user, organization: org };
  }

  /**
   * Sign in existing user
   */
  static async signIn(data: SignInData) {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw error;
    return authData;
  }

  /**
   * Sign out current user
   */
  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  /**
   * Reset password
   */
  static async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    });
    if (error) throw error;
  }

  /**
   * Update password
   */
  static async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  }

  /**
   * Get current session
   */
  static async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  /**
   * Get current user with profile and organization
   */
  static async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);

        // Return basic user info from auth if profile fetch fails
        return {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || '',
          role: null,
          organization_id: null,
          created_at: user.created_at,
        };
      }

      if (!profile) {
        // Profile doesn't exist yet, return basic info
        return {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || '',
          role: null,
          organization_id: null,
          created_at: user.created_at,
        };
      }

      return profile;
    } catch (err) {
      console.error('Error getting current user:', err);

      // Fallback to auth user data
      return {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || '',
        role: null,
        organization_id: null,
        created_at: user.created_at,
      };
    }
  }

  /**
   * Check if organization slug is available
   */
  static async isSlugAvailable(slug: string): Promise<boolean> {
    const { data } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    return !data;
  }
}
