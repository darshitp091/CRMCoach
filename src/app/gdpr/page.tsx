'use client';

import { motion } from 'framer-motion';
import { Shield, Download, Trash2, Edit, Eye, Lock, CheckCircle, Mail } from 'lucide-react';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { Button } from '@/components/ui/button';

const rights = [
  {
    icon: Eye,
    title: 'Right to Access',
    description: 'Request a copy of all personal data we hold about you in a structured, commonly used format.',
    action: 'Request Your Data',
    timeframe: 'Within 30 days',
  },
  {
    icon: Edit,
    title: 'Right to Rectification',
    description: 'Correct any inaccurate or incomplete personal information we have about you.',
    action: 'Update Your Data',
    timeframe: 'Immediate in account settings',
  },
  {
    icon: Trash2,
    title: 'Right to Erasure',
    description: 'Request deletion of your personal data ("right to be forgotten") under certain conditions.',
    action: 'Delete Your Account',
    timeframe: 'Within 30 days',
  },
  {
    icon: Lock,
    title: 'Right to Restriction',
    description: 'Limit how we process your personal data in specific circumstances.',
    action: 'Restrict Processing',
    timeframe: 'Within 30 days',
  },
  {
    icon: Download,
    title: 'Right to Data Portability',
    description: 'Receive your personal data in a portable format and transmit it to another controller.',
    action: 'Export Your Data',
    timeframe: 'Within 30 days',
  },
  {
    icon: CheckCircle,
    title: 'Right to Object',
    description: 'Object to processing of your personal data for direct marketing or legitimate interests.',
    action: 'Manage Preferences',
    timeframe: 'Immediate',
  },
];

export default function GDPRPage() {
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
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-green-100 border-2 border-green-200 mb-8"
          >
            <Shield className="h-5 w-5 text-green-600" />
            <span className="text-sm font-semibold text-green-700">
              GDPR Compliant
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-brand-primary-600 to-brand-accent-600 bg-clip-text text-transparent">
              GDPR Compliance
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Your data rights under the General Data Protection Regulation
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

      {/* Introduction */}
      <section className="py-12 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What is GDPR?</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The General Data Protection Regulation (GDPR) is a comprehensive data protection law that came into effect on May 25, 2018. It gives individuals in the European Union enhanced rights over their personal data and imposes strict obligations on organizations that process such data.
            </p>
            <p className="text-gray-700 leading-relaxed">
              At <strong>FlowCoach</strong>, we are fully committed to GDPR compliance and protecting your privacy rights, regardless of where you are located.
            </p>
          </div>
        </div>
      </section>

      {/* Your Rights */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Your Data Rights Under GDPR
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rights.map((right, index) => {
              const Icon = right.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-100 hover:border-brand-primary-300 hover:shadow-lg transition-all"
                >
                  <div className="p-3 bg-brand-primary-100 rounded-xl inline-block mb-4">
                    <Icon className="h-6 w-6 text-brand-primary-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{right.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">{right.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-brand-primary-600 font-medium">{right.action}</span>
                    <span className="text-gray-500">{right.timeframe}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How to Exercise Rights */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            How to Exercise Your Rights
          </h2>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-100"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary-100 text-brand-primary-600 font-bold">1</span>
                Via Your Account Settings
              </h3>
              <p className="text-gray-700 mb-4">
                Most data management can be done directly from your FlowCoach account:
              </p>
              <ul className="space-y-2 ml-6">
                <li className="text-gray-700 flex items-start gap-2">
                  <span className="text-brand-primary-600 mt-1.5">•</span>
                  <span>Access your data: Dashboard → Settings → Privacy & Data</span>
                </li>
                <li className="text-gray-700 flex items-start gap-2">
                  <span className="text-brand-primary-600 mt-1.5">•</span>
                  <span>Update information: Profile Settings</span>
                </li>
                <li className="text-gray-700 flex items-start gap-2">
                  <span className="text-brand-primary-600 mt-1.5">•</span>
                  <span>Export data: Settings → Data Export (CSV, JSON formats)</span>
                </li>
                <li className="text-gray-700 flex items-start gap-2">
                  <span className="text-brand-primary-600 mt-1.5">•</span>
                  <span>Delete account: Settings → Account → Delete Account</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-100"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary-100 text-brand-primary-600 font-bold">2</span>
                Contact Our Data Protection Officer
              </h3>
              <p className="text-gray-700 mb-4">
                For complex requests or if you need assistance:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-gray-700"><strong>Email:</strong> dpo@flowcoach.com</p>
                <p className="text-gray-700"><strong>Subject Line:</strong> "GDPR Data Request - [Your Request Type]"</p>
                <p className="text-gray-700"><strong>Response Time:</strong> Within 48 hours (acknowledgment), 30 days (completion)</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-100"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary-100 text-brand-primary-600 font-bold">3</span>
                Required Information
              </h3>
              <p className="text-gray-700 mb-4">
                To process your request, please provide:
              </p>
              <ul className="space-y-2 ml-6">
                <li className="text-gray-700 flex items-start gap-2">
                  <span className="text-brand-primary-600 mt-1.5">•</span>
                  <span>Your full name and email address associated with your account</span>
                </li>
                <li className="text-gray-700 flex items-start gap-2">
                  <span className="text-brand-primary-600 mt-1.5">•</span>
                  <span>Type of request (access, deletion, rectification, etc.)</span>
                </li>
                <li className="text-gray-700 flex items-start gap-2">
                  <span className="text-brand-primary-600 mt-1.5">•</span>
                  <span>Proof of identity (for security purposes)</span>
                </li>
                <li className="text-gray-700 flex items-start gap-2">
                  <span className="text-brand-primary-600 mt-1.5">•</span>
                  <span>Any additional details to help us process your request</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Commitments */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Our GDPR Commitments
          </h2>

          <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-gray-100">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Lawful Processing</h4>
                  <p className="text-sm text-gray-600">We only process data with valid legal basis (consent, contract, legitimate interest)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Data Minimization</h4>
                  <p className="text-sm text-gray-600">We collect only what's necessary for our services</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Transparent Communication</h4>
                  <p className="text-sm text-gray-600">Clear privacy notices and policies in plain language</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Security by Design</h4>
                  <p className="text-sm text-gray-600">Built-in security and privacy from the ground up</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Breach Notification</h4>
                  <p className="text-sm text-gray-600">72-hour notification for data breaches affecting you</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Data Protection Officer</h4>
                  <p className="text-sm text-gray-600">Dedicated DPO for handling privacy matters</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* File a Complaint */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Right to Lodge a Complaint</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you believe we have not handled your personal data in accordance with GDPR, you have the right to lodge a complaint with a supervisory authority.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              However, we encourage you to contact us first so we can address your concerns:
            </p>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <h3 className="font-bold text-blue-900 mb-3">Contact Our DPO</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p><strong>Email:</strong> dpo@flowcoach.com</p>
                <p><strong>Subject:</strong> "GDPR Complaint"</p>
                <p><strong>We will respond within 48 hours</strong></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-brand-primary-600 to-brand-accent-600 rounded-2xl p-12 text-white text-center">
            <Shield className="h-16 w-16 mx-auto mb-6 text-white" />
            <h2 className="text-3xl font-bold mb-4">Your Privacy is Our Priority</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              We're committed to protecting your rights and ensuring full GDPR compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/privacy">
                <Button size="lg" variant="outline" className="bg-white text-brand-primary-600 hover:bg-gray-100 border-0">
                  Read Privacy Policy
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="bg-white/10 text-white hover:bg-white/20 border-2 border-white">
                  <Mail className="mr-2 h-5 w-5" />
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
