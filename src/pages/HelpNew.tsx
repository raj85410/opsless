import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  MessageCircle, 
  Mail, 
  Phone,
  ExternalLink,
  FileText,
  Code,
  Zap,
  Shield,
  Cloud,
  Database,
  Server
} from 'lucide-react';
import toast from 'react-hot-toast';
import QuickLinks from '../components/Support/QuickLinks';

const HelpNew: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<typeof helpContent>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showQuickLinks, setShowQuickLinks] = useState(false);

  // Comprehensive help content
  const helpContent = useMemo(() => [
    {
      id: 1,
      title: "How to Start AWS",
      category: "AWS",
      keywords: ["aws", "amazon", "cloud", "start", "begin", "setup"],
      content: "To start with AWS: 1) Create AWS account, 2) Set up IAM user, 3) Configure credentials, 4) Choose region, 5) Launch first service",
      icon: <Cloud className="h-5 w-5" />
    },
    {
      id: 2,
      title: "Docker Setup Guide",
      category: "Docker",
      keywords: ["docker", "container", "setup", "install", "configure"],
      content: "Install Docker Desktop, create Dockerfile, build image with 'docker build -t myapp .', run with 'docker run -p 3000:3000 myapp'",
      icon: <Server className="h-5 w-5" />
    },
    {
      id: 3,
      title: "Kubernetes Deployment",
      category: "Kubernetes",
      keywords: ["kubernetes", "k8s", "deploy", "pod", "service"],
      content: "Create deployment YAML, apply with 'kubectl apply -f deployment.yaml', check status with 'kubectl get pods'",
      icon: <Zap className="h-5 w-5" />
    },
    {
      id: 4,
      title: "Jenkins Pipeline",
      category: "CI/CD",
      keywords: ["jenkins", "pipeline", "ci", "cd", "automation"],
      content: "Create Jenkinsfile with stages: checkout, build, test, deploy. Use declarative pipeline syntax for better readability.",
      icon: <Code className="h-5 w-5" />
    },
    {
      id: 5,
      title: "Database Setup",
      category: "Database",
      keywords: ["database", "mysql", "postgres", "mongodb", "setup"],
      content: "Choose database type, install, configure connection, create tables, set up backup strategy",
      icon: <Database className="h-5 w-5" />
    },
    {
      id: 6,
      title: "Security Best Practices",
      category: "Security",
      keywords: ["security", "ssl", "https", "firewall", "encryption"],
      content: "Use HTTPS, implement authentication, encrypt data, regular security updates, monitor access logs",
      icon: <Shield className="h-5 w-5" />
    }
  ], []);

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim()) {
      setIsSearching(true);
      const results = helpContent.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setSearchResults(results);
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, helpContent]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      toast.success(`Found ${searchResults.length} results for "${searchTerm}"`);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'discord':
        window.open('https://discord.com/channels/1401307658253893654/1401307658908340225', '_blank');
        toast.success('Opening Discord community...');
        break;
      case 'email':
        window.open('mailto:opslessraj@gmail.com?subject=Help Request', '_blank');
        toast.success('Opening email client...');
        break;
      case 'bug':
        window.open('mailto:opslessraj@gmail.com?subject=Bug Report', '_blank');
        toast.success('Opening bug report email...');
        break;
      default:
        toast('Action triggered: ' + action);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions, browse our documentation, or get in touch with our support team.
          </p>
        </div>

        {/* Working Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search for help... (e.g., 'How to Start AWS')"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </form>
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-4 bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">
                  {isSearching ? 'Searching...' : `Found ${searchResults.length} results`}
                </h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {searchResults.map((result) => (
                  <div key={result.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                    <div className="flex items-start space-x-3">
                      <div className="text-blue-600 mt-1">{result.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{result.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{result.content}</p>
                        <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {result.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => handleQuickAction('discord')}
                  className="flex items-center space-x-3 p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                >
                  <MessageCircle className="h-6 w-6 text-indigo-600" />
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">Join Discord</div>
                    <div className="text-sm text-gray-600">Get instant help</div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleQuickAction('email')}
                  className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Mail className="h-6 w-6 text-blue-600" />
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">Email Support</div>
                    <div className="text-sm text-gray-600">opslessraj@gmail.com</div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleQuickAction('bug')}
                  className="flex items-center space-x-3 p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <FileText className="h-6 w-6 text-red-600" />
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">Report Bug</div>
                    <div className="text-sm text-gray-600">Found an issue?</div>
                  </div>
                </button>
                
                <button
                  onClick={() => setShowQuickLinks(!showQuickLinks)}
                  className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <ExternalLink className="h-6 w-6 text-green-600" />
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">Quick Links</div>
                    <div className="text-sm text-gray-600">All support options</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Popular Topics */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Topics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {helpContent.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-3">
                      <div className="text-blue-600">{item.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{item.content}</p>
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Links */}
            {showQuickLinks && (
              <div className="bg-white rounded-lg shadow-lg">
                <QuickLinks />
              </div>
            )}

            {/* Contact Support */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Support</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Discord Community</p>
                    <p className="text-sm text-gray-600">24/7 live support</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Email Support</p>
                    <p className="text-sm text-gray-600">opslessraj@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Phone Support</p>
                    <p className="text-sm text-gray-600">(+91) 8511734001</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpNew; 