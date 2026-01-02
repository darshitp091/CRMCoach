'use client';

import { motion } from 'framer-motion';
import { Cookie, Settings, Info, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';

const cookieTypes = [
  {
    icon: CheckCircle,
    type: 'Necessary Cookies',
    required: true,
    description: 'Essential for the website to function properly. Cannot be disabled.',
    examples: [
      'Authentication tokens (keeps you logged in)',
      'Session management (maintains your active session)',
      'Security cookies (prevents fraudulent activity)',
      'Load balancing cookies (distributes network traffic)',
      'Cookie consent preferences (remembers your choices)',
    ],
    retention: 'Session or up to 1 year',
  },
  {
    icon: Info,
    type: 'Analytics Cookies',
    required: false,
    description: 'Help us understand how visitors interact with our website.',
    examples: [
      'Google Analytics (page views, session duration)',
      'Hotjar (heatmaps, user recordings)',
      'Performance metrics (page load times, errors)',
      'Usage patterns (features used, navigation paths)',
    ],
    retention: 'Up to 2 years',
    thirdParty: ['Google Analytics', 'Hotjar'],
  },
  {
    icon: Settings,
    type: 'Marketing Cookies',
    required: false,
    description: 'Used to track visitors and display relevant ads.',
    examples: [
      'Facebook Pixel (ad targeting, conversions)',
      'Google Ads (retargeting campaigns)',
      'LinkedIn Insight Tag (B2B targeting)',
      'Twitter conversion tracking',
    ],
    retention: 'Up to 1 year',
    thirdParty: ['Facebook', 'Google', 'LinkedIn', 'Twitter'],
  },
];

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary-50 via-white to-brand-accent-50 -z-10" />
        <div className="absolute inset-0 bg-mesh-gradient opacity-20 -z-10 animate-gradient" style={{ backgroundSize: '400% 400%' }} />

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-orange-100 border-2 border-orange-200 mb-8"
          >
            <Cookie className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-semibold text-orange-700">
              Cookie Information
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-brand-primary-600 to-brand-accent-600 bg-clip-text text-transparent">
              Cookie Policy
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            How we use cookies and similar technologies on FlowCoach
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-sm text-gray-500"
          >
            Last Updated: January 2, 2026
          </motion.p>
        </div>
      </section>

      {/* What are Cookies */}
      <section className="py-12 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What are Cookies?</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Cookies are small text files that are placed on your device when you visit a website. They help websites remember your preferences, improve your experience, and provide analytics about site usage.
            </p>
            <p className="text-gray-700 leading-relaxed">
              FlowCoach uses cookies and similar technologies (like local storage and session storage) to enhance your experience and improve our services.
            </p>
          </div>
        </div>
      </section>

      {/* Types of Cookies */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Types of Cookies We Use
          </h2>

          <div className="space-y-8">
            {cookieTypes.map((cookie, index) => {
              const Icon = cookie.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-8 shadow-sm border-2 border-gray-100 hover:border-brand-primary-200 transition-colors"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-brand-primary-100 rounded-xl">
                        <Icon className="h-6 w-6 text-brand-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{cookie.type}</h3>
                        <p className="text-sm text-gray-600 mt-1">{cookie.description}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      cookie.required
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {cookie.required ? 'Always Active' : 'Optional'}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Examples:</h4>
                      <ul className="space-y-2 ml-6">
                        {cookie.examples.map((example, idx) => (
                          <li key={idx} className="text-gray-700 flex items-start gap-2">
                            <span className="text-brand-primary-600 mt-1.5">•</span>
                            <span>{example}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-wrap gap-6 text-sm">
                      <div>
                        <span className="font-semibold text-gray-900">Retention:</span>{' '}
                        <span className="text-gray-700">{cookie.retention}</span>
                      </div>
                      {cookie.thirdParty && (
                        <div>
                          <span className="font-semibold text-gray-900">Third Parties:</span>{' '}
                          <span className="text-gray-700">{cookie.thirdParty.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Managing Cookies */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Manage Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              You have control over which cookies you accept. Here's how you can manage them:
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">1. Cookie Consent Banner</h3>
                <p className="text-gray-700 text-sm">
                  When you first visit FlowCoach, you'll see a cookie consent banner. You can choose to accept all cookies, accept only necessary cookies, or customize your preferences.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">2. Browser Settings</h3>
                <p className="text-gray-700 text-sm mb-3">
                  Most browsers allow you to control cookies through their settings:
                </p>
                <ul className="space-y-2 ml-6 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-brand-primary-600 mt-1">•</span>
                    <span><strong>Chrome:</strong> Settings → Privacy and Security → Cookies and other site data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-primary-600 mt-1">•</span>
                    <span><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-primary-600 mt-1">•</span>
                    <span><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-primary-600 mt-1">•</span>
                    <span><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">3. Account Settings</h3>
                <p className="text-gray-700 text-sm">
                  If you're logged in, you can manage your cookie preferences from your account settings under Privacy & Security.
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Disabling certain cookies may affect the functionality of FlowCoach. Necessary cookies cannot be disabled as they are essential for the platform to work.
              </p>
            </div>
          </div>

          {/* Third-Party Cookies */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Some cookies are set by third-party services that appear on our pages. We do not control these cookies. Please review the privacy policies of these services:
            </p>
            <ul className="space-y-2 ml-6">
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-brand-primary-600 mt-1.5">•</span>
                <span>Google Analytics: <a href="https://policies.google.com/privacy" className="text-brand-primary-600 hover:underline" target="_blank" rel="noopener">Privacy Policy</a></span>
              </li>
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-brand-primary-600 mt-1.5">•</span>
                <span>Hotjar: <a href="https://www.hotjar.com/legal/policies/privacy/" className="text-brand-primary-600 hover:underline" target="_blank" rel="noopener">Privacy Policy</a></span>
              </li>
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-brand-primary-600 mt-1.5">•</span>
                <span>Razorpay: <a href="https://razorpay.com/privacy/" className="text-brand-primary-600 hover:underline" target="_blank" rel="noopener">Privacy Policy</a></span>
              </li>
            </ul>
          </div>

          {/* Updates */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Updates to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Cookie Policy from time to time. We will notify you of any significant changes by posting a notice on our website or sending you an email. Please review this policy periodically.
            </p>
          </div>

          {/* Contact */}
          <div className="bg-gradient-to-r from-brand-primary-600 to-brand-accent-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Questions About Cookies?</h3>
            <p className="text-white/90 mb-6">
              If you have any questions about our use of cookies, please contact us:
            </p>
            <div className="text-sm space-y-2">
              <p>Email: privacy@flowcoach.com</p>
              <p>We'll respond within 48 hours</p>
            </div>
            <p className="mt-6 text-sm text-white/80">
              Also see our{' '}
              <Link href="/privacy" className="underline hover:text-white">
                Privacy Policy
              </Link>{' '}
              and{' '}
              <Link href="/gdpr" className="underline hover:text-white">
                GDPR Information
              </Link>
            </p>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
