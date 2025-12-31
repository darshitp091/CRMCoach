import Link from 'next/link';
import { ArrowRight, CheckCircle2, BarChart3, Users, Calendar, Zap, CreditCard, MessageSquare, TrendingUp } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-brand-primary-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary-500">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">CoachCRM</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-700 hover:text-brand-primary-600"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-brand-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-primary-600"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              The Complete CRM for
              <span className="text-brand-primary-600"> Coaches & Consultants</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
              Manage clients, schedule sessions, process payments, and automate your workflow—all in one powerful platform. Save 7-10 hours per week with smart automation.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/signup"
                className="flex items-center gap-2 rounded-lg bg-brand-primary-500 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-brand-primary-600"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="#features"
                className="rounded-lg border-2 border-gray-300 px-8 py-4 text-lg font-semibold text-gray-700 hover:border-brand-primary-500 hover:text-brand-primary-600"
              >
                See Features
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              14-day free trial • No credit card required • Cancel anytime
            </p>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-4xl font-bold text-brand-primary-600">7-10hrs</div>
              <div className="mt-2 text-sm text-gray-600">Saved per week with automation</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-brand-secondary-600">98%</div>
              <div className="mt-2 text-sm text-gray-600">Message open rate (WhatsApp)</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-brand-accent-600">40%</div>
              <div className="mt-2 text-sm text-gray-600">Increase in client engagement</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Everything you need to grow your coaching business
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              All-in-one platform designed specifically for coaches and consultants
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Client Management"
              description="Track client progress, goals, and milestones. Manage leads to active clients seamlessly."
            />
            <FeatureCard
              icon={<Calendar className="h-6 w-6" />}
              title="Session Scheduling"
              description="Book sessions, avoid conflicts, send automatic reminders. Integrated video calling."
            />
            <FeatureCard
              icon={<CreditCard className="h-6 w-6" />}
              title="Payment Processing"
              description="Accept payments via Razorpay. Auto-generated invoices, payment reminders, refunds."
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="Smart Automation"
              description="Welcome emails, session reminders, follow-ups. Save hours with trigger-based workflows."
            />
            <FeatureCard
              icon={<MessageSquare className="h-6 w-6" />}
              title="Multi-Channel Communication"
              description="Email, WhatsApp, SMS from one place. Template system with variables."
            />
            <FeatureCard
              icon={<TrendingUp className="h-6 w-6" />}
              title="Analytics & Reports"
              description="Track revenue, sessions, client satisfaction. Real-time dashboard insights."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Start free, upgrade as you grow
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            <PricingCard
              name="Free"
              price="₹0"
              description="Perfect for getting started"
              features={[
                '5 clients',
                '10 sessions/month',
                'Basic CRM features',
                'Email support',
              ]}
            />
            <PricingCard
              name="Professional"
              price="₹2,499"
              description="For growing coaching businesses"
              features={[
                '200 clients',
                'Unlimited sessions',
                'Full automation',
                'WhatsApp integration',
                'Analytics dashboard',
                'Priority support',
              ]}
              highlighted
            />
            <PricingCard
              name="Business"
              price="₹4,999"
              description="For established coaches"
              features={[
                'Unlimited clients',
                'Unlimited sessions',
                'Everything in Professional',
                'Video calling',
                'Custom branding',
                'Dedicated support',
              ]}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-brand-primary-600 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to transform your coaching business?
          </h2>
          <p className="mt-4 text-lg text-brand-primary-100">
            Join thousands of coaches who've automated their workflow and saved 7-10 hours per week.
          </p>
          <div className="mt-8">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-lg font-semibold text-brand-primary-600 shadow-lg hover:bg-gray-50"
            >
              Start Your Free Trial
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <p className="mt-4 text-sm text-brand-primary-200">
            14-day free trial • No credit card required
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary-500">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">CoachCRM</span>
            </div>
            <p className="text-sm text-gray-500">
              © 2025 CoachCRM. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary-100 text-brand-primary-600">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  description,
  features,
  highlighted = false,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border-2 p-8 ${
        highlighted
          ? 'border-brand-primary-500 bg-brand-primary-50 shadow-xl'
          : 'border-gray-200 bg-white'
      }`}
    >
      {highlighted && (
        <div className="mb-4 inline-block rounded-full bg-brand-primary-500 px-3 py-1 text-xs font-semibold text-white">
          Most Popular
        </div>
      )}
      <h3 className="text-2xl font-bold text-gray-900">{name}</h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
      <div className="mt-4">
        <span className="text-4xl font-bold text-gray-900">{price}</span>
        <span className="text-gray-600">/month</span>
      </div>
      <ul className="mt-6 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-brand-secondary-600" />
            <span className="text-sm text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/signup"
        className={`mt-8 block w-full rounded-lg py-3 text-center font-semibold ${
          highlighted
            ? 'bg-brand-primary-500 text-white hover:bg-brand-primary-600'
            : 'bg-gray-900 text-white hover:bg-gray-800'
        }`}
      >
        Get Started
      </Link>
    </div>
  );
}
