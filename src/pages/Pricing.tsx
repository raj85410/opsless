import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Check, 
  X, 
  Star, 
  Zap, 
  Shield, 
  Users, 
  Globe, 
  Clock,
  ArrowRight,
  CreditCard,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { loadStripe } from '@stripe/stripe-js';
import toast from 'react-hot-toast';

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key_here');

interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: string;
  isRecurring: boolean;
  features: {
    [key: string]: boolean | number;
  };
  popular?: boolean;
  savings?: string;
}

const Pricing: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  // Check for success/cancelled parameters
  useEffect(() => {
    const success = searchParams.get('success');
    const cancelled = searchParams.get('cancelled');
    const reactivated = searchParams.get('reactivated');

    if (success === 'true') {
      toast.success('Payment successful! Welcome to Opsless!');
    } else if (cancelled === 'true') {
      toast.error('Payment was cancelled. You can try again anytime.');
    } else if (reactivated === 'true') {
      toast.success('Subscription reactivated successfully!');
    }
  }, [searchParams]);

  const plans: Plan[] = [
    {
      id: 1,
      name: 'Free Trial',
      description: '3-day access to explore Opsless features',
      price: 0,
      duration: '3 days',
      isRecurring: false,
      features: {
        maxProjects: 1,
        maxDeployments: 3,
        aiAssistant: true,
        basicMonitoring: true,
        communitySupport: true,
        customDomains: false,
        autoScaling: false,
        teamCollaboration: false,
        enterpriseIntegrations: false,
        dedicatedSupport: false
      }
    },
    {
      id: 2,
      name: 'One Week',
      description: 'Perfect for short-term projects',
      price: 100,
      duration: '7 days',
      isRecurring: false,
      features: {
        maxProjects: 5,
        maxDeployments: 20,
        aiAssistant: true,
        advancedMonitoring: true,
        prioritySupport: true,
        customDomains: true,
        autoScaling: false,
        teamCollaboration: false,
        enterpriseIntegrations: false,
        dedicatedSupport: false
      }
    },
    {
      id: 3,
      name: 'One Month',
      description: 'Ideal for monthly projects',
      price: 180,
      duration: '30 days',
      isRecurring: false,
      features: {
        maxProjects: 10,
        maxDeployments: 50,
        aiAssistant: true,
        advancedMonitoring: true,
        prioritySupport: true,
        customDomains: true,
        autoScaling: true,
        teamCollaboration: false,
        enterpriseIntegrations: false,
        dedicatedSupport: false
      }
    },
    {
      id: 4,
      name: 'Two Months',
      description: 'Extended project support',
      price: 340,
      duration: '60 days',
      isRecurring: false,
      features: {
        maxProjects: 15,
        maxDeployments: 100,
        aiAssistant: true,
        advancedMonitoring: true,
        prioritySupport: true,
        customDomains: true,
        autoScaling: true,
        teamCollaboration: true,
        enterpriseIntegrations: false,
        dedicatedSupport: false
      }
    },
    {
      id: 5,
      name: 'Six Months',
      description: 'Semi-annual subscription with savings',
      price: 1000,
      duration: '6 months',
      isRecurring: true,
      popular: true,
      savings: 'Save 7%',
      features: {
        maxProjects: 25,
        maxDeployments: 300,
        aiAssistant: true,
        advancedMonitoring: true,
        prioritySupport: true,
        customDomains: true,
        autoScaling: true,
        teamCollaboration: true,
        enterpriseIntegrations: true,
        dedicatedSupport: false
      }
    },
    {
      id: 6,
      name: 'One Year',
      description: 'Annual subscription with maximum savings',
      price: 1400,
      duration: '12 months',
      isRecurring: true,
      savings: 'Save 35%',
      features: {
        maxProjects: 50,
        maxDeployments: 1000,
        aiAssistant: true,
        advancedMonitoring: true,
        prioritySupport: true,
        customDomains: true,
        autoScaling: true,
        teamCollaboration: true,
        enterpriseIntegrations: true,
        dedicatedSupport: true
      }
    }
  ];

  const handlePlanSelect = (plan: Plan) => {
    if (!currentUser) {
      toast.error('Please log in to subscribe');
      navigate('/login');
      return;
    }
    
    setSelectedPlan(plan);
    setShowCheckout(true);
  };

  const handleCheckout = async () => {
    if (!selectedPlan) return;

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/subscription/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await currentUser?.getIdToken()}`
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/pricing?cancelled=true`
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const stripe = await stripePromise;
        if (stripe) {
          const { error } = await stripe.redirectToCheckout({
            sessionId: data.data.sessionId
          });
          
          if (error) {
            toast.error('Checkout failed. Please try again.');
          }
        }
      } else {
        toast.error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const FeatureIcon = ({ feature }: { feature: string }) => {
    const icons: { [key: string]: React.ReactNode } = {
      maxProjects: <Users className="w-4 h-4" />,
      maxDeployments: <Zap className="w-4 h-4" />,
      aiAssistant: <Star className="w-4 h-4" />,
      advancedMonitoring: <Globe className="w-4 h-4" />,
      prioritySupport: <Shield className="w-4 h-4" />,
      customDomains: <Globe className="w-4 h-4" />,
      autoScaling: <Zap className="w-4 h-4" />,
      teamCollaboration: <Users className="w-4 h-4" />,
      enterpriseIntegrations: <Shield className="w-4 h-4" />,
      dedicatedSupport: <Star className="w-4 h-4" />
    };
    
    return icons[feature] || <Check className="w-4 h-4" />;
  };

  const formatFeature = (key: string, value: boolean | number) => {
    if (typeof value === 'boolean') {
      return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }
    return `${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${value}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start with a free trial, then choose the plan that fits your DevOps needs. 
              All plans include our AI-powered automation and deployment tools.
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                plan.popular 
                  ? 'border-blue-500 scale-105' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              {plan.savings && (
                <div className="absolute -top-2 -right-2">
                  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    {plan.savings}
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {plan.description}
                  </p>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline justify-center">
                      <span className="text-5xl font-bold text-gray-900">
                        ${plan.price}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-gray-500 ml-2">
                          /{plan.duration}
                        </span>
                      )}
                    </div>
                    {plan.price === 0 && (
                      <p className="text-green-600 font-semibold mt-2">
                        Free forever
                      </p>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {Object.entries(plan.features).map(([key, value]) => (
                    <div key={key} className="flex items-center">
                      {typeof value === 'boolean' ? (
                        value ? (
                          <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        ) : (
                          <X className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                        )
                      ) : (
                        <FeatureIcon feature={key} />
                      )}
                      <span className={`text-sm ${
                        typeof value === 'boolean' && !value 
                          ? 'text-gray-400' 
                          : 'text-gray-700'
                      }`}>
                        {formatFeature(key, value)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handlePlanSelect(plan)}
                  disabled={loading}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : plan.price === 0
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : plan.price === 0 ? (
                    'Start Free Trial'
                  ) : (
                    <div className="flex items-center justify-center">
                      Get Started
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">
                Can I change my plan anytime?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately with prorated billing.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">
                What happens when my trial ends?
              </h3>
              <p className="text-gray-600">
                Your deployments continue running, but you'll need to subscribe to create new projects or access advanced features.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600">
                We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, contact our support team.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">
                Is my data safe?
              </h3>
              <p className="text-gray-600">
                Absolutely! We use enterprise-grade security and encryption. Your code and data remain private and secure.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-20 text-center">
          <div className="flex items-center justify-center space-x-8 text-gray-400">
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              <span className="text-sm">SSL Secured</span>
            </div>
            <div className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              <span className="text-sm">Stripe Powered</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              <span className="text-sm">24/7 Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Confirm Subscription
            </h3>
            
            <div className="mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900">{selectedPlan.name}</h4>
                <p className="text-gray-600 text-sm">{selectedPlan.description}</p>
                <div className="mt-2 text-2xl font-bold text-gray-900">
                  ${selectedPlan.price}
                  {selectedPlan.price > 0 && (
                    <span className="text-sm font-normal text-gray-500">
                      /{selectedPlan.duration}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCheckout(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pricing; 