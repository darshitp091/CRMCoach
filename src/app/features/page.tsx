'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Users,
  Calendar,
  BarChart3,
  MessageSquare,
  CreditCard,
  Zap,
  Shield,
  Video,
  Mail,
  Bell,
  FileText,
  Clock,
  ArrowRight,
  Check,
  Sparkles,
} from 'lucide-react';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { Button } from '@/components/ui/button';

const features = [
  {
    category: 'Client Management',
    icon: Users,
    gradient: 'from-blue-500 to-cyan-500',
    items: [
      {
        title: 'Smart Client Profiles',
        description: 'Complete client profiles with contact details, session history, notes, and custom fields.',
      },
      {
        title: 'Client Segmentation',
        description: 'Organize clients with tags, statuses, and custom segments for targeted communications.',
      },
      {
        title: 'Activity Timeline',
        description: 'Track all client interactions, sessions, payments, and communications in one place.',
      },
      {
        title: 'Client Portal',
        description: 'Give clients access to their own portal for booking, payments, and resources.',
      },
    ],
  },
  {
    category: 'Scheduling & Sessions',
    icon: Calendar,
    gradient: 'from-purple-500 to-pink-500',
    items: [
      {
        title: 'Smart Calendar',
        description: 'Sync with Google Calendar, Outlook, and Apple Calendar for seamless scheduling.',
      },
      {
        title: 'Automated Booking',
        description: 'Let clients book sessions 24/7 with your availability rules and buffer times.',
      },
      {
        title: 'Time Zone Support',
        description: 'Automatic time zone detection and conversion for global clients.',
      },
      {
        title: 'Session Reminders',
        description: 'Automated email and SMS reminders to reduce no-shows by 80%.',
      },
    ],
  },
  {
    category: 'Analytics & Reporting',
    icon: BarChart3,
    gradient: 'from-orange-500 to-red-500',
    items: [
      {
        title: 'Revenue Dashboard',
        description: 'Track MRR, revenue growth, and financial metrics in real-time.',
      },
      {
        title: 'Client Insights',
        description: 'Analyze client progress, retention rates, and lifetime value.',
      },
      {
        title: 'Custom Reports',
        description: 'Build custom reports with drag-and-drop query builder.',
      },
      {
        title: 'Export Data',
        description: 'Export reports in PDF, Excel, or CSV formats for offline analysis.',
      },
    ],
  },
  {
    category: 'Communications',
    icon: MessageSquare,
    gradient: 'from-green-500 to-teal-500',
    items: [
      {
        title: 'Email Campaigns',
        description: 'Send personalized email campaigns with beautiful templates and tracking.',
      },
      {
        title: 'SMS Messaging',
        description: 'Send SMS reminders, updates, and promotions via MSG91 integration.',
      },
      {
        title: 'WhatsApp Business',
        description: 'Connect with clients on WhatsApp with automated messages and broadcasts.',
      },
      {
        title: 'Email Templates',
        description: 'Pre-built and custom templates for common communications.',
      },
    ],
  },
  {
    category: 'Payments & Billing',
    icon: CreditCard,
    gradient: 'from-indigo-500 to-purple-500',
    items: [
      {
        title: 'Razorpay Integration',
        description: 'Accept payments via UPI, cards, netbanking, and wallets.',
      },
      {
        title: 'Automated Invoicing',
        description: 'Generate and send professional invoices automatically.',
      },
      {
        title: 'Subscription Management',
        description: 'Recurring billing for coaching packages and memberships.',
      },
      {
        title: 'Payment Reminders',
        description: 'Automated reminders for pending and overdue payments.',
      },
    ],
  },
  {
    category: 'Automation & Workflows',
    icon: Zap,
    gradient: 'from-yellow-500 to-orange-500',
    items: [
      {
        title: 'Workflow Builder',
        description: 'Create custom automations with visual no-code builder.',
      },
      {
        title: 'Trigger Actions',
        description: 'Set up triggers based on events, dates, or client actions.',
      },
      {
        title: 'Email Sequences',
        description: 'Automated email sequences for onboarding and nurturing.',
      },
      {
        title: 'Task Automation',
        description: 'Automate repetitive tasks to save 10+ hours per week.',
      },
    ],
  },
  {
    category: 'Video Calling',
    icon: Video,
    gradient: 'from-red-500 to-pink-500',
    items: [
      {
        title: 'Built-in Video',
        description: 'Conduct sessions via integrated video calling powered by Daily.co.',
      },
      {
        title: 'Screen Sharing',
        description: 'Share your screen during sessions for better collaboration.',
      },
      {
        title: 'Session Recording',
        description: 'Record sessions and share with clients automatically.',
      },
      {
        title: 'Virtual Waiting Room',
        description: 'Professional waiting room experience for clients.',
      },
    ],
  },
  {
    category: 'Security & Compliance',
    icon: Shield,
    gradient: 'from-gray-500 to-slate-500',
    items: [
      {
        title: 'Data Encryption',
        description: 'End-to-end encryption for all client data and communications.',
      },
      {
        title: 'GDPR Compliant',
        description: 'Fully compliant with GDPR and data privacy regulations.',
      },
      {
        title: 'Role-Based Access',
        description: 'Control team member access with granular permissions.',
      },
      {
        title: 'Regular Backups',
        description: 'Automatic daily backups with 99.9% uptime guarantee.',
      },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary-50 via-white to-brand-accent-50 -z-10" />
        <div className="absolute inset-0 bg-mesh-gradient opacity-20 -z-10 animate-gradient" style={{ backgroundSize: '400% 400%' }} />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-brand-primary-100 to-brand-accent-100 border-2 border-brand-primary-200 mb-8"
          >
            <Sparkles className="h-5 w-5 text-brand-primary-600" />
            <span className="text-sm font-semibold text-brand-primary-700">All-in-One Platform</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold mb-8"
          >
            <span className="bg-gradient-to-r from-brand-primary-600 to-brand-accent-600 bg-clip-text text-transparent">
              Everything You Need
            </span>
            <br />
            to Grow Your Business
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12"
          >
            Powerful features designed specifically for coaches and consultants.
            <br />
            Automate your workflow, delight your clients, and scale effortlessly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Link href="/signup">
              <Button size="lg" className="px-10 py-8 text-lg">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-32">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="relative"
                >
                  {/* Category Header */}
                  <div className={`flex items-center gap-6 mb-12 ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`flex-shrink-0 p-6 rounded-3xl bg-gradient-to-br ${feature.gradient} shadow-2xl`}>
                      <Icon className="h-12 w-12 text-white" />
                    </div>
                    <div className={isEven ? 'text-left' : 'text-right'}>
                      <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-brand-primary-600 to-brand-accent-600 bg-clip-text text-transparent">
                        {feature.category}
                      </h2>
                    </div>
                  </div>

                  {/* Feature Items */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {feature.items.map((item, itemIndex) => (
                      <motion.div
                        key={itemIndex}
                        initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: itemIndex * 0.1 }}
                        whileHover={{ scale: 1.03, y: -5 }}
                        className="p-6 bg-white rounded-2xl border-2 border-gray-100 hover:border-brand-primary-200 hover:shadow-xl transition-all group"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`flex-shrink-0 p-2 rounded-lg bg-gradient-to-br ${feature.gradient} group-hover:scale-110 transition-transform`}>
                            <Check className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-brand-primary-700 transition-colors">
                              {item.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-primary-600 via-brand-accent-600 to-brand-secondary-600" />
        <div className="absolute inset-0 bg-mesh-gradient opacity-30 animate-gradient" style={{ backgroundSize: '400% 400%' }} />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-white/90 mb-10">
              Join thousands of coaches using FlowCoach to grow their business.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="bg-white text-brand-primary-600 hover:bg-gray-100 px-10 py-8 text-lg">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-10 py-8 text-lg">
                  View Pricing
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
