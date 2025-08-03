import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/Logo';
import { 
  Shield, 
  Zap, 
  Globe, 
  BarChart3, 
  GitBranch, 
  CheckCircle, 
  ArrowRight,
  Play,
  Code,
  Lock
} from 'lucide-react';

const Home: React.FC = () => {
  const { currentUser } = useAuth();

  const features = [
    {
      icon: <Logo size="md" showText={false} className="text-blue-600" />,
      title: 'One-Click Deployments',
      description: 'Deploy your applications with a single click. No DevOps expertise required.',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Secure Credentials',
      description: 'Enterprise-grade security for your CI/CD credentials with encryption at rest.',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Lightning Fast',
      description: 'Optimized build pipelines that deploy your code in minutes, not hours.',
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Multi-Cloud Support',
      description: 'Deploy to AWS, GCP, Azure, Vercel, Netlify, and more from one platform.',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Real-time Monitoring',
      description: 'Monitor your deployments, performance, and uptime in real-time.',
      color: 'bg-indigo-100 text-indigo-600'
    },
    {
      icon: <GitBranch className="w-8 h-8" />,
      title: 'Git Integration',
      description: 'Seamless integration with GitHub, GitLab, and Bitbucket repositories.',
      color: 'bg-pink-100 text-pink-600'
    }
  ];

  const platforms = [
    { name: 'AWS', icon: '☁️', color: 'bg-orange-100' },
    { name: 'Google Cloud', icon: '🌐', color: 'bg-blue-100' },
    { name: 'Azure', icon: '🔵', color: 'bg-blue-600' },
    { name: 'Vercel', icon: '▲', color: 'bg-black' },
    { name: 'Netlify', icon: '🌐', color: 'bg-green-100' },
    { name: 'Heroku', icon: '🟣', color: 'bg-purple-100' },
    { name: 'Docker', icon: '🐳', color: 'bg-blue-100' },
    { name: 'Kubernetes', icon: '⚓', color: 'bg-blue-100' }
  ];

  const frameworks = [
    { name: 'React', icon: '⚛️' },
    { name: 'Vue.js', icon: '⚡' },
    { name: 'Angular', icon: '🅰️' },
    { name: 'Node.js', icon: '🟢' },
    { name: 'Python', icon: '🐍' },
    { name: 'Java', icon: '☕' },
    { name: '.NET', icon: '🔷' },
    { name: 'PHP', icon: '🐘' },
    { name: 'Go', icon: '🐹' },
    { name: 'Rust', icon: '🦀' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Logo size="lg" showText={false} className="text-blue-600" />
              </div>
              <h1 className="ml-4 text-5xl font-bold text-gray-900">
                Opsless
              </h1>
            </div>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The professional CI/CD automation platform that makes deployment effortless. 
              Deploy your applications end-to-end with zero DevOps knowledge required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {currentUser ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Play className="w-5 h-5" />
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Logo size="sm" showText={false} className="text-white" />
                    Get Started Free
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-8 py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need for seamless deployments
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From repository to production, Opsless handles the entire deployment pipeline 
              with enterprise-grade security and reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                <div className={`p-3 rounded-lg w-fit mb-4 ${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How Opsless Works
            </h2>
            <p className="text-lg text-gray-600">
              Three simple steps to deploy your application
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Code className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">1. Connect Repository</h3>
              <p className="text-gray-600">
                Connect your GitHub, GitLab, or Bitbucket repository. Opsless will automatically detect your project type.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">2. Configure Credentials</h3>
              <p className="text-gray-600">
                Securely store your cloud provider credentials once. Opsless handles the rest with enterprise security.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Logo size="lg" showText={false} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">3. Deploy</h3>
              <p className="text-gray-600">
                Click deploy and watch your application go live. Automatic SSL, monitoring, and scaling included.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Supported Platforms */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Deploy to Any Platform
            </h2>
            <p className="text-lg text-gray-600">
              Choose from the most popular cloud platforms and deployment targets
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {platforms.map((platform, index) => (
              <div key={index} className="text-center p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="text-3xl mb-2">{platform.icon}</div>
                <h3 className="font-medium text-gray-900">{platform.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Supported Frameworks */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              All Major Frameworks Supported
            </h2>
            <p className="text-lg text-gray-600">
              From frontend frameworks to backend languages, we've got you covered
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {frameworks.map((framework, index) => (
              <div key={index} className="text-center p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">{framework.icon}</div>
                <h3 className="font-medium text-gray-900">{framework.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Enterprise-Grade Security
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Lock className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Encrypted Credentials</h3>
                    <p className="text-gray-600">All credentials are encrypted at rest and in transit</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">SOC 2 Compliant</h3>
                    <p className="text-gray-600">Enterprise security standards and compliance</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Zero Trust Architecture</h3>
                    <p className="text-gray-600">Secure by design with no implicit trust</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg p-8">
              <div className="text-center">
                <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Security is Our Priority</h3>
                <p className="text-gray-600">
                  We understand that your credentials and code are precious. 
                  That's why we've built Opsless with security at its core.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to deploy like a pro?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of developers who trust Opsless for their deployments
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {currentUser ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                <ArrowRight className="w-5 h-5" />
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                >
                  <Logo size="sm" showText={false} className="text-blue-600" />
                  Start Free Trial
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 px-8 py-4 border border-white text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Learn More
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Logo size="sm" showText={false} className="text-blue-400" />
                <span className="ml-2 text-xl font-bold">Opsless</span>
              </div>
              <p className="text-gray-400">
                Professional CI/CD automation for modern development teams.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/help" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/status" className="hover:text-white transition-colors">Status</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Opsless. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;