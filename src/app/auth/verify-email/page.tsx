'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowRight, CheckCircle2, BarChart3, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') || '';
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResendEmail = async () => {
    if (!email) {
      toast.error('Email address not found');
      return;
    }

    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      });

      if (error) throw error;

      setResent(true);
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary-50 via-white to-brand-accent-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary-500">
              <BarChart3 className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">FlowCoach</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
          </div>

          {/* Main Message */}
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-3">
            Check Your Email
          </h1>
          <p className="text-gray-600 text-center mb-6">
            We've sent a verification link to
          </p>
          <p className="text-brand-primary-600 font-semibold text-center mb-8 bg-brand-primary-50 px-4 py-2 rounded-lg">
            {email}
          </p>

          {/* Instructions */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-3">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-brand-primary-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Check your inbox</p>
                <p className="text-xs text-gray-600">Click the verification link in the email we sent you.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ArrowRight className="h-5 w-5 text-brand-primary-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">You'll be redirected</p>
                <p className="text-xs text-gray-600">After clicking the link, you'll be automatically logged in.</p>
              </div>
            </div>
          </div>

          {/* Resend Email */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">Didn't receive the email?</p>
            <Button
              onClick={handleResendEmail}
              disabled={resending || resent}
              variant="outline"
              className="w-full"
            >
              {resending ? 'Sending...' : resent ? 'Email Sent!' : 'Resend Verification Email'}
            </Button>
          </div>

          {/* Help Text */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Check your spam folder if you don't see the email.
              <br />
              Need help?{' '}
              <Link href="/contact" className="text-brand-primary-600 hover:text-brand-primary-700 font-medium">
                Contact support
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm text-gray-600 hover:text-brand-primary-600 font-medium inline-flex items-center gap-1"
          >
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-brand-primary-50 via-white to-brand-accent-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-brand-primary-600" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
