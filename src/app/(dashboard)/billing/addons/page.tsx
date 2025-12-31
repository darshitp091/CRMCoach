'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Check,
  X,
  AlertTriangle,
  TrendingUp,
  Package,
  Zap,
  Video,
  MessageSquare,
  Mail,
  Users,
  HardDrive,
  Brain,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Addon {
  type: string;
  name: string;
  icon: any;
  description: string;
  price: number;
  per: string;
  available: boolean;
  active: any;
  packages?: any;
}

export default function AddonsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [plan, setPlan] = useState('');
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);

    fetchAddons();

    return () => {
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const fetchAddons = async () => {
    try {
      const response = await fetch('/api/addons');
      const data = await response.json();

      if (data.success) {
        setPlan(data.plan);

        // Transform API response to UI-friendly format
        const addonsList: Addon[] = [];

        if (data.addons.clients) {
          addonsList.push({
            type: 'clients',
            name: 'Extra Clients',
            icon: Users,
            description: data.addons.clients.description,
            price: data.addons.clients.price,
            per: data.addons.clients.per,
            available: true,
            active: data.addons.clients.active,
          });
        }

        if (data.addons.teamMembers) {
          addonsList.push({
            type: 'team_members',
            name: 'Team Members',
            icon: Users,
            description: data.addons.teamMembers.description,
            price: data.addons.teamMembers.price,
            per: data.addons.teamMembers.per,
            available: true,
            active: data.addons.teamMembers.active,
          });
        }

        if (data.addons.storage) {
          addonsList.push({
            type: 'storage',
            name: 'Extra Storage',
            icon: HardDrive,
            description: data.addons.storage.description,
            price: data.addons.storage.price,
            per: data.addons.storage.per,
            available: true,
            active: data.addons.storage.active,
          });
        }

        if (data.addons.emails) {
          addonsList.push({
            type: 'emails',
            name: 'Email Credits',
            icon: Mail,
            description: data.addons.emails.description,
            price: data.addons.emails.price,
            per: data.addons.emails.per,
            available: true,
            active: data.addons.emails.active,
          });
        }

        if (data.addons.whatsapp) {
          addonsList.push({
            type: 'whatsapp',
            name: 'WhatsApp Messages',
            icon: MessageSquare,
            description: data.addons.whatsapp.description,
            price: data.addons.whatsapp.price,
            per: data.addons.whatsapp.per,
            available: true,
            active: data.addons.whatsapp.active,
          });
        }

        if (data.addons.video) {
          addonsList.push({
            type: 'video',
            name: 'Video Calling',
            icon: Video,
            description: data.addons.video.description,
            price: data.addons.video.price,
            per: data.addons.video.per,
            available: true,
            active: data.addons.video.active,
          });
        }

        if (data.addons.transcription) {
          addonsList.push({
            type: 'transcription',
            name: 'AI Transcription',
            icon: Brain,
            description: 'Convert session recordings to text with AI',
            price: 199,
            per: 'package',
            available: true,
            active: data.addons.transcription.active,
            packages: data.addons.transcription.packages,
          });
        }

        if (data.addons.aiSummaries) {
          addonsList.push({
            type: 'ai_summaries',
            name: 'AI Summaries',
            icon: Zap,
            description: data.addons.aiSummaries.description,
            price: data.addons.aiSummaries.price,
            per: data.addons.aiSummaries.per,
            available: true,
            active: data.addons.aiSummaries.active,
          });
        }

        setAddons(addonsList);
      } else {
        toast.error(data.message || 'Failed to load add-ons');
      }
    } catch (error) {
      console.error('Error fetching add-ons:', error);
      toast.error('Failed to load add-ons');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (addonType: string, quantity: number = 1, addonPackage?: string) => {
    if (!scriptLoaded) {
      toast.error('Payment gateway is loading. Please try again.');
      return;
    }

    setPurchasing(addonType);

    try {
      // Create order
      const response = await fetch('/api/addons/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addonType,
          quantity,
          addonPackage,
          billingCycle: 'monthly',
        }),
      });

      const orderData = await response.json();

      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create order');
      }

      // Initialize Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'CoachCRM Add-ons',
        description: orderData.addonDetails.description,
        order_id: orderData.order.id,
        handler: async function (response: any) {
          // Verify payment
          const verifyResponse = await fetch('/api/addons/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              addonType,
              addonPackage,
              quantity,
              price: orderData.addonDetails.price,
              billingCycle: orderData.addonDetails.billingCycle,
              monthlyLimit: orderData.addonDetails.monthlyLimit,
            }),
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            toast.success('Add-on purchased successfully!');
            fetchAddons(); // Refresh add-ons list
          } else {
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        theme: {
          color: '#6366f1',
        },
        modal: {
          ondismiss: function () {
            setPurchasing(null);
            toast.info('Purchase cancelled');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error(error.message || 'Failed to purchase add-on');
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add-Ons Marketplace</h1>
        <p className="text-gray-600 mt-2">
          Enhance your {plan.charAt(0).toUpperCase() + plan.slice(1)} plan with powerful add-ons
        </p>
      </div>

      {/* Usage Alert */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="flex items-start gap-3 pt-6">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900">Monitor Your Usage</h3>
            <p className="text-sm text-yellow-800">
              Check your current usage in the{' '}
              <button
                onClick={() => router.push('/dashboard/billing')}
                className="underline font-medium hover:text-yellow-900"
              >
                Billing Dashboard
              </button>{' '}
              to see which add-ons you might need.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Add-ons Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {addons.map((addon, index) => {
          const Icon = addon.icon;
          const isActive = addon.active !== null;

          return (
            <motion.div
              key={addon.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative h-full ${isActive ? 'border-green-300 bg-green-50/50' : ''}`}>
                {isActive && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-green-600">Active</Badge>
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-brand-primary-100 rounded-lg">
                      <Icon className="h-6 w-6 text-brand-primary-600" />
                    </div>
                    <CardTitle className="text-xl">{addon.name}</CardTitle>
                  </div>
                  <CardDescription>{addon.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  {addon.type === 'transcription' && addon.packages ? (
                    // Transcription packages
                    <div className="space-y-3">
                      {Object.entries(addon.packages).map(([key, pkg]: [string, any]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-semibold">
                              {pkg.hours === 'unlimited' ? 'Unlimited' : `${pkg.hours} hours`}
                            </p>
                            <p className="text-sm text-gray-600">₹{pkg.price}/{pkg.per}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handlePurchase('transcription', 1, key)}
                            disabled={purchasing === 'transcription' || !addon.available}
                          >
                            {purchasing === 'transcription' ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Buy'
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Regular add-ons
                    <>
                      <div className="mb-4">
                        <div className="text-3xl font-bold text-gray-900">₹{addon.price}</div>
                        <div className="text-sm text-gray-600">per {addon.per}</div>
                      </div>

                      {isActive ? (
                        <Button variant="outline" className="w-full" disabled>
                          <Check className="mr-2 h-4 w-4" />
                          Active
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          onClick={() => handlePurchase(addon.type)}
                          disabled={purchasing === addon.type || !addon.available}
                        >
                          {purchasing === addon.type ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="mr-2 h-4 w-4" />
                              Purchase
                            </>
                          )}
                        </Button>
                      )}
                    </>
                  )}

                  {!addon.available && (
                    <div className="mt-3 p-2 bg-gray-100 rounded text-sm text-gray-600 flex items-center gap-2">
                      <X className="h-4 w-4" />
                      Not available in your plan
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Benefits Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-brand-primary-600" />
            Why Purchase Add-Ons?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-600 mt-0.5" />
              <span>
                <strong>Flexibility:</strong> Only pay for what you use - no need to upgrade your entire plan
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-600 mt-0.5" />
              <span>
                <strong>Cost-effective:</strong> Add-ons are cheaper than upgrading when you only need one feature
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-600 mt-0.5" />
              <span>
                <strong>Cancel anytime:</strong> No long-term commitment - cancel from your billing dashboard
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-600 mt-0.5" />
              <span>
                <strong>Instant activation:</strong> Add-ons are activated immediately after purchase
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
