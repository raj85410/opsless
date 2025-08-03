import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

interface Subscription {
  id: number;
  plan_name: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  features: {
    [key: string]: boolean | number;
  };
  price: number;
}

interface Usage {
  hasSubscription: boolean;
  subscription?: Subscription;
  limits: {
    max_projects: number;
    max_deployments: number;
  };
  usage: {
    projects: number;
    deployments: number;
  };
  remaining: {
    projects: number;
    deployments: number;
  };
}

const SubscriptionManager: React.FC = () => {
  const { firebaseUser } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchSubscriptionData = useCallback(async () => {
    if (!firebaseUser) return;

    try {
      setLoading(true);
      
      // Fetch subscription
      const subResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/subscription/current`, {
        headers: {
          'Authorization': `Bearer ${await firebaseUser.getIdToken()}`
        }
      });
      
      const subData = await subResponse.json();
      if (subData.success) {
        setSubscription(subData.data);
      }

      // Fetch usage
      const usageResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/subscription/usage`, {
        headers: {
          'Authorization': `Bearer ${await firebaseUser.getIdToken()}`
        }
      });
      
      const usageData = await usageResponse.json();
      if (usageData.success) {
        setUsage(usageData.data);
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast.error('Failed to load subscription information');
    } finally {
      setLoading(false);
    }
  }, [firebaseUser]);

  useEffect(() => {
    fetchSubscriptionData();
  }, [fetchSubscriptionData]);

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    if (!confirm('Are you sure you want to cancel your subscription? You can reactivate it anytime.')) {
      return;
    }

    try {
      setCancelling(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/subscription/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await firebaseUser?.getIdToken()}`
        },
        body: JSON.stringify({
          cancelAtPeriodEnd: true
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Subscription cancelled successfully');
        fetchSubscriptionData(); // Refresh data
      } else {
        toast.error(data.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setCancelling(false);
    }
  };

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      case 'expired':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'expired':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <RefreshCw className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Current Subscription</h2>
          <button
            onClick={fetchSubscriptionData}
            className="text-blue-600 hover:text-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {subscription ? (
          <div className="space-y-4">
            {/* Plan Info */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{subscription.plan_name}</h3>
                <p className="text-gray-600">${subscription.price} per period</p>
              </div>
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
                {getStatusIcon(subscription.status)}
                <span className="capitalize">{subscription.status}</span>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Started</p>
                  <p className="font-medium text-gray-900">{formatDate(subscription.current_period_start)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                <Calendar className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Expires</p>
                  <p className="font-medium text-gray-900">{formatDate(subscription.current_period_end)}</p>
                </div>
              </div>
            </div>

            {/* Cancellation Notice */}
            {subscription.cancel_at_period_end && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <p className="text-yellow-800 font-medium">Subscription will be cancelled</p>
                </div>
                <p className="text-yellow-700 text-sm mt-1">
                  Your subscription will end on {formatDate(subscription.current_period_end)}. 
                  You can reactivate it anytime before then.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3">
              {!subscription.cancel_at_period_end && (
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelling}
                  className="flex-1 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
                </button>
              )}
              <button
                onClick={handleUpgrade}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Change Plan
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Subscription</h3>
            <p className="text-gray-600 mb-4">
              You're currently on the free trial. Upgrade to unlock all features.
            </p>
            <button
              onClick={handleUpgrade}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              View Plans
            </button>
          </div>
        )}
      </div>

      {/* Usage Stats */}
      {usage && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Usage Statistics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Projects */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Projects</span>
                </div>
                <span className="text-sm text-gray-600">
                  {usage.usage.projects} / {usage.limits.max_projects}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min((usage.usage.projects / usage.limits.max_projects) * 100, 100)}%` 
                  }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {usage.remaining.projects} projects remaining
              </p>
            </div>

            {/* Deployments */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-900">Deployments</span>
                </div>
                <span className="text-sm text-gray-600">
                  {usage.usage.deployments} / {usage.limits.max_deployments}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min((usage.usage.deployments / usage.limits.max_deployments) * 100, 100)}%` 
                  }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {usage.remaining.deployments} deployments remaining
              </p>
            </div>
          </div>

          {/* Usage Warning */}
          {(usage.usage.projects / usage.limits.max_projects > 0.8 || 
            usage.usage.deployments / usage.limits.max_deployments > 0.8) && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <p className="text-yellow-800 font-medium">Usage Warning</p>
              </div>
              <p className="text-yellow-700 text-sm mt-1">
                You're approaching your plan limits. Consider upgrading to avoid service interruptions.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Plan Features */}
      {subscription && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Plan Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(subscription.features).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                {typeof value === 'boolean' ? (
                  value ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400" />
                  )
                ) : (
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                )}
                <span className="text-gray-900">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  {typeof value === 'number' && `: ${value}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManager; 