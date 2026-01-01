'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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
import dynamic from 'next/dynamic';

// Dynamically import 3D component to avoid SSR issues
const AnimatedBackground = dynamic(
  () => import('@/components/3d/animated-background').then(mod => ({ default: mod.AnimatedBackground })),
  { ssr: false }
);

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

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
    description: 'Automated session booking with calendar sync, smart reminders, and time zone management for global clients.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description: 'Track revenue, client progress, and business growth with beautiful interactive dashboards and custom reports.',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: MessageSquare,
    title: 'Automated Communications',
    description: 'Send personalized emails, SMS, and WhatsApp messages automatically with custom triggers and templates.',
    gradient: 'from-green-500 to-teal-500',
  },
  {
    icon: CreditCard,
    title: 'Secure Payments',
    description: 'Accept payments via Razorpay with automated invoicing, subscription management, and instant settlements.',
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    icon: Zap,
    title: 'Workflow Automation',
    description: 'Create custom automation flows that save hours every week with our intuitive no-code builder and triggers.',
    gradient: 'from-yellow-500 to-orange-500',
  },
];

const pricing = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'Perfect for getting started',
    features: [
      'Up to 10 clients',
      'Basic scheduling',
      'Email support',
      '1 team member',
      'Basic analytics',
      'Mobile app access',
    ],
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Professional',
    price: '₹2,499',
    period: '/month',
    description: 'For growing coaching businesses',
    features: [
      'Unlimited clients',
      'Advanced scheduling',
      'Priority support',
      'Up to 5 team members',
      'Advanced analytics',
      'Custom automation',
      'Payment processing',
      'WhatsApp integration',
      'Video calling',
      'Custom branding',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Business',
    price: '₹4,999',
    period: '/month',
    description: 'For established enterprises',
    features: [
      'Everything in Professional',
      'Unlimited team members',
      'White-label branding',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'Advanced security',
      'SLA guarantee',
      'Custom domain',
      'Priority feature requests',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

const stats = [
  { value: '50K+', label: 'Active Users', icon: Users },
  { value: '1M+', label: 'Sessions Booked', icon: Calendar },
  { value: '₹100Cr+', label: 'Revenue Processed', icon: TrendingUp },
  { value: '4.9/5', label: 'User Rating', icon: Star },
];

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Life Coach',
    image: '👩‍💼',
    content: 'CoachCRM transformed my business! I save 10+ hours every week on admin tasks and my revenue has grown by 300%.',
    rating: 5,
  },
  {
    name: 'Rahul Mehta',
    role: 'Business Consultant',
    image: '👨‍💼',
    content: 'The automation features are incredible. My clients love the seamless booking experience and I love the analytics!',
    rating: 5,
  },
  {
    name: 'Anita Desai',
    role: 'Wellness Coach',
    image: '👩‍⚕️',
    content: 'Best investment I made for my coaching practice. The payment system is flawless and customer support is amazing.',
    rating: 5,
  },
];

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Feature cards animation
      gsap.from('.feature-card', {
        scrollTrigger: {
          trigger: '.features-section',
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
        y: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
      });

      // Pricing cards animation
      gsap.from('.pricing-card', {
        scrollTrigger: {
          trigger: '.pricing-section',
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
        y: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',
      });

      // Testimonials animation
      gsap.from('.testimonial-card', {
        scrollTrigger: {
          trigger: '.testimonials-section',
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
        scale: 0.8,
        opacity: 0,
        duration: 0.6,
        stagger: 0.2,
        ease: 'back.out(1.7)',
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <PublicHeader />

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* 3D Background */}
        <AnimatedBackground />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary-50 via-white to-brand-accent-50 -z-20" />

        {/* Animated Mesh Background */}
        <div className="absolute inset-0 bg-mesh-gradient opacity-30 -z-10 animate-gradient" style={{ backgroundSize: '400% 400%' }} />

        <motion.div
          style={{ opacity, scale }}
          className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-32 text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-brand-primary-100 via-brand-accent-100 to-brand-secondary-100 border-2 border-brand-primary-200 mb-8 shadow-lg"
          >
            <Sparkles className="h-5 w-5 text-brand-primary-600 animate-pulse" />
            <span className="text-sm font-semibold text-brand-primary-700">
              #1 CRM for Coaches & Consultants in India
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight"
          >
            <span className="bg-gradient-to-r from-brand-primary-600 via-brand-accent-600 to-brand-secondary-600 bg-clip-text text-transparent">
              Transform Your
            </span>
            <br />
            <TypeAnimation
              sequence={[
                'Coaching Business',
                2000,
                'Client Relationships',
                2000,
                'Revenue Growth',
                2000,
                'Business Success',
                2000,
              ]}
              wrapper="span"
              speed={50}
              className="bg-gradient-to-r from-brand-primary-600 to-brand-accent-600 bg-clip-text text-transparent"
              repeat={Infinity}
            />
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl md:text-2xl lg:text-3xl text-gray-700 max-w-4xl mx-auto mb-12 leading-relaxed"
          >
            The <span className="font-bold text-brand-primary-600">all-in-one CRM platform</span> built specifically for coaches and consultants.
            <br className="hidden md:block" />
            Automate workflows, manage clients, and <span className="font-bold text-brand-accent-600">scale your business effortlessly</span>.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16"
          >
            <Link href="/signup">
              <Button size="lg" className="group relative overflow-hidden px-10 py-8 text-lg shadow-2xl shadow-brand-primary-500/50 hover:shadow-brand-accent-500/50 transition-all">
                <span className="relative z-10 flex items-center gap-3 font-bold">
                  <Rocket className="h-6 w-6" />
                  Start Free Trial
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-brand-accent-600 via-brand-secondary-500 to-brand-primary-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </Link>
            <Link href="/features">
              <Button size="lg" variant="outline" className="px-10 py-8 text-lg border-2 border-brand-primary-500 hover:bg-brand-primary-50 transition-all">
                <Globe className="mr-3 h-5 w-5" />
                Explore Features
              </Button>
            </Link>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-5xl mx-auto"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="relative p-6 bg-white/60 backdrop-blur-xl rounded-2xl border-2 border-brand-primary-200 shadow-xl hover:shadow-2xl transition-all group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-primary-100 to-brand-accent-100 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <Icon className="h-8 w-8 text-brand-primary-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-brand-primary-600 to-brand-accent-600 bg-clip-text text-transparent mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
        >
          <div className="w-8 h-12 border-2 border-brand-primary-400 rounded-full flex justify-center p-2">
            <motion.div
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-2 h-2 bg-brand-primary-600 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="features-section relative py-32 bg-gradient-to-b from-white via-gray-50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary-100 border border-brand-primary-200 mb-6"
            >
              <Award className="h-4 w-4 text-brand-primary-600" />
              <span className="text-sm font-semibold text-brand-primary-700">Award-Winning Features</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              <span className="bg-gradient-to-r from-brand-primary-600 to-brand-accent-600 bg-clip-text text-transparent">
                Powerful Features
              </span>
              <br />
              Built for Your Success
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            >
              Everything you need to manage, grow, and scale your coaching business in one powerful platform
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  className="feature-card group relative p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 hover:border-brand-primary-200 overflow-hidden"
                  whileHover={{ y: -10, scale: 1.02 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-primary-50 to-brand-accent-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>

                    <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-brand-primary-700 transition-colors">
                      {feature.title}
                    </h3>

                    <p className="text-gray-600 leading-relaxed text-lg">
                      {feature.description}
                    </p>
                  </div>

                  <div className={`absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r ${feature.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-b-3xl`} />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section relative py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              <span className="bg-gradient-to-r from-brand-primary-600 to-brand-accent-600 bg-clip-text text-transparent">
                Loved by Coaches
              </span>
              <br />
              Across India
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 max-w-2xl mx-auto"
            >
              Join thousands of successful coaches who have transformed their business with CoachCRM
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="testimonial-card p-8 bg-white rounded-3xl shadow-xl border-2 border-gray-100 hover:border-brand-primary-200 hover:shadow-2xl transition-all"
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-5xl">{testimonial.image}</div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>

                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <p className="text-gray-700 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section relative py-32 bg-gradient-to-b from-gray-50 via-white to-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 border border-green-200 mb-6"
            >
              <Clock className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700">14-Day Free Trial • No Credit Card Required</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              <span className="bg-gradient-to-r from-brand-primary-600 to-brand-accent-600 bg-clip-text text-transparent">
                Simple, Transparent Pricing
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto"
            >
              Choose the perfect plan for your business. Upgrade or downgrade anytime.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricing.map((plan, index) => (
              <motion.div
                key={index}
                className={`pricing-card relative p-10 rounded-3xl transition-all duration-500 ${
                  plan.popular
                    ? 'bg-gradient-to-br from-brand-primary-600 via-brand-accent-600 to-brand-secondary-600 text-white shadow-2xl scale-105 border-4 border-white'
                    : 'bg-white text-gray-900 shadow-xl border-2 border-gray-200 hover:border-brand-primary-300'
                }`}
                whileHover={{ scale: plan.popular ? 1.08 : 1.05, y: -10 }}
              >
                {plan.popular && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-yellow-400 text-yellow-900 text-sm font-bold shadow-lg animate-pulse">
                      <Star className="h-5 w-5 fill-yellow-900" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className={`text-3xl font-bold mb-3 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-base mb-8 ${plan.popular ? 'text-white/90' : 'text-gray-600'}`}>
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center gap-2 mb-2">
                    <span className="text-6xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className={`text-lg ${plan.popular ? 'text-white/80' : 'text-gray-600'}`}>
                        {plan.period}
                      </span>
                    )}
                  </div>
                </div>

                <ul className="space-y-4 mb-10">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-3">
                      <div className={`flex-shrink-0 p-1 rounded-full ${plan.popular ? 'bg-white/20' : 'bg-brand-primary-100'}`}>
                        <Check className={`h-5 w-5 ${plan.popular ? 'text-white' : 'text-brand-primary-600'}`} />
                      </div>
                      <span className={`text-base leading-relaxed ${plan.popular ? 'text-white/95' : 'text-gray-700'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link href="/signup">
                  <Button
                    size="lg"
                    className={`w-full text-lg py-6 ${
                      plan.popular
                        ? 'bg-white text-brand-primary-600 hover:bg-gray-100 shadow-2xl'
                        : 'bg-gradient-to-r from-brand-primary-600 to-brand-accent-600 text-white hover:shadow-xl'
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <p className="text-gray-600 text-lg mb-4">Need a custom plan for your enterprise?</p>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-2">
                <Shield className="mr-2 h-5 w-5" />
                Contact Sales Team
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-primary-600 via-brand-accent-600 to-brand-secondary-600 -z-10" />
        <div className="absolute inset-0 bg-mesh-gradient opacity-30 animate-gradient -z-10" style={{ backgroundSize: '400% 400%' }} />

        {/* Floating shapes */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">
              Ready to Transform Your
              <br />
              Coaching Business?
            </h2>
            <p className="text-2xl text-white/95 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of coaches and consultants who have scaled their business with CoachCRM.
              <br className="hidden md:block" />
              Start your <span className="font-bold">free 14-day trial</span> today—no credit card required.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
              <Link href="/signup">
                <Button size="lg" className="bg-white text-brand-primary-600 hover:bg-gray-100 hover:scale-105 transition-all px-12 py-8 text-xl font-bold shadow-2xl">
                  <Rocket className="mr-3 h-6 w-6" />
                  Start Free Trial
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-3 border-white text-white hover:bg-white/10 px-12 py-8 text-xl">
                  <MessageSquare className="mr-3 h-6 w-6" />
                  Contact Sales
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 text-white/90">
              <div className="flex items-center gap-2">
                <Check className="h-6 w-6" />
                <span className="text-lg">14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-6 w-6" />
                <span className="text-lg">No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-6 w-6" />
                <span className="text-lg">Cancel anytime</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
