'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Crown,
  Shield,
  Target,
  Users,
  HeadphonesIcon,
  Check,
  X,
  ArrowRight,
  Info,
  Sparkles,
  DollarSign,
} from 'lucide-react';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { Button } from '@/components/ui/button';

const roles = [
  {
    id: 'owner',
    name: 'Owner',
    icon: Crown,
    color: 'from-purple-600 to-indigo-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    price: 'Included',
    priceDetail: 'One per organization',
    description: 'Full control of your coaching business',
    meaning: 'The person who owns and pays for the account',
    useCase: 'Business owner, founder, CEO',
    quantity: 'Exactly 1 per account',
    features: {
      billing: ['Full billing access', 'Change subscription', 'Update payment method', 'Delete account', 'Transfer ownership'],
      team: ['Add/remove any member', 'Change all roles', 'View team performance', 'Assign clients', 'Cannot be removed'],
      data: ['View ALL clients', 'View ALL sessions', 'Edit everything', 'Delete anything', 'Export all data'],
      features: ['All integrations', 'Customize branding', 'Set up automations', 'API access', 'Unlimited AI features'],
    },
  },
  {
    id: 'admin',
    name: 'Admin',
    icon: Shield,
    color: 'from-blue-600 to-cyan-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    price: '$18',
    priceDetail: 'per user/month (₹1,620)',
    priceNote: '60% cheaper than competitors!',
    description: 'Trusted partner with near-full access',
    meaning: 'Senior manager or business partner',
    useCase: 'Head coach, COO, operations lead',
    quantity: 'Unlimited',
    features: {
      billing: ['View invoices only', 'NO subscription changes', 'NO payment updates', 'Cannot delete account', 'Cannot remove owner'],
      team: ['Add/remove members', 'Change roles', 'View team performance', 'Assign clients', 'Manage schedules'],
      data: ['View ALL clients', 'View ALL sessions', 'Edit all data', 'Delete data', 'Export all data'],
      features: ['All integrations', 'Customize branding', 'Set up automations', 'All features', 'Unlimited AI'],
    },
  },
  {
    id: 'manager',
    name: 'Manager',
    icon: Target,
    color: 'from-green-600 to-emerald-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    price: '$15',
    priceDetail: 'per user/month (₹1,350)',
    priceNote: '63% cheaper than competitors!',
    description: 'Team oversight and coordination',
    meaning: 'Operations manager or team lead',
    useCase: 'Client success manager, operations coordinator',
    quantity: 'Unlimited',
    features: {
      billing: ['NO billing access', 'NO subscription access'],
      team: ['Assign clients', 'View team calendars', 'Edit team schedules', 'View performance', 'NO add/remove members'],
      data: ['View ALL clients', 'View ALL sessions', 'Edit own data', 'Limited edit others', 'Export all data'],
      features: ['Message all clients', 'Process payments', 'Create resources', 'View analytics', 'NO integrations', 'NO branding'],
    },
  },
  {
    id: 'coach',
    name: 'Coach',
    icon: Users,
    color: 'from-orange-600 to-red-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    price: '$12',
    priceDetail: 'per user/month (₹1,080)',
    priceNote: '66% cheaper! $10 for 5+, $8 for 10+ coaches',
    description: 'Individual practitioner access',
    meaning: 'The people who coach your clients',
    useCase: 'Coaches, consultants, practitioners',
    quantity: 'Unlimited',
    popular: true,
    features: {
      billing: ['NO billing access'],
      team: ['NO team management', 'Own calendar only'],
      data: ['View ASSIGNED clients only', 'View OWN sessions only', 'Edit own clients', 'Create session notes', 'NO other coaches data', 'Export own data only'],
      features: ['Conduct sessions', 'Message assigned clients', 'Create resources', 'Schedule appointments', 'AI features', 'NO settings access'],
    },
  },
  {
    id: 'support',
    name: 'Support',
    icon: HeadphonesIcon,
    color: 'from-pink-600 to-rose-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600',
    price: 'FREE',
    priceDetail: 'on all paid plans',
    priceNote: 'Unlimited support seats included!',
    description: 'Administrative helper role',
    meaning: 'Backend support staff',
    useCase: 'Virtual assistant, bookkeeper, scheduler',
    quantity: '1-5 FREE per plan',
    features: {
      billing: ['View client invoices (with Biller)', 'Process payments (with Biller)', 'NO account billing'],
      team: ['NO team management', 'NOT assigned clients as coach'],
      data: ['View all clients (basic info)', 'NO session notes access', 'View team calendars', 'NO editing rights'],
      features: ['Schedule for coaches', 'Send reminders', 'Manage calendars', 'Message clients', 'NO AI features', 'NO coaching access'],
    },
  },
];

