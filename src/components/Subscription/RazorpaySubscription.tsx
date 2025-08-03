import React, { useState, useEffect, useCallback } from 'react';
import { Check, Loader2, CreditCard, Shield, Zap, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  currency: string;
  features: string[];
  is_recurring: boolean;
}

interface UserSubscription {
  id: string;
  status: string;
  current_period_end: string;
  plan: SubscriptionPlan;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayWindow extends Window {
  Razorpay: new (options: RazorpayOptions) => {
    open: () => void;
  };
}

const RazorpaySubscription: React.FC = () => {
  const { currentUser, firebaseUser } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);


  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const loadSubscriptionData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load plans
      const plansResponse = await fetch('/api/razorpay/plans');
      const plansData = await plansResponse.json();
      
      if (plansData.success) {
        setPlans(plansData.plans);
      }

      // Load current subscription if user is logged in
      if (firebaseUser) {
        const subscriptionResponse = await fetch('/api/razorpay/subscription', {
          headers: {
            'Authorization': `Bearer ${await firebaseUser.getIdToken()}`
          }
        });
        const subscriptionData = await subscriptionResponse.json();
        
        if (subscriptionData.success) {
          setCurrentSubscription(subscriptionData.subscription);
        }
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  }, [firebaseUser]);

  // Load subscription plans and current subscription
  useEffect(() => {
    loadSubscriptionData();
  }, [loadSubscriptionData]);



  const handleSubscribe = async (planId: string) => {
    if (!currentUser) {
      toast.error('Please log in to subscribe');
      return;
    }

    try {
      setProcessingPayment(true);
      
      // Create payment order
      const orderResponse = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await firebaseUser!.getIdToken()}`
        },
        body: JSON.stringify({ planId })
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Handle free trial
      if (planId === 'free-trial') {
        toast.success('Free trial activated successfully!');
        await loadSubscriptionData();
        return;
      }

      // Initialize Razorpay payment
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_your_key_id',
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'Opsless',
        description: `${orderData.order.plan.name} - ${orderData.order.plan.description}`,
        image: 'https://opsless.com/logo.png',
        order_id: orderData.order.id,
        handler: async (response: RazorpayResponse) => {
          await handlePaymentSuccess(response, planId);
        },
        prefill: {
          name: currentUser.displayName || '',
          email: currentUser.email || '',
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: () => {
            setProcessingPayment(false);
          }
        }
      };

      const razorpay = (window as unknown as RazorpayWindow).Razorpay;
      if (razorpay) {
        const rzp = new razorpay(options);
        rzp.open();
      } else {
        throw new Error('Razorpay not loaded');
      }

    } catch (error) {
      console.error('Error processing subscription:', error);
      toast.error(error instanceof Error ? error.message : 'Payment failed');
      setProcessingPayment(false);
    }
  };

  const handlePaymentSuccess = async (response: RazorpayResponse, planId: string) => {
    try {
      // Verify payment
      const verifyResponse = await fetch('/api/razorpay/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await firebaseUser!.getIdToken()}`
        },
        body: JSON.stringify({
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
          planId
        })
      });

      const verifyData = await verifyResponse.json();

      if (verifyData.success) {
        toast.success('Payment successful! Your subscription is now active.');
        await loadSubscriptionData();
      } else {
        throw new Error(verifyData.error || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Payment verification failed');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!currentSubscription) return;

    try {
      const response = await fetch('/api/razorpay/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await firebaseUser!.getIdToken()}`
        },
        body: JSON.stringify({
          subscriptionId: currentSubscription.id
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Subscription cancelled successfully');
        await loadSubscriptionData();
      } else {
        throw new Error(data.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription');
    }
  };

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'Free';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency === 'INR' ? 'INR' : 'USD'
    }).format(price);
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free-trial':
        return <Star className="h-6 w-6 text-yellow-500" />;
      case 'weekly':
      case 'monthly':
        return <Zap className="h-6 w-6 text-blue-500" />;
      case 'two-months':
      case 'six-months':
        return <Shield className="h-6 w-6 text-green-500" />;
      case 'yearly':
        return <CreditCard className="h-6 w-6 text-purple-500" />;
      default:
        return <Star className="h-6 w-6 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading subscription plans...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Select the perfect plan for your DevOps automation needs. All plans include our AI-powered assistant and comprehensive deployment tools.
        </p>
      </div>

      {/* Current Subscription Status */}
      {currentSubscription && (
        <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-900">
                Active Subscription: {currentSubscription.plan.name}
              </h3>
              <p className="text-green-700">
                Expires: {new Date(currentSubscription.current_period_end).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={handleCancelSubscription}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Cancel Subscription
            </button>
          </div>
        </div>
      )}

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-lg shadow-lg border-2 transition-all duration-200 hover:shadow-xl border-gray-200 ${
              plan.id === 'yearly' ? 'ring-2 ring-purple-500 ring-opacity-50' : ''
            }`}
          >
            {/* Popular Badge */}
            {plan.id === 'yearly' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
            )}

            <div className="p-6">
              {/* Plan Header */}
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  {getPlanIcon(plan.id)}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {formatPrice(plan.price, plan.currency)}
                </div>
                <p className="text-sm text-gray-500">
                  {plan.duration_days === 3 ? '3 days' : 
                   plan.duration_days === 7 ? '1 week' :
                   plan.duration_days === 30 ? '1 month' :
                   plan.duration_days === 60 ? '2 months' :
                   plan.duration_days === 180 ? '6 months' :
                   plan.duration_days === 365 ? '1 year' : `${plan.duration_days} days`}
                </p>
              </div>

              {/* Features */}
              <div className="mb-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={processingPayment || !!(currentSubscription && currentSubscription.plan.id === plan.id)}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                  currentSubscription && currentSubscription.plan.id === plan.id
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : processingPayment
                    ? 'bg-blue-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {processingPayment ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Processing...
                  </div>
                ) : currentSubscription && currentSubscription.plan.id === plan.id ? (
                  'Current Plan'
                ) : plan.price === 0 ? (
                  'Start Free Trial'
                ) : (
                  `Subscribe Now`
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Features Comparison */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          All Plans Include
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Assistant</h3>
            <p className="text-gray-600">
              Get instant help with Docker, Kubernetes, Jenkins, and more from our AI assistant.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Deployments</h3>
            <p className="text-gray-600">
              Enterprise-grade security with encrypted credentials and secure infrastructure.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">24/7 Support</h3>
            <p className="text-gray-600">
              Get help anytime with our Discord community and email support.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Frequently Asked Questions
        </h2>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Can I cancel my subscription anytime?
            </h3>
            <p className="text-gray-600">
              Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              What happens after my free trial expires?
            </h3>
            <p className="text-gray-600">
              After your 3-day free trial, you'll need to choose a paid plan to continue using Opsless. No charges will be made during the trial period.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Is my payment information secure?
            </h3>
            <p className="text-gray-600">
              Yes, we use Razorpay for secure payment processing. We never store your payment information on our servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RazorpaySubscription; 