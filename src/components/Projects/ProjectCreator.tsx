import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../config/firebase';
import { Project, ProjectFormData, DeploymentConfig } from '../../types';
import Logo from '../Logo';
import { 
  Database, 
  Loader2,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ProjectCreatorProps {
  onComplete?: (projectId: string) => void;
  isModal?: boolean;
}

const ProjectCreator: React.FC<ProjectCreatorProps> = ({ onComplete, isModal = false }) => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [repositoryInfo, setRepositoryInfo] = useState<{
    name: string;
    description: string;
    defaultBranch: string;
    isPrivate: boolean;
    lastCommit: string;
  } | null>(null);
  const [isValidatingRepo, setIsValidatingRepo] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    control
  } = useForm<ProjectFormData>({
    defaultValues: {
      name: '',
      description: '',
      repositoryUrl: '',
      repositoryType: 'github',
      branch: 'main',
      framework: 'react',
      buildCommand: '',
      outputDirectory: '',
      platform: 'aws',
      region: 'us-east-1',
      domain: '',
      sslEnabled: true,
      autoScaling: false,
      minInstances: 1,
      maxInstances: 3,
      environment: 'production'
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'environmentVariables'
  });

  const watchedValues = watch();
  const watchedFramework = watch('framework');
  const watchedPlatform = watch('platform');

  // Auto-detect framework based on repository URL
  useEffect(() => {
    const repoUrl = watchedValues.repositoryUrl;
    if (repoUrl && !watchedValues.framework) {
      const url = repoUrl.toLowerCase();
      if (url.includes('react') || url.includes('next') || url.includes('gatsby')) {
        setValue('framework', 'react');
      } else if (url.includes('vue') || url.includes('nuxt')) {
        setValue('framework', 'vue');
      } else if (url.includes('angular')) {
        setValue('framework', 'angular');
      } else if (url.includes('node') || url.includes('express')) {
        setValue('framework', 'node');
      } else if (url.includes('python') || url.includes('django') || url.includes('flask')) {
        setValue('framework', 'python');
      } else if (url.includes('java') || url.includes('spring')) {
        setValue('framework', 'java');
      } else if (url.includes('dotnet') || url.includes('aspnet')) {
        setValue('framework', 'dotnet');
      } else if (url.includes('php') || url.includes('laravel')) {
        setValue('framework', 'php');
      } else if (url.includes('go')) {
        setValue('framework', 'go');
      } else if (url.includes('rust')) {
        setValue('framework', 'rust');
      }
    }
  }, [watchedValues.repositoryUrl, setValue, watchedValues.framework]);

  // Set default build commands based on framework
  useEffect(() => {
    if (watchedFramework && !watchedValues.buildCommand) {
      const buildCommands: Record<string, string> = {
        react: 'npm run build',
        vue: 'npm run build',
        angular: 'ng build --prod',
        node: 'npm install && npm start',
        python: 'pip install -r requirements.txt',
        java: './gradlew build',
        dotnet: 'dotnet build',
        php: 'composer install',
        go: 'go build',
        rust: 'cargo build --release',
        custom: ''
      };
      setValue('buildCommand', buildCommands[watchedFramework]);
    }
  }, [watchedFramework, setValue, watchedValues.buildCommand]);

  // Set default output directories based on framework
  useEffect(() => {
    if (watchedFramework && !watchedValues.outputDirectory) {
      const outputDirs: Record<string, string> = {
        react: 'build',
        vue: 'dist',
        angular: 'dist',
        node: '',
        python: '',
        java: 'build/libs',
        dotnet: 'bin/Release/net6.0',
        php: '',
        go: '',
        rust: 'target/release',
        custom: ''
      };
      setValue('outputDirectory', outputDirs[watchedFramework]);
    }
  }, [watchedFramework, setValue, watchedValues.outputDirectory]);

  const validateRepository = async (url: string) => {
    if (!url) return;
    
    setIsValidatingRepo(true);
    try {
      // This would typically call your backend to validate the repository
      // For now, we'll simulate a validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate repository info
      setRepositoryInfo({
        name: url.split('/').pop()?.replace('.git', '') || 'Repository',
        description: 'A sample repository',
        defaultBranch: 'main',
        isPrivate: false,
        lastCommit: new Date().toISOString()
      });
      
      toast.success('Repository validated successfully!');
    } catch {
      toast.error('Failed to validate repository. Please check the URL.');
    } finally {
      setIsValidatingRepo(false);
    }
  };

  const addEnvironmentVariable = () => {
    append({
      key: '',
      value: '',
      isSecret: false,
      environment: 'production'
    });
  };

  const toggleSecretVisibility = (index: number) => {
    setShowSecrets(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const onSubmit = async (data: ProjectFormData) => {
    if (!currentUser) {
      toast.error('You must be logged in to create a project');
      return;
    }

    setIsLoading(true);

    try {
      // Create deployment config
      const deploymentConfig: DeploymentConfig = {
        platform: data.platform,
        region: data.region,
        domain: data.domain,
        sslEnabled: data.sslEnabled,
        autoScaling: data.autoScaling,
        minInstances: data.minInstances,
        maxInstances: data.maxInstances,
        environment: data.environment
      };

      // Create project object
      const projectData: Omit<Project, 'id'> = {
        userId: currentUser.uid,
        name: data.name,
        description: data.description,
        repositoryUrl: data.repositoryUrl,
        repositoryType: data.repositoryType,
        branch: data.branch,
        framework: data.framework,
        buildCommand: data.buildCommand,
        outputDirectory: data.outputDirectory,
        environmentVariables: data.environmentVariables || [],
        deploymentConfig,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active'
      };

      // Save to Firestore
      const projectsRef = collection(db, 'projects');
      const projectDoc = await addDoc(projectsRef, projectData);

      toast.success('Project created successfully!');
      
      if (onComplete) {
        onComplete(projectDoc.id);
      }
    } catch {
      toast.error('Failed to create project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step <= currentStep 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-600'
          }`}>
            {step}
          </div>
          {step < 4 && (
            <div className={`w-16 h-0.5 mx-2 ${
              step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Information</h3>
        <p className="text-gray-600">Basic details about your project</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register('name', { required: 'Project name is required' })}
            type="text"
            placeholder="My Awesome App"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Repository Type
          </label>
          <select
            {...register('repositoryType')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="github">GitHub</option>
            <option value="gitlab">GitLab</option>
            <option value="bitbucket">Bitbucket</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Repository URL <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <input
            {...register('repositoryUrl', { 
              required: 'Repository URL is required',
              pattern: {
                value: /^https?:\/\/.+/,
                message: 'Please enter a valid URL'
              }
            })}
            type="url"
            placeholder="https://github.com/username/repository"
            className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.repositoryUrl ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          <button
            type="button"
            onClick={() => validateRepository(watchedValues.repositoryUrl)}
            disabled={!watchedValues.repositoryUrl || isValidatingRepo}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isValidatingRepo ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Validate'
            )}
          </button>
        </div>
        {errors.repositoryUrl && (
          <p className="text-sm text-red-600 mt-1">{errors.repositoryUrl.message}</p>
        )}
      </div>

      {repositoryInfo && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800">Repository Validated</span>
          </div>
          <p className="text-sm text-green-700">{repositoryInfo.name}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Branch
          </label>
          <input
            {...register('branch')}
            type="text"
            placeholder="main"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Framework
          </label>
          <select
            {...register('framework')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="react">React</option>
            <option value="vue">Vue.js</option>
            <option value="angular">Angular</option>
            <option value="node">Node.js</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="dotnet">.NET</option>
            <option value="php">PHP</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          {...register('description')}
          rows={3}
          placeholder="Describe your project..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Build Configuration</h3>
        <p className="text-gray-600">Configure how your project should be built</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Build Command
          </label>
          <input
            {...register('buildCommand')}
            type="text"
            placeholder="npm run build"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Output Directory
          </label>
          <input
            {...register('outputDirectory')}
            type="text"
            placeholder="build"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-medium text-gray-900">Environment Variables</h4>
          <button
            type="button"
            onClick={addEnvironmentVariable}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Variable
          </button>
        </div>

        {fields.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <Database className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No environment variables configured</p>
            <p className="text-sm text-gray-400">Add variables that your application needs</p>
          </div>
        ) : (
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                <input
                  {...register(`environmentVariables.${index}.key`)}
                  placeholder="Variable name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="relative flex-1">
                  <input
                    {...register(`environmentVariables.${index}.value`)}
                    type={showSecrets[index] ? 'text' : 'password'}
                    placeholder="Variable value"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecretVisibility(index)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showSecrets[index] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <select
                  {...register(`environmentVariables.${index}.environment`)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="production">Production</option>
                  <option value="staging">Staging</option>
                  <option value="development">Development</option>
                </select>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Deployment Platform</h3>
        <p className="text-gray-600">Choose where to deploy your application</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { value: 'aws', label: 'AWS', color: 'bg-orange-500' },
          { value: 'gcp', label: 'Google Cloud', color: 'bg-blue-500' },
          { value: 'azure', label: 'Azure', color: 'bg-blue-600' },
          { value: 'vercel', label: 'Vercel', color: 'bg-black' },
          { value: 'netlify', label: 'Netlify', color: 'bg-green-500' },
          { value: 'heroku', label: 'Heroku', color: 'bg-purple-500' },
          { value: 'docker', label: 'Docker', color: 'bg-blue-600' },
          { value: 'kubernetes', label: 'Kubernetes', color: 'bg-blue-700' }
        ].map((platform) => (
          <button
            key={platform.value}
            type="button"
            onClick={() => setValue('platform', platform.value as 'aws' | 'gcp' | 'azure' | 'vercel' | 'netlify' | 'heroku' | 'docker' | 'kubernetes')}
            className={`p-4 border-2 rounded-lg text-center transition-colors ${
              watchedPlatform === platform.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`w-8 h-8 ${platform.color} rounded-lg mx-auto mb-2 flex items-center justify-center`}>
              <span className="text-white font-bold text-sm">{platform.label[0]}</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{platform.label}</span>
          </button>
        ))}
      </div>

      {['aws', 'gcp', 'azure'].includes(watchedPlatform) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Region
            </label>
            <select
              {...register('region')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="us-east-1">US East (N. Virginia)</option>
              <option value="us-west-2">US West (Oregon)</option>
              <option value="eu-west-1">Europe (Ireland)</option>
              <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Domain (Optional)
            </label>
            <input
              {...register('domain')}
              type="text"
              placeholder="app.yourdomain.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">SSL Certificate</h4>
            <p className="text-sm text-gray-500">Automatically provision SSL certificate</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              {...register('sslEnabled')}
              type="checkbox"
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Auto Scaling</h4>
            <p className="text-sm text-gray-500">Automatically scale based on traffic</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              {...register('autoScaling')}
              type="checkbox"
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {watchedValues.autoScaling && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Instances
              </label>
              <input
                {...register('minInstances', { min: 1, max: 10 })}
                type="number"
                min="1"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Instances
              </label>
              <input
                {...register('maxInstances', { min: 1, max: 20 })}
                type="number"
                min="1"
                max="20"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Review & Deploy</h3>
        <p className="text-gray-600">Review your configuration before creating the project</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Project Details</h4>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Name:</span> {watchedValues.name}</div>
              <div><span className="font-medium">Repository:</span> {watchedValues.repositoryUrl}</div>
              <div><span className="font-medium">Branch:</span> {watchedValues.branch}</div>
              <div><span className="font-medium">Framework:</span> {watchedValues.framework}</div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Deployment</h4>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Platform:</span> {watchedValues.platform}</div>
              <div><span className="font-medium">Region:</span> {watchedValues.region}</div>
              <div><span className="font-medium">SSL:</span> {watchedValues.sslEnabled ? 'Enabled' : 'Disabled'}</div>
              <div><span className="font-medium">Auto Scaling:</span> {watchedValues.autoScaling ? 'Enabled' : 'Disabled'}</div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">Build Configuration</h4>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">Build Command:</span> {watchedValues.buildCommand}</div>
            <div><span className="font-medium">Output Directory:</span> {watchedValues.outputDirectory}</div>
            <div><span className="font-medium">Environment Variables:</span> {watchedValues.environmentVariables?.length || 0} configured</div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">What happens next?</h4>
            <ul className="text-sm text-blue-700 mt-1 space-y-1">
              <li>• Your project will be created and configured</li>
              <li>• CI/CD pipeline will be set up automatically</li>
              <li>• First deployment will be triggered</li>
              <li>• You'll receive deployment status updates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return renderStep1();
    }
  };

  return (
    <div className={`${isModal ? '' : 'max-w-4xl mx-auto p-6'} bg-white rounded-xl shadow-lg`}>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Logo size="md" showText={false} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
            <p className="text-gray-600">Set up your project for automated deployment</p>
          </div>
        </div>

        {renderStepIndicator()}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {renderCurrentStep()}

        <div className="flex justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <div className="flex gap-4">
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Project...
                  </>
                ) : (
                  <>
                    <Logo size="sm" showText={false} className="text-white" />
                    Create & Deploy
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProjectCreator; 