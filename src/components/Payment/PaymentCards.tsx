import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Star, 
  Zap, 
  Shield, 
  Users, 
  Server, 
  Cloud,
  Loader2,
  CreditCard
} from 'lucide-react';
import toast from 'react-hot-toast';
import { paymentService } from '../../services/paymentService';

interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  currency: string;
  period: string;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
  color: string;
  description: string;
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

const PaymentCards: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');

  // Razorpay test keys
  const RAZORPAY_KEY_ID = 'rzp_test_KqWmsGcJ7zWMXD';
  const RAZORPAY_KEY_SECRET = '5gez5Z1TzA2GcunGLDGIJz46';

  const plans: PaymentPlan[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: 999,
      originalPrice: 1499,
      currency: 'INR',
      period: 'month',
      features: [
        'Up to 5 projects',
        'Basic CI/CD pipelines',
        'Email support',
        '1GB storage',
        'Community access'
      ],
      icon: <Zap className="h-6 w-6" />,
      color: 'blue',
      description: 'Perfect for individual developers and small teams'
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 2499,
      originalPrice: 3499,
      currency: 'INR',
      period: 'month',
      features: [
        'Up to 25 projects',
        'Advanced CI/CD pipelines',
        'Priority support',
        '10GB storage',
        'Team collaboration',
        'Custom domains',
        'Analytics dashboard'
      ],
      popular: true,
      icon: <Shield className="h-6 w-6" />,
      color: 'purple',
      description: 'Ideal for growing teams and businesses'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 4999,
      originalPrice: 6999,
      currency: 'INR',
      period: 'month',
      features: [
        'Unlimited projects',
        'Enterprise CI/CD',
        '24/7 phone support',
        'Unlimited storage',
        'Advanced security',
        'Custom integrations',
        'Dedicated account manager',
        'SLA guarantees'
      ],
      icon: <Users className="h-6 w-6" />,
      color: 'green',
      description: 'For large organizations with complex needs'
    }
  ];

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async (plan: PaymentPlan) => {
    if (!userEmail || !userName) {
      toast.error('Please enter your name and email first');
      return;
    }

    setLoading(plan.id);
    
    try {
      // Create order using mock service (replace with actual backend call)
      const orderData = await paymentService.createOrder({
        amount: plan.price * 100, // Razorpay expects amount in paise
        currency: plan.currency,
        planId: plan.id,
        planName: plan.name
      });

      // Initialize Razorpay
      const options: RazorpayOptions = {
        key: RAZORPAY_KEY_ID,
        amount: plan.price * 100,
        currency: plan.currency,
        name: 'Opsless',
        description: `${plan.name} Plan - ${plan.description}`,
        image: 'https://opsless.com/logo.png',
        order_id: orderData.orderId,
        handler: async (response: RazorpayResponse) => {
          await handlePaymentSuccess(response, plan);
        },
        prefill: {
          name: userName,
          email: userEmail,
        },
        theme: {
          color: getColorValue(plan.color),
        },
        modal: {
          ondismiss: () => {
            setLoading(null);
            toast('Payment cancelled');
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
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
      setLoading(null);
    }
  };

  const handlePaymentSuccess = async (response: RazorpayResponse, plan: PaymentPlan) => {
    try {
      // Verify payment using mock service (replace with actual backend call)
      const verifyResult = await paymentService.verifyPayment({
        paymentId: response.razorpay_payment_id,
        orderId: response.razorpay_order_id,
        signature: response.razorpay_signature,
        planId: plan.id
      });

      if (verifyResult.success) {
        toast.success(`Payment successful! Welcome to ${plan.name} plan!`);
        // Redirect to dashboard or show success page
        window.location.href = '/dashboard';
      } else {
        throw new Error(verifyResult.message);
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Payment verification failed');
    } finally {
      setLoading(null);
    }
  };

  const getColorValue = (color: string): string => {
    switch (color) {
      case 'blue': return '#3B82F6';
      case 'purple': return '#8B5CF6';
      case 'green': return '#10B981';
      default: return '#3B82F6';
    }
  };

  const getColorClasses = (color: string): string => {
    switch (color) {
      case 'blue': return 'border-blue-200 bg-blue-50 hover:bg-blue-100';
      case 'purple': return 'border-purple-200 bg-purple-50 hover:bg-purple-100';
      case 'green': return 'border-green-200 bg-green-50 hover:bg-green-100';
      default: return 'border-blue-200 bg-blue-50 hover:bg-blue-100';
    }
  };

  const getIconColor = (color: string): string => {
    switch (color) {
      case 'blue': return 'text-blue-600';
      case 'purple': return 'text-purple-600';
      case 'green': return 'text-green-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select the perfect plan for your DevOps needs. All plans include a 14-day free trial.
          </p>
        </div>

        {/* User Info Form */}
        <div className="max-w-md mx-auto mb-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>
          </div>
        </div>

        {/* Payment Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                plan.popular ? 'border-purple-500 ring-2 ring-purple-500 ring-opacity-50' : 'border-gray-200'
              } ${getColorClasses(plan.color)}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${getColorClasses(plan.color)}`}>
                    <div className={getIconColor(plan.color)}>
                      {plan.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                </div>

                {/* Pricing */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <span className="text-4xl font-bold text-gray-900">
                      ₹{plan.price.toLocaleString()}
                    </span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                  {plan.originalPrice && (
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-lg text-gray-500 line-through">
                        ₹{plan.originalPrice.toLocaleString()}
                      </span>
                      <span className="text-green-600 font-semibold">
                        Save ₹{(plan.originalPrice - plan.price).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="mb-8">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-3">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Payment Button */}
                <button
                  onClick={() => handlePayment(plan)}
                  disabled={loading === plan.id || !userName || !userEmail}
                  className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors flex items-center justify-center space-x-2 ${
                    loading === plan.id
                      ? 'bg-gray-400 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loading === plan.id ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      <span>Get Started</span>
                    </>
                  )}
                </button>

                {/* Security Note */}
                <p className="text-xs text-gray-500 text-center mt-4">
                  🔒 Secure payment powered by Razorpay
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Why Choose Opsless?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-green-600" />
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900">Enterprise Security</h4>
                  <p className="text-sm text-gray-600">Bank-level security for your deployments</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Zap className="h-6 w-6 text-blue-600" />
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900">Lightning Fast</h4>
                  <p className="text-sm text-gray-600">Deploy in seconds, not minutes</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="h-6 w-6 text-purple-600" />
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900">Team Collaboration</h4>
                  <p className="text-sm text-gray-600">Built for teams of all sizes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCards; 