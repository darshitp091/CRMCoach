'use client';

import { motion } from 'framer-motion';
import { Shield, Lock, Eye, UserCheck, Database, FileText } from 'lucide-react';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';

const sections = [
  {
    icon: Database,
    title: '1. Information We Collect',
    content: [
      {
        subtitle: '1.1 Information You Provide',
        text: 'We collect information that you voluntarily provide when using FlowCoach, including:',
        list: [
          'Account information (name, email address, organization details)',
          'Profile information (role, preferences, settings)',
          'Client data you enter into the system',
          'Session notes, payments, and other business data',
          'Communications with our support team',
        ],
      },
      {
        subtitle: '1.2 Automatically Collected Information',
        text: 'When you use FlowCoach, we automatically collect:',
        list: [
          'Usage data (features used, pages visited, time spent)',
          'Device information (browser type, operating system, IP address)',
          'Log data (access times, errors, performance metrics)',
          'Cookies and similar technologies (see our Cookie Policy)',
        ],
      },
    ],
  },
  {
    icon: Lock,
    title: '2. How We Use Your Information',
    content: [
      {
        text: 'We use your information to:',
        list: [
          'Provide, maintain, and improve FlowCoach services',
          'Process payments and manage your subscription',
          'Send important updates about your account and our services',
          'Provide customer support and respond to your requests',
          'Analyze usage patterns to enhance user experience',
          'Prevent fraud, abuse, and security threats',
          'Comply with legal obligations and enforce our Terms',
        ],
      },
    ],
  },
  {
    icon: Shield,
    title: '3. Data Security & Protection',
    content: [
      {
        text: 'We implement industry-standard security measures to protect your data:',
        list: [
          'End-to-end encryption for data transmission (TLS/SSL)',
          'Encrypted data storage using AES-256 encryption',
          'Regular security audits and penetration testing',
          'Role-based access control (RBAC) with database-level security',
          'Automated backups with 30-day retention',
          'SOC 2 Type II compliant infrastructure',
          'Multi-factor authentication (MFA) support',
        ],
      },
    ],
  },
  {
    icon: Eye,
    title: '4. Data Sharing & Disclosure',
    content: [
      {
        subtitle: '4.1 We DO NOT Sell Your Data',
        text: 'FlowCoach never sells, rents, or trades your personal information to third parties.',
      },
      {
        subtitle: '4.2 Limited Sharing',
        text: 'We only share your information in these specific cases:',
        list: [
          'With your explicit consent or at your direction',
          'With service providers who help operate our platform (hosting, payment processing, analytics) - all bound by strict confidentiality agreements',
          'To comply with legal obligations, court orders, or government requests',
          'To protect the rights, property, or safety of FlowCoach, our users, or the public',
          'In connection with a merger, acquisition, or sale of assets (with advance notice)',
        ],
      },
    ],
  },
  {
    icon: UserCheck,
    title: '5. Your Rights & Choices',
    content: [
      {
        text: 'You have the following rights regarding your data:',
        list: [
          'Access: Request a copy of all personal data we hold about you',
          'Correction: Update or correct inaccurate information',
          'Deletion: Request deletion of your data (subject to legal retention requirements)',
          'Portability: Export your data in a machine-readable format',
          'Objection: Opt-out of marketing communications or certain data processing',
          'Restriction: Limit how we use your data in specific circumstances',
        ],
      },
      {
        text: 'To exercise these rights, contact us at privacy@flowcoach.com or through your account settings.',
      },
    ],
  },
  {
    icon: FileText,
    title: '6. Data Retention',
    content: [
      {
        text: 'We retain your information for as long as necessary to:',
        list: [
          'Provide our services and maintain your account',
          'Comply with legal, tax, and accounting obligations',
          'Resolve disputes and enforce our agreements',
          'After account deletion: 30 days for recovery, then permanent deletion (except as required by law)',
        ],
      },
    ],
  },
];

const additionalSections = [
  {
    title: '7. International Data Transfers',
    text: 'FlowCoach operates globally. Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place, including Standard Contractual Clauses (SCCs) approved by the European Commission.',
  },
  {
    title: '8. Children\'s Privacy',
    text: 'FlowCoach is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If you believe we have inadvertently collected such information, please contact us immediately.',
  },
  {
    title: '9. Third-Party Links',
    text: 'Our platform may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies.',
  },
  {
    title: '10. Changes to This Policy',
    text: 'We may update this Privacy Policy from time to time. We will notify you of material changes via email or through the platform. Your continued use after changes constitutes acceptance of the updated policy.',
  },
  {
    title: '11. Contact Us',
    text: 'If you have questions about this Privacy Policy or our data practices:',
    contact: [
      'Email: privacy@flowcoach.com',
      'Mail: FlowCoach Privacy Team, Mumbai, Maharashtra, India',
      'Response time: Within 48 hours for privacy inquiries',
    ],
  },
];

export default function PrivacyPolicyPage() {
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
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-100 border-2 border-blue-200 mb-8"
          >
            <Shield className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">
              Your Privacy Matters
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-brand-primary-600 to-brand-accent-600 bg-clip-text text-transparent">
              Privacy Policy
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            How we collect, use, and protect your personal information
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-sm text-gray-500"
          >
            Last Updated: January 2, 2026 • Effective Date: January 2, 2026
          </motion.p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-12 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-gray-100">
            <p className="text-gray-700 leading-relaxed mb-4">
              At <strong>FlowCoach</strong>, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>
            <p className="text-gray-700 leading-relaxed">
              By using FlowCoach, you agree to the collection and use of information in accordance with this policy. If you do not agree, please do not use our services.
            </p>
          </div>
        </div>
      </section>

      {/* Main Sections */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-sm border-2 border-gray-100 hover:border-brand-primary-200 transition-colors"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-brand-primary-100 rounded-xl">
                    <Icon className="h-6 w-6 text-brand-primary-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 pt-2">{section.title}</h2>
                </div>

                <div className="space-y-6">
                  {section.content.map((item, idx) => (
                    <div key={idx}>
                      {item.subtitle && (
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.subtitle}</h3>
                      )}
                      {item.text && (
                        <p className="text-gray-700 leading-relaxed mb-3">{item.text}</p>
                      )}
                      {item.list && (
                        <ul className="space-y-2 ml-6">
                          {item.list.map((listItem, listIdx) => (
                            <li key={listIdx} className="text-gray-700 flex items-start gap-2">
                              <span className="text-brand-primary-600 mt-1.5">•</span>
                              <span>{listItem}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Additional Sections */}
      <section className="py-12 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          {additionalSections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-3">{section.title}</h2>
              <p className="text-gray-700 leading-relaxed mb-3">{section.text}</p>
              {section.contact && (
                <ul className="space-y-2 ml-6">
                  {section.contact.map((item, idx) => (
                    <li key={idx} className="text-gray-700 flex items-start gap-2">
                      <span className="text-brand-primary-600 mt-1.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-brand-primary-600 to-brand-accent-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Your Data is Safe With Us</h3>
            <p className="text-white/90 mb-6">
              We use bank-level encryption and follow industry best practices to protect your information.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span>SOC 2 Type II</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                <span>AES-256 Encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <span>GDPR Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
