'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the hash fragment from URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        if (!accessToken) {
          throw new Error('No access token found');
        }

        // Set the session using the tokens
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });

        if (sessionError) throw sessionError;

        if (!data.user) {
          throw new Error('No user data found');
        }

        // Wait a moment for the database trigger to create the user profile
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Check if user has an organization
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('organization_id, role')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('Profile error:', profileError);
        }

        // If this is a signup confirmation and no organization exists, create one
        if (type === 'signup' && !userProfile?.organization_id) {
          // Get organization details from user metadata or generate defaults
          const orgName = data.user.user_metadata?.organization_name || `${data.user.user_metadata?.full_name}'s Organization`;
          const orgSlug = data.user.user_metadata?.organization_slug || `org-${data.user.id.substring(0, 8)}`;
          const selectedPlan = data.user.user_metadata?.selected_plan || 'standard';

          // Create organization with 7-day trial
          const { data: org, error: orgError } = await supabase
            .from('organizations')
            .insert({
              name: orgName,
              slug: orgSlug,
              subscription_plan: selectedPlan,
              subscription_status: 'trial',
              trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            })
            .select()
            .single();

          if (orgError) {
            console.error('Organization creation error:', orgError);
            throw new Error('Failed to create organization');
          }

          // Update user with organization_id and set as owner
          const { error: updateError } = await supabase
            .from('users')
            .update({
              organization_id: org.id,
              role: 'owner',
            })
            .eq('id', data.user.id);

          if (updateError) {
            console.error('User update error:', updateError);
            throw new Error('Failed to update user profile');
          }
        }

        // Redirect to dashboard
        router.push('/dashboard');
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Authentication failed');

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login?error=auth_callback_failed');
        }, 3000);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-brand-primary-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Confirming your account...</h2>
        <p className="text-gray-600">Please wait while we complete your signup.</p>
      </div>
    </div>
  );
}
