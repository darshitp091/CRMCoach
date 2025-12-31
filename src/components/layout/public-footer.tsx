'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  Mail,
  MapPin,
  Phone,
  ArrowUpRight,
} from 'lucide-react';

const footerLinks = {
  product: [
    { name: 'Features', href: '/features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Integrations', href: '/integrations' },
    { name: 'API', href: '/api' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Blog', href: '/blog' },
    { name: 'Press', href: '/press' },
  ],
  resources: [
    { name: 'Documentation', href: '/docs' },
    { name: 'Help Center', href: '/help' },
    { name: 'Community', href: '/community' },
    { name: 'Contact', href: '/contact' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'GDPR', href: '/gdpr' },
  ],
};

const socialLinks = [
  { name: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com' },
  { name: 'Facebook', icon: Facebook, href: 'https://facebook.com' },
  { name: 'Instagram', icon: Instagram, href: 'https://instagram.com' },
  { name: 'YouTube', icon: Youtube, href: 'https://youtube.com' },
];

export function PublicFooter() {
  return (
    <footer className="relative bg-gradient-to-b from-gray-900 to-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-mesh-gradient animate-gradient" style={{ backgroundSize: '400% 400%' }} />
      </div>

      <div className="relative">
        {/* Main Footer Content */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Link href="/" className="flex items-center gap-2 group">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-primary-500 to-brand-accent-500 rounded-lg blur-lg opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="relative bg-gradient-to-br from-brand-primary-600 to-brand-accent-600 p-2 rounded-lg">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <span className="text-2xl font-bold">CoachCRM</span>
                </Link>
                <p className="mt-4 text-gray-400 text-sm leading-relaxed">
                  Empowering coaches and consultants with intelligent CRM solutions. Transform your business with automation, insights, and growth.
                </p>

                {/* Contact Info */}
                <div className="mt-6 space-y-3">
                  <a href="mailto:hello@coachcrm.com" className="flex items-center gap-2 text-sm text-gray-400 hover:text-brand-primary-400 transition-colors">
                    <Mail className="h-4 w-4" />
                    hello@coachcrm.com
                  </a>
                  <a href="tel:+918888888888" className="flex items-center gap-2 text-sm text-gray-400 hover:text-brand-primary-400 transition-colors">
                    <Phone className="h-4 w-4" />
                    +91 88888 88888
                  </a>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <MapPin className="h-4 w-4" />
                    Mumbai, Maharashtra, India
                  </div>
                </div>

                {/* Social Links */}
                <div className="mt-6 flex items-center gap-3">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <motion.a
                        key={social.name}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <Icon className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                      </motion.a>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* Links Columns */}
            {Object.entries(footerLinks).map(([category, links], index) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
                  {category}
                </h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-400 hover:text-brand-primary-400 transition-colors flex items-center gap-1 group"
                      >
                        {link.name}
                        <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Newsletter Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-16 pt-12 border-t border-white/10"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
                <p className="text-sm text-gray-400">
                  Get the latest updates, tips, and exclusive offers delivered to your inbox.
                </p>
              </div>
              <div className="flex w-full md:w-auto gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 md:w-64 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-brand-primary-500 transition-colors"
                />
                <button className="px-6 py-2 bg-gradient-to-r from-brand-primary-600 to-brand-accent-600 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-brand-primary-500/50 transition-all">
                  Subscribe
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-400">
                © {new Date().getFullYear()} CoachCRM. All rights reserved. Built with ❤️ in India.
              </p>
              <div className="flex items-center gap-6 text-xs text-gray-400">
                <span>🇮🇳 Made in India</span>
                <span>🔒 Secured by SSL</span>
                <span>✨ Powered by AI</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
