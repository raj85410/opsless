import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../config/firebase';
import { Credentials, CredentialsFormData } from '../../types';
import { Eye, EyeOff, Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface CredentialsSetupProps {
  onComplete?: () => void;
  isModal?: boolean;
}

const CredentialsSetup: React.FC<CredentialsSetupProps> = ({ onComplete, isModal = false }) => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [existingCredentials, setExistingCredentials] = useState<Credentials | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset
  } = useForm<CredentialsFormData>();

  const loadExistingCredentials = useCallback(async () => {
    if (!currentUser) return;

    try {
      const credentialsRef = doc(db, 'users', currentUser.uid, 'secrets', 'credentials');
      const credentialsSnap = await getDoc(credentialsRef);
      
      if (credentialsSnap.exists()) {
        const data = credentialsSnap.data() as Credentials;
        setExistingCredentials(data);
        
        // Pre-fill form with existing data (masked) - batch updates
        const maskedValues: Partial<CredentialsFormData> = {};
        Object.keys(data).forEach(key => {
          if (key !== 'id' && key !== 'userId' && key !== 'createdAt' && key !== 'updatedAt') {
            const value = data[key as keyof Credentials];
            if (typeof value === 'string' && value.length > 0) {
              maskedValues[key as keyof CredentialsFormData] = '••••••••••••••••';
            }
          }
        });
        
        // Set all values at once instead of multiple setValue calls
        Object.entries(maskedValues).forEach(([key, value]) => {
          setValue(key as keyof CredentialsFormData, value);
        });
      }
    } catch (error) {
      console.error('Error loading credentials:', error);
    }
  }, [currentUser, setValue]);

  // Check for existing credentials on component mount
  useEffect(() => {
    if (currentUser) {
      loadExistingCredentials();
    }
  }, [currentUser, loadExistingCredentials]);

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const onSubmit = async (data: CredentialsFormData) => {
    if (!currentUser) {
      toast.error('You must be logged in to save credentials');
      return;
    }

    setIsLoading(true);

    try {
      // Validate that at least one set of credentials is provided
      const hasGitHub = data.githubToken && data.githubToken !== '••••••••••••••••';
      const hasDocker = data.dockerUsername && data.dockerToken && 
                       data.dockerUsername !== '••••••••••••••••' && 
                       data.dockerToken !== '••••••••••••••••';
      const hasJenkins = data.jenkinsUrl && data.jenkinsUser && data.jenkinsToken &&
                        data.jenkinsUrl !== '••••••••••••••••' &&
                        data.jenkinsUser !== '••••••••••••••••' &&
                        data.jenkinsToken !== '••••••••••••••••';
      const hasAWS = data.awsAccessKeyId && data.awsSecretAccessKey && data.awsRegion &&
                    data.awsAccessKeyId !== '••••••••••••••••' &&
                    data.awsSecretAccessKey !== '••••••••••••••••' &&
                    data.awsRegion !== '••••••••••••••••';
      const hasSSH = data.sshHost && data.sshPort && data.sshUsername && data.sshPassword &&
                    data.sshHost !== '••••••••••••••••' &&
                    data.sshPort !== '••••••••••••••••' &&
                    data.sshUsername !== '••••••••••••••••' &&
                    data.sshPassword !== '••••••••••••••••';

      if (!hasGitHub && !hasDocker && !hasJenkins && !hasAWS && !hasSSH) {
        toast.error('Please provide at least one set of credentials');
        return;
      }

      // Prepare credentials data (only save non-masked values)
      const credentialsData: Partial<Credentials> = {
        userId: currentUser.uid,
        updatedAt: new Date()
      };

      if (hasGitHub) credentialsData.githubToken = data.githubToken;
      if (hasDocker) {
        credentialsData.dockerUsername = data.dockerUsername;
        credentialsData.dockerToken = data.dockerToken;
      }
      if (hasJenkins) {
        credentialsData.jenkinsUrl = data.jenkinsUrl;
        credentialsData.jenkinsUser = data.jenkinsUser;
        credentialsData.jenkinsToken = data.jenkinsToken;
      }
      if (hasAWS) {
        credentialsData.awsAccessKeyId = data.awsAccessKeyId;
        credentialsData.awsSecretAccessKey = data.awsSecretAccessKey;
        credentialsData.awsRegion = data.awsRegion;
      }
      if (hasSSH) {
        credentialsData.sshHost = data.sshHost;
        credentialsData.sshPort = data.sshPort;
        credentialsData.sshUsername = data.sshUsername;
        credentialsData.sshPassword = data.sshPassword;
      }

      // Save to Firestore
      const credentialsRef = doc(db, 'users', currentUser.uid, 'secrets', 'credentials');
      await setDoc(credentialsRef, credentialsData, { merge: true });

      toast.success('Credentials saved successfully!');
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error saving credentials:', error);
      toast.error('Failed to save credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (
    name: keyof CredentialsFormData,
    label: string,
    placeholder: string,
    type: 'text' | 'password' = 'text',
    required: boolean = false,
    validation?: Record<string, unknown>
  ) => {
    const isPassword = type === 'password';
    const showPassword = showPasswords[name];
    const currentValue = watch(name);

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <input
            {...register(name, validation)}
            type={isPassword && showPassword ? 'text' : type}
            placeholder={placeholder}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors[name] ? 'border-red-300' : 'border-gray-300'
            } ${currentValue === '••••••••••••••••' ? 'bg-gray-50' : ''}`}
            disabled={isLoading}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => togglePasswordVisibility(name)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>
        {errors[name] && (
          <p className="text-sm text-red-600">{errors[name]?.message}</p>
        )}
      </div>
    );
  };

  return (
    <div className={`${isModal ? '' : 'max-w-4xl mx-auto p-6'} bg-white rounded-xl shadow-lg`}>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Secure Credentials Setup</h2>
            <p className="text-gray-600">Configure your CI/CD credentials for seamless deployments</p>
          </div>
        </div>
        
        {existingCredentials && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg mb-6">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-800">
              Credentials already configured. You can update them below.
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* GitHub Section */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">GH</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">GitHub Integration</h3>
              <p className="text-sm text-gray-600">For repository access and webhooks</p>
            </div>
          </div>
          
          {renderField(
            'githubToken',
            'GitHub Personal Access Token',
            'ghp_xxxxxxxxxxxxxxxxxxxx',
            'password',
            false,
            {
              pattern: {
                value: /^(ghp_|gho_|ghu_|ghs_|ghr_)[a-zA-Z0-9_]{36}$|^••••••••••••••••$/,
                message: 'Please enter a valid GitHub token'
              }
            }
          )}
        </div>

        {/* Docker Section */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Docker Hub</h3>
              <p className="text-sm text-gray-600">For container registry access</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField(
              'dockerUsername',
              'Docker Hub Username',
              'your-username',
              'text',
              false
            )}
            {renderField(
              'dockerToken',
              'Docker Hub Access Token',
              'dckr_pat_xxxxxxxxxxxxxxxxxxxx',
              'password',
              false,
              {
                pattern: {
                  value: /^dckr_pat_[a-zA-Z0-9]{26}$|^••••••••••••••••$/,
                  message: 'Please enter a valid Docker token'
                }
              }
            )}
          </div>
        </div>

        {/* Jenkins Section */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">J</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Jenkins CI/CD</h3>
              <p className="text-sm text-gray-600">For build automation and pipelines</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {renderField(
              'jenkinsUrl',
              'Jenkins Server URL',
              'https://jenkins.yourcompany.com',
              'text',
              false,
              {
                pattern: {
                  value: /^https?:\/\/.+|^••••••••••••••••$/,
                  message: 'Please enter a valid URL'
                }
              }
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField(
                'jenkinsUser',
                'Jenkins Username',
                'jenkins-user',
                'text',
                false
              )}
              {renderField(
                'jenkinsToken',
                'Jenkins API Token',
                'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                'password',
                false
              )}
            </div>
          </div>
        </div>

        {/* AWS Section */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AWS Cloud</h3>
              <p className="text-sm text-gray-600">For cloud deployment and infrastructure</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField(
                'awsAccessKeyId',
                'AWS Access Key ID',
                'AKIAIOSFODNN7EXAMPLE',
                'text',
                false,
                {
                  pattern: {
                    value: /^AKIA[0-9A-Z]{16}$|^••••••••••••••••$/,
                    message: 'Please enter a valid AWS Access Key ID'
                  }
                }
              )}
              {renderField(
                'awsRegion',
                'AWS Region',
                'us-east-1',
                'text',
                false,
                {
                  pattern: {
                    value: /^[a-z]{2}-[a-z]+-\d{1}$|^••••••••••••••••$/,
                    message: 'Please enter a valid AWS region'
                  }
                }
              )}
            </div>
            {renderField(
              'awsSecretAccessKey',
              'AWS Secret Access Key',
              'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
              'password',
              false,
              {
                pattern: {
                  value: /^[A-Za-z0-9/+=]{40}$|^••••••••••••••••$/,
                  message: 'Please enter a valid AWS Secret Access Key'
                }
              }
            )}
          </div>
        </div>

        {/* SSH Section */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">VM</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Target VM (SSH)</h3>
              <p className="text-sm text-gray-600">Configure remote server for deployment</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField(
                'sshHost',
                'Host IP Address',
                '192.168.1.100',
                'text',
                false,
                {
                  pattern: {
                    value: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^••••••••••••••••$/,
                    message: 'Please enter a valid IP address'
                  }
                }
              )}
              {renderField(
                'sshPort',
                'Port',
                '22',
                'text',
                false,
                {
                  pattern: {
                    value: /^[1-9]\d{0,4}$|^••••••••••••••••$/,
                    message: 'Please enter a valid port number (1-65535)'
                  }
                }
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField(
                'sshUsername',
                'SSH Username',
                'root or ubuntu',
                'text',
                false
              )}
              {renderField(
                'sshPassword',
                'SSH Password',
                'Your SSH password',
                'password',
                false
              )}
            </div>
            
            {/* Authentication Note */}
            <div className="text-sm text-gray-600 italic">
              Key-based authentication coming in future release
            </div>
          </div>
        </div>

        {/* Supported Systems Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
            <span className="text-sm font-medium text-blue-900">
              Supported Systems: RHEL, Ubuntu, CentOS, Amazon Linux, and other SSH-enabled VMs
            </span>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">Security & Privacy</h4>
              <p className="text-sm text-blue-700 mt-1">
                All credentials are encrypted and stored securely in Firebase Firestore. 
                We never store or transmit credentials in plain text. 
                You can update these credentials at any time from your dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => reset()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Save Credentials
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CredentialsSetup;