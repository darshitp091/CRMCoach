'use client';

import { memo, Suspense } from 'react';
import Link from 'next/link';
import { TypeAnimation } from 'react-type-animation';
import {
  ArrowRight,
  Check,
  Sparkles,
  Zap,
  Users,
  Calendar,
  BarChart3,
  MessageSquare,
  CreditCard,
  Star,
  Shield,
  Rocket,
  TrendingUp,
  Globe,
  Award,
  Clock,
} from 'lucide-react';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { Button } from '@/components/ui/button';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { useScrollRevealBatch } from '@/hooks/use-scroll-reveal';
import { motion } from 'framer-motion';
import {
  slideUpVariants,
  scaleVariants,
  staggerContainer,
  viewportOnce,
  hoverLift,
  tapScale,
} from '@/lib/motion-config';

const features = [
  {
    icon: Users,
    title: 'Smart Client Management',
    description: 'Organize and track all your clients in one intuitive dashboard with AI-powered insights and automated workflows.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Calendar,
    title: 'Intelligent Scheduling',
    description: 'Automated appointment booking, calendar sync, and smart reminders that reduce no-shows by 80%.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: BarChart3,
    title: 'Revenue Analytics',
    description: 'Track income, identify trends, and forecast revenue with powerful analytics built for coaches.',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: MessageSquare,
    title: 'WhatsApp Integration',
    description: 'Communicate with clients directly through WhatsApp, send updates, and manage conversations seamlessly.',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: CreditCard,
    title: 'Payment Processing',
    description: 'Accept payments via Razorpay, UPI, cards, and wallets. Automated invoicing and payment reminders.',
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    icon: Rocket,
    title: 'Automation Tools',
    description: 'Automate repetitive tasks, workflows, and follow-ups. Save 10+ hours every week.',
    gradient: 'from-cyan-500 to-blue-500',
  },
];

