import React, { useState } from 'react';
import { useAWS } from '../../hooks/useAWS';
import { 
  Cloud, 
  Server, 
  Database, 
  HardDrive, 
  Zap, 
  Loader2, 
  RefreshCw, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Square,
  Settings,
  TrendingUp,
  Activity
} from 'lucide-react';

const AWSServicesManager: React.FC = () => {
  const { 
    hasCredentials, 
    services, 
    billing, 
    servicesLoading, 
    billingLoading, 
    refreshServices, 
    refreshBilling,
    stopService 
  } = useAWS();
  const [stoppingService, setStoppingService] = useState<string | null>(null);

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'EC2': return <Server className="h-5 w-5" />;
      case 'Lambda': return <Zap className="h-5 w-5" />;
      case 'S3': return <HardDrive className="h-5 w-5" />;
      case 'RDS': return <Database className="h-5 w-5" />;
      case 'ECS': return <Cloud className="h-5 w-5" />;
      case 'EKS': return <Cloud className="h-5 w-5" />;
      default: return <Settings className="h-5 w-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'stopped': return <Square className="h-4 w-4 text-yellow-500" />;
      case 'terminated': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-600 bg-green-50';
      case 'stopped': return 'text-yellow-600 bg-yellow-50';
      case 'terminated': return 'text-red-600 bg-red-50';
      case 'pending': return 'text-blue-600 bg-blue-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleStopService = async (serviceId: string, serviceType: string) => {
    if (!confirm(`Are you sure you want to stop this ${serviceType} service?`)) {
      return;
    }

    setStoppingService(serviceId);
    try {
      await stopService(serviceId, serviceType);
    } finally {
      setStoppingService(null);
    }
  };

  const formatCost = (cost: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(cost);
  };

  const runningServices = services.filter(service => service.status === 'running');
  const totalRunningCost = runningServices.reduce((sum, service) => sum + service.cost, 0);

  if (!hasCredentials) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <Cloud className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            AWS Account Not Connected
          </h3>
          <p className="text-gray-600 mb-4">
            Connect your AWS account to view and manage your services.
          </p>
          <button
            onClick={() => window.location.href = '/credentials'}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Connect AWS Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh buttons */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Active AWS Services</h2>
          <p className="text-gray-600">Monitor and manage your running AWS services</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={refreshServices}
            disabled={servicesLoading}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {servicesLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span>Refresh Services</span>
          </button>
          <button
            onClick={refreshBilling}
            disabled={billingLoading}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
          >
            {billingLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <DollarSign className="h-4 w-4" />
            )}
            <span>Refresh Billing</span>
          </button>
        </div>
      </div>

      {/* Billing Summary */}
      {billing && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Billing Summary</h3>
            <span className="text-sm text-gray-500">
              Last updated: {new Date(billing.lastUpdated).toLocaleString()}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Total Cost</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 mt-2">
                {formatCost(billing.totalCost)}
              </p>
              <p className="text-sm text-blue-600 mt-1">{billing.period}</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">Running Services</span>
              </div>
              <p className="text-2xl font-bold text-green-900 mt-2">
                {runningServices.length}
              </p>
              <p className="text-sm text-green-600 mt-1">Active instances</p>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-600">Running Cost</span>
              </div>
              <p className="text-2xl font-bold text-orange-900 mt-2">
                {formatCost(totalRunningCost)}
              </p>
              <p className="text-sm text-orange-600 mt-1">Current month</p>
            </div>
          </div>

          {/* Cost Breakdown */}
          {billing.breakdown && billing.breakdown.length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-semibold text-gray-900 mb-3">Cost Breakdown by Service</h4>
              <div className="space-y-2">
                {billing.breakdown.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{item.service}</span>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{item.percentage.toFixed(1)}%</span>
                      </div>
                      <span className="font-semibold text-gray-900">{formatCost(item.cost)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Services List */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Running Services</h3>
          <p className="text-gray-600 mt-1">
            {servicesLoading ? 'Loading services...' : `${services.length} total services found`}
          </p>
        </div>
        
        {servicesLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading AWS services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="p-8 text-center">
            <Cloud className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No Services Found</h4>
            <p className="text-gray-600">No AWS services are currently running in your account.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {services.map((service) => (
              <div key={service.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-blue-600">
                      {getServiceIcon(service.type)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{service.name}</h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-600">{service.type}</span>
                        <span className="text-sm text-gray-600">{service.region}</span>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(service.status)}
                          <span className={`text-sm px-2 py-1 rounded-full ${getStatusColor(service.status)}`}>
                            {service.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCost(service.cost)}</p>
                      <p className="text-sm text-gray-600">Monthly cost</p>
                    </div>
                    
                    {service.status === 'running' && (
                      <button
                        onClick={() => handleStopService(service.id, service.type)}
                        disabled={stoppingService === service.id}
                        className="flex items-center space-x-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                      >
                        {stoppingService === service.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                        <span>Stop</span>
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="mt-3 text-sm text-gray-500">
                  Last updated: {new Date(service.lastUpdated).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AWSServicesManager; 