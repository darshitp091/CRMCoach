'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthService } from '@/services/auth.service';
import { toast } from 'sonner';
import { Mail, ArrowLeft, BarChart3 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await AuthService.resetPassword(email);
      setEmailSent(true);
      toast.success('Password reset link sent to your email');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 text-center">
          <div>
            <Link href="/" className="flex items-center justify-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary-500">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">CoachCRM</span>
            </Link>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-secondary-100">
              <Mail className="h-8 w-8 text-brand-secondary-600" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">Check your email</h2>
            <p className="mt-2 text-sm text-gray-600">
              We've sent a password reset link to
            </p>
            <p className="mt-1 font-medium text-gray-900">{email}</p>
            <p className="mt-4 text-sm text-gray-600">
              Click the link in the email to reset your password. If you don't see it, check your spam folder.
            </p>
            <div className="mt-6">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm font-medium text-brand-primary-600 hover:text-brand-primary-500"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <Link href="/" className="flex items-center justify-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary-500">
              <BarChart3 className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">CoachCRM</span>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email and we'll send you a link to reset your password
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-primary-500 focus:outline-none focus:ring-1 focus:ring-brand-primary-500"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-primary-500 focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  Sending link...
                </>
              ) : (
                <>
                  <Mail className="h-5 w-5" />
                  Send reset link
                </>
              )}
            </button>

            <div className="text-center">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm font-medium text-brand-primary-600 hover:text-brand-primary-500"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
