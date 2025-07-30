import React, { useState } from 'react';
import { 
  Zap, 
  Shield, 
  Globe, 
  Code, 
  Server,
  GitBranch,
  Monitor,
  X,
  ExternalLink
} from 'lucide-react';

const About: React.FC = () => {
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);

  const features = [
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Lightning Fast Deployments",
      description: "Deploy your applications in seconds with our optimized CI/CD pipeline powered by Jenkins and Kubernetes."
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Enterprise Security",
      description: "Built-in security scanning, role-based access control, and compliance monitoring for enterprise-grade protection."
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Global Scale",
      description: "Deploy to multiple regions and environments with automatic scaling and load balancing capabilities."
    },
    {
      icon: <Code className="h-8 w-8" />,
      title: "AI-Powered Assistance",
      description: "Get intelligent help with Dockerfile generation, Jenkins pipelines, and Kubernetes configurations."
    },
    {
      icon: <Monitor className="h-8 w-8" />,
      title: "Real-time Monitoring",
      description: "Comprehensive monitoring and logging with Prometheus and Grafana integration for full observability."
    },
    {
      icon: <GitBranch className="h-8 w-8" />,
      title: "Git Integration",
      description: "Seamless integration with popular Git providers for automated builds and deployments."
    }
  ];

  const stats = [
    { label: "Deployments per day", value: "10,000+" },
    { label: "Active users", value: "5,000+" },
    { label: "Uptime", value: "99.9%" },
    { label: "Countries served", value: "50+" }
  ];

  const handleStartTrial = () => {
    setShowTrialModal(true);
  };

  const handleViewDocumentation = () => {
    setShowDocModal(true);
  };

  const handleCloseModal = () => {
    setShowTrialModal(false);
    setShowDocModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            {/* Logo Section */}
            <div className="mb-12 flex justify-center">
              <div className="bg-white rounded-xl p-8 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center space-x-6">
                  {/* Logo Placeholder */}
                  <div className="relative">
                    <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center shadow-lg">
                      {/* New Opsless Robot Logo */}
                      <div className="relative w-16 h-16">
                        {/* Robot Head */}
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center relative">
                          {/* Eye */}
                          <div className="w-6 h-2 bg-black rounded-full"></div>
                          {/* Antenna */}
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        {/* Arms and Gear */}
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                            <div className="w-4 h-4 bg-black rounded-full"></div>
                          </div>
                        </div>
                        {/* Wings */}
                        <div className="absolute top-2 -left-2 w-4 h-6 bg-white rounded-full transform -rotate-12"></div>
                        <div className="absolute top-2 -right-2 w-4 h-6 bg-white rounded-full transform rotate-12"></div>
                        {/* Shield/Base */}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-white rounded-b-full"></div>
                      </div>
                    </div>
                  </div>
                  {/* Text */}
                  <div className="text-left">
                    <h1 className="text-6xl font-bold text-gray-900 mb-2">Opsless</h1>
                    <p className="text-lg text-gray-600 font-medium">DevOps Automation Platform</p>
                    <p className="text-sm text-gray-500 mt-1">Zero Ops, Maximum Impact</p>
                  </div>
                </div>
              </div>
            </div>
            
            <h1 className="text-5xl font-bold mb-6">
              About Opsless
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              The next-generation DevOps platform that simplifies deployment, monitoring, 
              and scaling of modern applications with AI-powered automation.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We believe that deploying and managing applications should be simple, secure, and scalable. 
            Opsless eliminates the complexity of traditional DevOps workflows while maintaining the power 
            and flexibility that modern development teams need.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Why Choose Opsless?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Technology Stack */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Built with Modern Technology
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <Server className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900">Kubernetes</h3>
              <p className="text-sm text-gray-600">Container orchestration</p>
            </div>
            <div className="text-center">
              <GitBranch className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900">Jenkins</h3>
              <p className="text-sm text-gray-600">CI/CD automation</p>
            </div>
            <div className="text-center">
              <Code className="h-12 w-12 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900">Docker</h3>
              <p className="text-sm text-gray-600">Containerization</p>
            </div>
            <div className="text-center">
              <Monitor className="h-12 w-12 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900">Prometheus</h3>
              <p className="text-sm text-gray-600">Monitoring & alerts</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of developers who trust Opsless for their deployment needs.
          </p>
          <div className="space-x-4">
            <button 
              onClick={handleStartTrial}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Start Free Trial
            </button>
            <button 
              onClick={handleViewDocumentation}
              className="border border-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold"
            >
              View Documentation
            </button>
          </div>
        </div>
      </div>

      {/* Trial Modal */}
      {showTrialModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Start Free Trial</h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input 
                  type="email" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your company name"
                />
              </div>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                Start 14-Day Free Trial
              </button>
              <p className="text-sm text-gray-600 text-center">
                No credit card required • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Documentation Modal */}
      {showDocModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Documentation</h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Getting Started</h4>
                <p className="text-gray-600 mb-3">Learn how to set up your first project with Opsless.</p>
                <a href="#" className="text-blue-600 hover:text-blue-800 flex items-center">
                  Read Guide <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </div>
              <div className="border-b border-gray-200 pb-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">API Reference</h4>
                <p className="text-gray-600 mb-3">Complete API documentation for developers.</p>
                <a href="#" className="text-blue-600 hover:text-blue-800 flex items-center">
                  View API Docs <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </div>
              <div className="border-b border-gray-200 pb-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Tutorials</h4>
                <p className="text-gray-600 mb-3">Step-by-step tutorials for common use cases.</p>
                <a href="#" className="text-blue-600 hover:text-blue-800 flex items-center">
                  Browse Tutorials <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Community</h4>
                <p className="text-gray-600 mb-3">Join our community for support and discussions.</p>
                <a href="#" className="text-blue-600 hover:text-blue-800 flex items-center">
                  Join Community <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default About;