import React, { useState, useEffect } from 'react';
// import { useAuth } from '../contexts/AuthContext';
import { 
  Shield, 
  Key, 
  Globe, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  Loader2,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AWSCredentials {
  id?: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  accountId?: string;
  account_id?: string;
  created_at?: string;
}

const AWSCredentialsSetup: React.FC = () => {
  // const { currentUser } = useAuth();
  const [credentials, setCredentials] = useState<AWSCredentials>({
    accessKeyId: '',
    secretAccessKey: '',
    region: 'us-east-1',
    accountId: ''
  });
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [existingCredentials, setExistingCredentials] = useState<AWSCredentials[]>([]);

  const regions = [
    { value: 'us-east-1', label: 'US East (N. Virginia)' },
    { value: 'us-east-2', label: 'US East (Ohio)' },
    { value: 'us-west-1', label: 'US West (N. California)' },
    { value: 'us-west-2', label: 'US West (Oregon)' },
    { value: 'eu-west-1', label: 'Europe (Ireland)' },
    { value: 'eu-central-1', label: 'Europe (Frankfurt)' },
    { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
    { value: 'ap-southeast-2', label: 'Asia Pacific (Sydney)' },
    { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)' },
    { value: 'sa-east-1', label: 'South America (São Paulo)' }
  ];

  useEffect(() => {
    loadExistingCredentials();
  }, []);

  const loadExistingCredentials = async () => {
    try {
      const response = await fetch('/api/aws/credentials', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setExistingCredentials(data.data || []);
      }
    } catch (error) {
      console.error('Error loading credentials:', error);
    }
  };

  const handleInputChange = (field: keyof AWSCredentials, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateCredentials = (): boolean => {
    if (!credentials.accessKeyId || !credentials.secretAccessKey) {
      toast.error('Access Key ID and Secret Access Key are required');
      return false;
    }

    if (credentials.accessKeyId.length !== 20) {
      toast.error('Access Key ID must be exactly 20 characters');
      return false;
    }

    if (credentials.secretAccessKey.length !== 40) {
      toast.error('Secret Access Key must be exactly 40 characters');
      return false;
    }

    if (credentials.accountId && credentials.accountId.length !== 12) {
      toast.error('Account ID must be exactly 12 digits');
      return false;
    }

    return true;
  };

  const testCredentials = async () => {
    if (!validateCredentials()) return;

    setTesting(true);
    try {
      const response = await fetch('/api/aws/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('AWS credentials verified successfully!');
        await loadExistingCredentials();
      } else {
        toast.error(data.message || 'Failed to verify credentials');
      }
    } catch (error) {
      console.error('Error testing credentials:', error);
      toast.error('Failed to test credentials');
    } finally {
      setTesting(false);
    }
  };

  const saveCredentials = async () => {
    if (!validateCredentials()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/aws/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('AWS credentials saved successfully!');
        setCredentials({
          accessKeyId: '',
          secretAccessKey: '',
          region: 'us-east-1',
          accountId: ''
        });
        await loadExistingCredentials();
      } else {
        toast.error(data.message || 'Failed to save credentials');
      }
    } catch (error) {
      console.error('Error saving credentials:', error);
      toast.error('Failed to save credentials');
    } finally {
      setLoading(false);
    }
  };

  const deleteCredential = async (credentialId: string) => {
    if (!confirm('Are you sure you want to delete these credentials?')) return;

    try {
      const response = await fetch(`/api/aws/credentials/${credentialId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('Credentials deleted successfully');
        await loadExistingCredentials();
      } else {
        toast.error('Failed to delete credentials');
      }
    } catch (error) {
      console.error('Error deleting credentials:', error);
      toast.error('Failed to delete credentials');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AWS Credentials Setup</h2>
            <p className="text-gray-600">Configure your AWS credentials to enable deployment services</p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">Security Information</h3>
              <p className="text-sm text-blue-700 mt-1">
                Your AWS credentials are encrypted and stored securely. We recommend using IAM users with limited permissions 
                rather than root account credentials. Never share your credentials with anyone.
              </p>
            </div>
          </div>
        </div>

        {/* Existing Credentials */}
        {existingCredentials.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Existing Credentials</h3>
            <div className="space-y-3">
              {existingCredentials.map((cred) => (
                <div key={cred.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Region: {regions.find(r => r.value === cred.region)?.label || cred.region}
                      </p>
                      <p className="text-sm text-gray-600">
                        Account ID: {cred.account_id || 'Not specified'} • Added: {cred.created_at ? new Date(cred.created_at).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => cred.id && deleteCredential(cred.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Credentials */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New AWS Credentials</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Access Key ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Key ID <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={credentials.accessKeyId}
                  onChange={(e) => handleInputChange('accessKeyId', e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="AKIA..."
                  maxLength={20}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">20 characters, starts with AKIA</p>
            </div>

            {/* Secret Access Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secret Access Key <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showSecretKey ? 'text' : 'password'}
                  value={credentials.secretAccessKey}
                  onChange={(e) => handleInputChange('secretAccessKey', e.target.value)}
                  className="pl-10 pr-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••••••••••••••••••••••••••••••••••"
                  maxLength={40}
                />
                <button
                  type="button"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">40 characters</p>
            </div>

            {/* Region */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AWS Region <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={credentials.region}
                  onChange={(e) => handleInputChange('region', e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {regions.map((region) => (
                    <option key={region.value} value={region.value}>
                      {region.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Account ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AWS Account ID (Optional)
              </label>
              <input
                type="text"
                value={credentials.accountId}
                onChange={(e) => handleInputChange('accountId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="123456789012"
                maxLength={12}
              />
              <p className="text-xs text-gray-500 mt-1">12-digit AWS account number</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4 mt-6">
            <button
              onClick={testCredentials}
              disabled={testing || loading}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <span>{testing ? 'Testing...' : 'Test Credentials'}</span>
            </button>

            <button
              onClick={saveCredentials}
              disabled={loading || testing}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Shield className="h-4 w-4" />
              )}
              <span>{loading ? 'Saving...' : 'Save Credentials'}</span>
            </button>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">How to get AWS credentials?</h4>
          <ol className="text-sm text-gray-600 space-y-1">
            <li>1. Sign in to the AWS Management Console</li>
            <li>2. Go to IAM → Users → Create User</li>
            <li>3. Attach policies for the services you need (EC2, ECS, S3, etc.)</li>
            <li>4. Create Access Keys for the user</li>
            <li>5. Copy the Access Key ID and Secret Access Key</li>
          </ol>
          <div className="mt-3">
            <a
              href="https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Learn more about AWS credentials →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AWSCredentialsSetup; 