const subRoles = [
  {
    id: 'supervisor',
    name: 'Supervisor',
    icon: Sparkles,
    color: 'from-yellow-600 to-amber-600',
    description: 'Can oversee other coaches (compliance)',
    stacks: 'Coach role',
    access: 'View supervisee session notes',
    useCase: 'Licensed coach overseeing pre-licensed coaches',
    price: 'FREE',
    priceNote: 'Compliance feature - no extra charge',
  },
  {
    id: 'biller',
    name: 'Biller',
    icon: DollarSign,
    color: 'from-teal-600 to-cyan-600',
    description: 'Handles invoicing and payments',
    stacks: 'Any role or Support',
    access: 'Create invoices, process payments, view financial reports',
    useCase: 'Dedicated billing specialist',
    price: 'FREE',
    priceNote: 'Stacks with any existing role',
  },
];

const categories = [
  { id: 'billing', name: 'Account & Billing' },
  { id: 'team', name: 'Team Management' },
  { id: 'data', name: 'Data Access' },
  { id: 'features', name: 'Features & Tools' },
];

export default function RolesPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary-50 via-white to-brand-accent-50 -z-10" />
        <div className="absolute inset-0 bg-mesh-gradient opacity-20 -z-10 animate-gradient" style={{ backgroundSize: '400% 400%' }} />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl font-bold mb-8"
          >
            <span className="bg-gradient-to-r from-brand-primary-600 to-brand-accent-600 bg-clip-text text-transparent">
              Team Roles
            </span>
            <br />
            & Permissions
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12"
          >
            Built-in role-based access control to manage your team.
            <br />
            From solo coaches to large organizations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-green-100 border-2 border-green-200"
          >
            <Check className="h-5 w-5 text-green-600" />
            <span className="text-sm font-semibold text-green-700">
              FREE Support Seats • Unlimited Team Members • Advanced Security
            </span>
          </motion.div>
        </div>
      </section>

      {/* Main Roles */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-brand-primary-600 to-brand-accent-600 bg-clip-text text-transparent">
                5 Main Roles
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Each team member has exactly one main role (like a job title).
              <br />
              Choose the role that best fits their responsibility.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {roles.map((role, index) => {
              const Icon = role.icon;
              return (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: role.popular ? 1.05 : 1.02, y: -10 }}
                  className={`relative p-8 rounded-3xl transition-all duration-500 ${
                    role.popular
                      ? 'bg-gradient-to-br from-orange-600 to-red-600 text-white shadow-2xl scale-105 border-4 border-white'
                      : `${role.bgColor} border-2 ${role.borderColor} hover:shadow-xl`
                  }`}
                >
                  {role.popular && (
                    <div className="absolute -top-4 -right-4">
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400 text-yellow-900 text-xs font-bold shadow-lg">
                        Most Common
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mb-6">
                    <div className={`p-4 rounded-2xl ${role.popular ? 'bg-white/20' : role.iconBg}`}>
                      <Icon className={`h-8 w-8 ${role.popular ? 'text-white' : role.iconColor}`} />
                    </div>
                    <div>
                      <h3 className={`text-2xl font-bold ${role.popular ? 'text-white' : 'text-gray-900'}`}>
                        {role.name}
                      </h3>
                      <p className={`text-sm ${role.popular ? 'text-white/90' : 'text-gray-600'}`}>
                        {role.quantity}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className={`text-4xl font-bold ${role.popular ? 'text-white' : 'text-gray-900'}`}>
                        {role.price}
                      </span>
                      <span className={`text-sm ${role.popular ? 'text-white/80' : 'text-gray-600'}`}>
                        {role.priceDetail}
                      </span>
                    </div>
                    {role.priceNote && (
                      <p className={`text-xs font-semibold ${role.popular ? 'text-white/90' : 'text-green-600'}`}>
                        {role.priceNote}
                      </p>
                    )}
                  </div>

                  <p className={`text-lg font-semibold mb-2 ${role.popular ? 'text-white' : 'text-gray-900'}`}>
                    {role.description}
                  </p>
                  <p className={`text-sm mb-4 ${role.popular ? 'text-white/80' : 'text-gray-600'}`}>
                    <span className="font-semibold">Meaning:</span> {role.meaning}
                  </p>
                  <p className={`text-sm mb-6 ${role.popular ? 'text-white/80' : 'text-gray-600'}`}>
                    <span className="font-semibold">Use Case:</span> {role.useCase}
                  </p>

                  <div className="space-y-6">
                    {categories.map((category) => {
                      const features = role.features[category.id as keyof typeof role.features];
                      if (!features || features.length === 0) return null;

                      return (
                        <div key={category.id}>
                          <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${role.popular ? 'text-white/70' : 'text-gray-500'}`}>
                            {category.name}
                          </h4>
                          <ul className="space-y-2">
                            {features.slice(0, 3).map((feature: string, fIndex: number) => (
                              <li key={fIndex} className="flex items-start gap-2 text-sm">
                                {feature.startsWith('NO') || feature.startsWith('Cannot') ? (
                                  <X className={`h-4 w-4 flex-shrink-0 mt-0.5 ${role.popular ? 'text-white/60' : 'text-gray-400'}`} />
                                ) : (
                                  <Check className={`h-4 w-4 flex-shrink-0 mt-0.5 ${role.popular ? 'text-white' : role.iconColor}`} />
                                )}
                                <span className={feature.startsWith('NO') || feature.startsWith('Cannot') ? (role.popular ? 'text-white/60' : 'text-gray-400') : ''}>
                                  {feature}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sub-Roles */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-brand-primary-600 to-brand-accent-600 bg-clip-text text-transparent">
                2 Sub-Roles (Modifiers)
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Add special permissions on top of any main role.
              <br />
              These are FREE and can stack with your existing role.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {subRoles.map((role, index) => {
              const Icon = role.icon;
              return (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                  className="p-8 rounded-3xl bg-white border-2 border-gray-200 hover:border-brand-primary-300 hover:shadow-xl transition-all"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${role.color}`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{role.name}</h3>
                      <p className="text-sm font-semibold text-green-600">{role.price}</p>
                    </div>
                  </div>

                  <p className="text-lg font-semibold text-gray-900 mb-4">{role.description}</p>

                  <div className="space-y-3 text-sm text-gray-600">
                    <p>
                      <span className="font-semibold text-gray-900">Stacks with:</span> {role.stacks}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-900">Access:</span> {role.access}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-900">Use Case:</span> {role.useCase}
                    </p>
                    <p className="text-xs text-green-600 font-semibold pt-2">
                      {role.priceNote}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-brand-primary-600 to-brand-accent-600 bg-clip-text text-transparent">
                Role Comparison
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              Quick overview of what each role can do
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border-2 border-gray-200 shadow-xl">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-brand-primary-600 to-brand-accent-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Permission</th>
                  <th className="px-6 py-4 text-center font-bold">Owner</th>
                  <th className="px-6 py-4 text-center font-bold">Admin</th>
                  <th className="px-6 py-4 text-center font-bold">Manager</th>
                  <th className="px-6 py-4 text-center font-bold">Coach</th>
                  <th className="px-6 py-4 text-center font-bold">Support</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { feature: 'Change subscription plan', owner: true, admin: false, manager: false, coach: false, support: false },
                  { feature: 'View ALL clients', owner: true, admin: true, manager: true, coach: false, support: 'Basic' },
                  { feature: 'View OWN clients', owner: true, admin: true, manager: true, coach: true, support: false },
                  { feature: 'Add/remove team members', owner: true, admin: true, manager: false, coach: false, support: false },
                  { feature: 'Assign clients to coaches', owner: true, admin: true, manager: true, coach: false, support: false },
                  { feature: 'View ALL session notes', owner: true, admin: true, manager: true, coach: false, support: false },
                  { feature: 'Create session notes', owner: true, admin: true, manager: true, coach: true, support: false },
                  { feature: 'Use AI features', owner: true, admin: true, manager: true, coach: true, support: false },
                  { feature: 'Configure integrations', owner: true, admin: true, manager: false, coach: false, support: false },
                  { feature: 'Process client payments', owner: true, admin: true, manager: true, coach: 'Own', support: 'Biller' },
                  { feature: 'Schedule appointments', owner: true, admin: true, manager: true, coach: true, support: true },
                  { feature: 'Export reports', owner: true, admin: true, manager: true, coach: 'Own', support: false },
                ].map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.feature}</td>
                    <td className="px-6 py-4 text-center">
                      {typeof row.owner === 'string' ? (
                        <span className="text-xs font-semibold text-gray-600">{row.owner}</span>
                      ) : row.owner ? (
                        <Check className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {typeof row.admin === 'string' ? (
                        <span className="text-xs font-semibold text-gray-600">{row.admin}</span>
                      ) : row.admin ? (
                        <Check className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {typeof row.manager === 'string' ? (
                        <span className="text-xs font-semibold text-gray-600">{row.manager}</span>
                      ) : row.manager ? (
                        <Check className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {typeof row.coach === 'string' ? (
                        <span className="text-xs font-semibold text-gray-600">{row.coach}</span>
                      ) : row.coach ? (
                        <Check className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {typeof row.support === 'string' ? (
                        <span className="text-xs font-semibold text-gray-600">{row.support}</span>
                      ) : row.support ? (
                        <Check className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-2xl">
            <div className="flex items-start gap-3">
              <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-blue-900 mb-2">💡 Pro Tip: Start Simple</h4>
                <p className="text-blue-800 text-sm leading-relaxed">
                  Most coaching businesses start with just the <strong>Owner</strong> role. As you grow, add <strong>Coaches</strong> ($12/mo each),
                  then <strong>Support</strong> (FREE!), and finally <strong>Admins/Managers</strong> when your team is 10+ people.
                  You can always change roles later!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-brand-primary-600 to-brand-accent-600 bg-clip-text text-transparent">
              Affordable Team Pricing
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            66% cheaper than competitors. FREE support seats. Unlimited team growth.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 bg-white rounded-2xl border-2 border-gray-200 hover:border-brand-primary-300 hover:shadow-lg transition-all">
              <h3 className="font-bold text-gray-900 mb-2">Solo Coach</h3>
              <p className="text-3xl font-bold text-brand-primary-600 mb-2">$15/mo</p>
              <p className="text-sm text-gray-600">1 Owner + 1 FREE Support</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-brand-primary-600 to-brand-accent-600 rounded-2xl text-white shadow-xl scale-105">
              <h3 className="font-bold mb-2">Small Team</h3>
              <p className="text-3xl font-bold mb-2">$63/mo</p>
              <p className="text-sm text-white/90">2-3 Coaches + 2 FREE Support</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border-2 border-gray-200 hover:border-brand-primary-300 hover:shadow-lg transition-all">
              <h3 className="font-bold text-gray-900 mb-2">Growing Team</h3>
              <p className="text-3xl font-bold text-brand-primary-600 mb-2">$139/mo</p>
              <p className="text-sm text-gray-600">5 Coaches + 5 FREE Support</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pricing">
              <Button size="lg" className="bg-gradient-to-r from-brand-primary-600 to-brand-accent-600 text-white px-12 py-6 text-lg">
                View Full Pricing
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="outline" className="border-2 px-12 py-6 text-lg">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Security Note */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="p-8 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-3xl">
            <div className="flex items-start gap-4">
              <Shield className="h-12 w-12 text-purple-600 flex-shrink-0" />
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Enterprise-Grade Security
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Our role-based access control uses PostgreSQL Row-Level Security (RLS), the same
                  technology used by banks and healthcare systems. Every database query is automatically
                  filtered based on the user's role, preventing unauthorized access at the database level.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Coaches can ONLY see their assigned clients (database enforced)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Support staff cannot access private session notes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Billing is Owner-only (cannot be changed by anyone else)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Full audit logs of all permission changes</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
