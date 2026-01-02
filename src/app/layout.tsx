import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { CookieConsentBanner } from '@/components/cookies/cookie-consent-banner';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'FlowCoach - Where Coaching Flows Naturally',
  description: 'All-in-one coaching platform built for growing teams. Manage clients, sessions, payments, and automations seamlessly with intelligent workflows and powerful RBAC.',
  keywords: ['coaching platform', 'coaching CRM', 'client management', 'session tracking', 'automation', 'RBAC', 'team collaboration', 'coaching software'],
  authors: [{ name: 'FlowCoach' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#6366F1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
        <CookieConsentBanner />
        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={3000}
        />
      </body>
    </html>
  );
}
