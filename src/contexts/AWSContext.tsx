import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

interface AWSCredentials {
  id?: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  accountId?: string;
  created_at?: string;
}

interface AWSService {
  id: string;
  name: string;
  type: 'EC2' | 'Lambda' | 'S3' | 'RDS' | 'ECS' | 'EKS' | 'CloudFormation' | 'ELB' | 'ElastiCache' | 'DynamoDB';
  status: 'running' | 'stopped' | 'terminated' | 'pending' | 'error';
  region: string;
  cost: number;
  lastUpdated: string;
  details?: Record<string, unknown>;
}

interface AWSBilling {
  totalCost: number;
  currency: string;
  period: string;
  breakdown: {
    service: string;
    cost: number;
    percentage: number;
  }[];
  lastUpdated: string;
}

interface AWSContextType {
  credentials: AWSCredentials | null;
  hasCredentials: boolean;
  services: AWSService[];
  billing: AWSBilling | null;
  loading: boolean;
  servicesLoading: boolean;
  billingLoading: boolean;
  connectAWS: (credentials: Omit<AWSCredentials, 'id' | 'created_at'>) => Promise<void>;
  disconnectAWS: () => Promise<void>;
  refreshServices: () => Promise<void>;
  refreshBilling: () => Promise<void>;
  stopService: (serviceId: string, serviceType: string) => Promise<void>;
  loadCredentials: () => Promise<void>;
}

export const AWSContext = createContext<AWSContextType | undefined>(undefined);

export const AWSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { firebaseUser } = useAuth();
  const [credentials, setCredentials] = useState<AWSCredentials | null>(null);
  const [services, setServices] = useState<AWSService[]>([]);
  const [billing, setBilling] = useState<AWSBilling | null>(null);
  const [loading, setLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);

  const loadCredentials = useCallback(async () => {
    if (!firebaseUser) return;

    try {
      setLoading(true);
      const token = await firebaseUser.getIdToken();
      const response = await fetch('/api/aws/credentials', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          setCredentials(data.data[0]); // Use the first set of credentials
        } else {
          setCredentials(null);
        }
      } else {
        setCredentials(null);
      }
    } catch (error) {
      console.error('Error loading AWS credentials:', error);
      setCredentials(null);
    } finally {
      setLoading(false);
    }
  }, [firebaseUser]);

  const connectAWS = async (newCredentials: Omit<AWSCredentials, 'id' | 'created_at'>) => {
    if (!firebaseUser) {
      toast.error('Please sign in to connect AWS account');
      return;
    }

    try {
      setLoading(true);
      const token = await firebaseUser.getIdToken();
      const response = await fetch('/api/aws/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newCredentials)
      });

      if (response.ok) {
        const data = await response.json();
        setCredentials(data.data);
        toast.success('AWS account connected successfully!');
        await refreshServices();
        await refreshBilling();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to connect AWS account');
      }
    } catch (error) {
      console.error('Error connecting AWS:', error);
      toast.error('Failed to connect AWS account');
    } finally {
      setLoading(false);
    }
  };

  const disconnectAWS = async () => {
    if (!firebaseUser || !credentials?.id) return;

    try {
      setLoading(true);
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`/api/aws/credentials/${credentials.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setCredentials(null);
        setServices([]);
        setBilling(null);
        toast.success('AWS account disconnected successfully');
      } else {
        toast.error('Failed to disconnect AWS account');
      }
    } catch (error) {
      console.error('Error disconnecting AWS:', error);
      toast.error('Failed to disconnect AWS account');
    } finally {
      setLoading(false);
    }
  };

  const refreshServices = useCallback(async () => {
    if (!firebaseUser || !credentials) return;

    try {
      setServicesLoading(true);
      const token = await firebaseUser.getIdToken();
      const response = await fetch('/api/aws/services', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setServices(data.data || []);
      } else {
        console.error('Failed to fetch AWS services');
      }
    } catch (error) {
      console.error('Error fetching AWS services:', error);
    } finally {
      setServicesLoading(false);
    }
  }, [firebaseUser, credentials]);

  const refreshBilling = useCallback(async () => {
    if (!firebaseUser || !credentials) return;

    try {
      setBillingLoading(true);
      const token = await firebaseUser.getIdToken();
      const response = await fetch('/api/aws/billing', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBilling(data.data);
      } else {
        console.error('Failed to fetch AWS billing');
      }
    } catch (error) {
      console.error('Error fetching AWS billing:', error);
    } finally {
      setBillingLoading(false);
    }
  }, [firebaseUser, credentials]);

  const stopService = async (serviceId: string, serviceType: string) => {
    if (!firebaseUser || !credentials) return;

    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`/api/aws/services/${serviceId}/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ serviceType })
      });

      if (response.ok) {
        toast.success(`${serviceType} service stopped successfully`);
        await refreshServices();
        await refreshBilling();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || `Failed to stop ${serviceType} service`);
      }
    } catch (error) {
      console.error('Error stopping service:', error);
      toast.error(`Failed to stop ${serviceType} service`);
    }
  };

  // Load credentials on mount and when user changes
  useEffect(() => {
    loadCredentials();
  }, [loadCredentials]);

  // Auto-refresh services and billing every 5 minutes
  useEffect(() => {
    if (!credentials) return;

    const interval = setInterval(() => {
      refreshServices();
      refreshBilling();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [credentials, refreshServices, refreshBilling]);

  const value = {
    credentials,
    hasCredentials: !!credentials,
    services,
    billing,
    loading,
    servicesLoading,
    billingLoading,
    connectAWS,
    disconnectAWS,
    refreshServices,
    refreshBilling,
    stopService,
    loadCredentials
  };

  return (
    <AWSContext.Provider value={value}>
      {children}
    </AWSContext.Provider>
  );
}; 