const plans = [
  {
    name: 'Standard',
    price: '₹1,499',
    period: '/month',
    description: 'Perfect for solo coaches',
    features: [
      'Up to 25 clients',
      'Unlimited sessions',
      'Basic scheduling',
      'Email support',
      'Mobile app access',
      'Payment processing',
    ],
    cta: 'Start 7-Day Trial',
    popular: false,
  },
  {
    name: 'Pro',
    price: '₹3,999',
    period: '/month',
    description: 'For growing coaching businesses',
    features: [
      'Up to 100 clients',
      'Advanced analytics',
      'WhatsApp integration',
      'Video calling - 50hrs/mo',
      'AI session summaries',
      'Priority support',
      'Custom branding',
    ],
    cta: 'Start 7-Day Trial',
    popular: true,
  },
  {
    name: 'Premium',
    price: '₹7,999',
    period: '/month',
    description: 'For coaching enterprises',
    features: [
      'Unlimited clients',
      'Unlimited team members',
      'Video calling - 200hrs/mo',
      'AI transcription & insights',
      'Dedicated account manager',
      'API access & integrations',
      'White-label platform',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Life Coach, Mumbai',
    image: '👩‍💼',
    content: 'FlowCoach transformed my business. I save 15 hours every week on admin work!',
    rating: 5,
  },
  {
    name: 'Rajesh Kumar',
    role: 'Business Consultant, Delhi',
    image: '👨‍💼',
    content: 'The WhatsApp integration alone is worth it. My clients love the convenience.',
    rating: 5,
  },
  {
    name: 'Anita Patel',
    role: 'Career Coach, Bangalore',
    image: '👩‍🏫',
    content: 'Finally, a CRM built specifically for Indian coaches. Game-changer!',
    rating: 5,
  },
];

const stats = [
  { label: 'Active Coaches', value: '50,000+', icon: Users },
  { label: 'Sessions Managed', value: '10M+', icon: Calendar },
  { label: 'Revenue Processed', value: '₹500Cr+', icon: TrendingUp },
  { label: 'Client Satisfaction', value: '98%', icon: Star },
];

// Memoized components with Framer Motion - Professional animations
const FeatureCard = memo(function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const Icon = feature.icon;
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={slideUpVariants}
      transition={{ delay: index * 0.1 }}
      whileHover={hoverLift}
      whileTap={tapScale}
      className="feature-card group relative p-8 bg-white rounded-3xl shadow-lg border-2 border-gray-100 hover:border-brand-primary-200 overflow-hidden"
    >
      <motion.div
        className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 rounded-full blur-2xl"
        whileHover={{ opacity: 0.20 }}
        style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}
      />

      <motion.div
        className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6`}
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <Icon className="h-8 w-8 text-white" />
      </motion.div>

      <h3 className="text-2xl font-bold mb-4 text-gray-900">{feature.title}</h3>
      <p className="text-gray-600 leading-relaxed">{feature.description}</p>

      <motion.div
        className="mt-6 flex items-center text-brand-primary-600 font-semibold"
        whileHover={{ x: 8 }}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        Learn more
        <ArrowRight className="ml-2 h-5 w-5" />
      </motion.div>
    </motion.div>
  );
});

const PricingCard = memo(function PricingCard({ plan, index }: { plan: typeof plans[0]; index: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={scaleVariants}
      transition={{ delay: index * 0.15 }}
      whileHover={{ scale: plan.popular ? 1.08 : 1.05, y: -10 }}
      className={`pricing-card relative p-8 rounded-3xl border-2 ${
        plan.popular
          ? 'bg-gradient-to-br from-brand-primary-600 to-brand-accent-600 text-white border-transparent shadow-2xl scale-105'
          : 'bg-white text-gray-900 border-gray-200 hover:border-brand-primary-300'
      }`}
    >
      {plan.popular && (
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold rounded-full shadow-lg"
        >
          Most Popular
        </motion.div>
      )}

      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
        <p className={`text-sm ${plan.popular ? 'text-white/90' : 'text-gray-600'}`}>{plan.description}</p>
      </div>

      <motion.div
        className="text-center mb-8"
        initial={{ scale: 0.8 }}
        whileInView={{ scale: 1 }}
        viewport={viewportOnce}
        transition={{ type: 'spring', stiffness: 200, delay: index * 0.15 + 0.2 }}
      >
        <span className="text-5xl font-bold">{plan.price}</span>
        <span className={`text-lg ${plan.popular ? 'text-white/80' : 'text-gray-600'}`}>{plan.period}</span>
      </motion.div>

      <ul className="space-y-4 mb-8">
        {plan.features.map((feature, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={viewportOnce}
            transition={{ delay: index * 0.15 + i * 0.05 }}
            className="flex items-start gap-3"
          >
            <Check className={`h-6 w-6 flex-shrink-0 ${plan.popular ? 'text-white' : 'text-green-500'}`} />
            <span className={plan.popular ? 'text-white/90' : 'text-gray-700'}>{feature}</span>
          </motion.li>
        ))}
      </ul>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          className={`w-full text-lg py-6 ${
            plan.popular
              ? 'bg-white text-brand-primary-600 hover:bg-gray-100'
              : 'bg-gradient-to-r from-brand-primary-600 to-brand-accent-600 text-white hover:shadow-xl'
          }`}
        >
          {plan.cta}
        </Button>
      </motion.div>
    </motion.div>
  );
});

export default function HomePage() {
  // Initialize scroll reveal animations
  useScrollRevealBatch('.animate-on-scroll');

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Pure CSS animated background - 0 JavaScript, <1ms load */}
        <AnimatedBackground />

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="fade-in stagger-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg mb-8">
              <Sparkles className="h-5 w-5 text-brand-primary-600" />
              <span className="text-sm font-semibold text-gray-700">India's #1 Coaching CRM</span>
            </div>
          </div>

          <h1 className="fade-in stagger-2 text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-brand-primary-600 via-brand-accent-600 to-brand-secondary-600 bg-clip-text text-transparent gradient-animate">
              Grow Your Coaching
            </span>
            <br />
            <span className="text-gray-900">Business 10x Faster</span>
          </h1>

          <div className="fade-in stagger-3 text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
            <TypeAnimation
              sequence={[
                'Manage clients effortlessly',
                2000,
                'Automate your workflow',
                2000,
                'Accept payments seamlessly',
                2000,
                'Grow revenue predictably',
                2000,
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
            />
          </div>

          <div className="fade-in stagger-4 flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/signup">
              <Button size="lg" className="bg-gradient-to-r from-brand-primary-600 to-brand-accent-600 hover:shadow-2xl px-10 py-8 text-lg hover-scale">
                Start Free Trial
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="border-2 px-10 py-8 text-lg hover-lift">
                Watch Demo
              </Button>
            </Link>
          </div>

          <div className="fade-in stagger-5 flex items-center justify-center gap-2 text-sm text-gray-600">
            <Check className="h-5 w-5 text-green-500" />
            <span>7-day free trial</span>
            <span className="mx-2">•</span>
            <Check className="h-5 w-5 text-green-500" />
            <span>No credit card required</span>
            <span className="mx-2">•</span>
            <Check className="h-5 w-5 text-green-500" />
            <span>Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section py-20 bg-gradient-to-br from-brand-primary-50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="animate-on-scroll stat-card text-center p-6 bg-white rounded-2xl shadow-lg hover-lift">
                  <Icon className="h-12 w-12 mx-auto mb-4 text-brand-primary-600" />
                  <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section py-32 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-brand-primary-600 to-brand-accent-600 bg-clip-text text-transparent">
                Everything You Need
              </span>
              <br />
              to Run Your Coaching Business
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built specifically for Indian coaches with local payment methods, WhatsApp integration, and features that actually matter.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section py-32 bg-gradient-to-br from-gray-50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-brand-primary-600 to-brand-accent-600 bg-clip-text text-transparent">
                Simple, Transparent Pricing
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              No hidden fees. No surprises. Just powerful tools to grow your coaching business.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <PricingCard key={index} plan={plan} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section py-32 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Loved by <span className="bg-gradient-to-r from-brand-primary-600 to-brand-accent-600 bg-clip-text text-transparent">50,000+ Coaches</span>
            </h2>
            <p className="text-xl text-gray-600">See what coaches across India are saying about FlowCoach</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="animate-on-scroll testimonial-card p-8 bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg border-2 border-gray-100 hover-lift">
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 text-lg leading-relaxed">{testimonial.content}</p>
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{testimonial.image}</div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-primary-600 to-brand-accent-600" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Ready to Transform Your Coaching Business?
          </h2>
          <p className="text-xl text-white/90 mb-12">
            Join 50,000+ coaches who have already made the switch to FlowCoach.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-white text-brand-primary-600 hover:bg-gray-100 px-12 py-8 text-lg shadow-2xl hover-scale">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </Link>
          <p className="mt-6 text-white/80">7-day free trial • No credit card required</p>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
