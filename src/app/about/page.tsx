'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Target,
  Heart,
  Users,
  Award,
  TrendingUp,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { Button } from '@/components/ui/button';

const team = [
  { name: 'Raj Kumar', role: 'CEO & Founder', image: '👨‍💼', bio: '15+ years in SaaS' },
  { name: 'Priya Singh', role: 'CTO', image: '👩‍💻', bio: 'Ex-Google Engineer' },
  { name: 'Amit Patel', role: 'Head of Product', image: '👨‍🎨', bio: 'Product Strategy Expert' },
  { name: 'Neha Sharma', role: 'Head of Customer Success', image: '👩‍💼', bio: 'Customer Experience Leader' },
];

const values = [
  {
    icon: Target,
    title: 'Customer First',
    description: 'Everything we build starts with understanding our customers needs and challenges.',
  },
  {
    icon: Heart,
    title: 'Passionate',
    description: 'We love what we do and are committed to helping coaches succeed.',
  },
  {
    icon: Users,
    title: 'Collaborative',
    description: 'We work together with our customers to build the best product possible.',
  },
  {
    icon: Award,
    title: 'Excellence',
    description: 'We strive for excellence in everything we do, from product to support.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary-50 via-white to-brand-accent-50 -z-10" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold mb-8"
          >
            <span className="bg-gradient-to-r from-brand-primary-600 to-brand-accent-600 bg-clip-text text-transparent">
              Empowering Coaches
            </span>
            <br />
            Across India
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto"
          >
            We're on a mission to help every coach and consultant build a thriving business
            with the right tools and support.
          </motion.p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Our Story</h2>
          <div className="prose prose-lg mx-auto text-gray-600">
            <p>
              CoachCRM was born from a simple observation: coaches and consultants were spending
              more time on admin work than coaching. We saw talented professionals struggle with
              spreadsheets, multiple tools, and manual processes.
            </p>
            <p>
              In 2020, we set out to change that. We built CoachCRM specifically for the Indian
              coaching market, with features like Razorpay integration, WhatsApp messaging, and
              affordable pricing designed for Indian businesses.
            </p>
            <p>
              Today, we're proud to serve over 50,000 coaches across India, helping them save time,
              grow revenue, and focus on what they do best—changing lives.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6"
                >
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-brand-primary-100 to-brand-accent-100 mb-6">
                    <Icon className="h-8 w-8 text-brand-primary-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">Meet Our Team</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 bg-white rounded-2xl shadow-lg"
              >
                <div className="text-6xl mb-4">{member.image}</div>
                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                <p className="text-brand-primary-600 font-medium mb-2">{member.role}</p>
                <p className="text-sm text-gray-600">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-primary-600 to-brand-accent-600" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Join Our Community
          </h2>
          <p className="text-xl text-white/90 mb-10">
            Be part of India's fastest-growing coaching community.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-white text-brand-primary-600 hover:bg-gray-100 px-10 py-8 text-lg">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
