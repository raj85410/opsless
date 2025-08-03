import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search,
  MessageCircle, 
  Mail, 
  Phone,
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
  const [searchParams] = useSearchParams();
  const [searchResults, setSearchResults] = useState<typeof helpContent>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Get search term from URL parameters
  const searchTerm = searchParams.get('search') || '';


  // Comprehensive help content with expanded articles
  const helpContent = useMemo(() => [
    {
      id: 1,
      title: "Getting Started with Opsless",
      category: "Getting Started",
      keywords: ["start", "begin", "first", "setup", "guide", "tutorial", "how to use", "get started", "beginner", "new user"],
      content: "Welcome to Opsless! Start by creating your first project, setting up credentials, and deploying your application. Our step-by-step guide will walk you through the entire process.",
      icon: <Cloud className="h-5 w-5" />
    },
    {
      id: 2,
      title: "How to Use Opsless Platform",
      category: "Platform Guide",
      keywords: ["use", "platform", "how to", "guide", "tutorial", "usage", "features", "dashboard", "interface"],
      content: "Learn how to navigate the Opsless platform, use the dashboard, manage projects, and access all features. Complete guide to using our DevOps automation platform.",
      icon: <Server className="h-5 w-5" />
    },
    {
      id: 3,
      title: "AWS Setup and Configuration",
      category: "AWS",
      keywords: ["aws", "amazon", "cloud", "start", "begin", "setup", "configure", "credentials", "iam", "region"],
      content: "Complete AWS setup guide: Create AWS account, set up IAM user, configure credentials, choose region, and launch your first service with Opsless.",
      icon: <Cloud className="h-5 w-5" />
    },
    {
      id: 4,
      title: "Docker Setup and Containerization",
      category: "Docker",
      keywords: ["docker", "container", "setup", "install", "configure", "dockerfile", "build", "run", "containerization"],
      content: "Install Docker Desktop, create Dockerfile, build images with 'docker build -t myapp .', run containers with 'docker run -p 3000:3000 myapp'",
      icon: <Server className="h-5 w-5" />
    },
    {
      id: 5,
      title: "Kubernetes Deployment Guide",
      category: "Kubernetes",
      keywords: ["kubernetes", "k8s", "deploy", "pod", "service", "cluster", "yaml", "kubectl", "orchestration"],
      content: "Create deployment YAML files, apply with 'kubectl apply -f deployment.yaml', check status with 'kubectl get pods', manage your containerized applications.",
      icon: <Zap className="h-5 w-5" />
    },
    {
      id: 6,
      title: "Jenkins CI/CD Pipeline Setup",
      category: "CI/CD",
      keywords: ["jenkins", "pipeline", "ci", "cd", "automation", "build", "test", "deploy", "continuous integration"],
      content: "Create Jenkinsfile with stages: checkout, build, test, deploy. Use declarative pipeline syntax for better readability and maintainability.",
      icon: <Code className="h-5 w-5" />
    },
    {
      id: 7,
      title: "Database Setup and Configuration",
      category: "Database",
      keywords: ["database", "mysql", "postgres", "mongodb", "setup", "configure", "connection", "tables", "backup"],
      content: "Choose database type, install, configure connection, create tables, set up backup strategy, and integrate with your applications.",
      icon: <Database className="h-5 w-5" />
    },
    {
      id: 8,
      title: "Security Best Practices",
      category: "Security",
      keywords: ["security", "ssl", "https", "firewall", "encryption", "authentication", "vulnerability", "compliance"],
      content: "Implement HTTPS, set up authentication, encrypt data, perform regular security updates, monitor access logs, and maintain compliance.",
      icon: <Shield className="h-5 w-5" />
    },
    {
      id: 9,
      title: "Billing and Subscription Management",
      category: "Billing",
      keywords: ["billing", "payment", "subscription", "plan", "pricing", "invoice", "cost", "payment method", "upgrade", "downgrade"],
      content: "Manage your billing, update payment methods, view invoices, upgrade or downgrade plans, and understand pricing structure.",
      icon: <FileText className="h-5 w-5" />
    },
    {
      id: 10,
      title: "Troubleshooting Common Issues",
      category: "Troubleshooting",
      keywords: ["troubleshoot", "error", "issue", "problem", "fix", "debug", "support", "help", "common", "solution"],
      content: "Find solutions to common issues, debug problems, get error explanations, and learn how to resolve deployment and configuration issues.",
      icon: <Shield className="h-5 w-5" />
    },
    {
      id: 11,
      title: "API Documentation and Integration",
      category: "API",
      keywords: ["api", "documentation", "integration", "rest", "webhook", "endpoint", "authentication", "sdk"],
      content: "Access API documentation, learn about endpoints, authentication methods, webhooks, and integrate Opsless with your existing tools.",
      icon: <Code className="h-5 w-5" />
    },
    {
      id: 12,
      title: "Monitoring and Logs",
      category: "Monitoring",
      keywords: ["monitor", "logs", "metrics", "alert", "dashboard", "performance", "uptime", "health", "tracking"],
      content: "Set up monitoring, view logs, configure alerts, track performance metrics, monitor uptime, and maintain application health.",
      icon: <Zap className="h-5 w-5" />
    }
  ], []);

  // Intelligent search with synonyms and better matching
  const searchSynonyms: Record<string, string[]> = useMemo(() => ({
    'use': ['start', 'begin', 'guide', 'setup', 'tutorial', 'how to', 'get started'],
    'start': ['begin', 'setup', 'guide', 'tutorial', 'how to', 'get started', 'use'],
    'begin': ['start', 'setup', 'guide', 'tutorial', 'how to', 'get started', 'use'],
    'guide': ['tutorial', 'help', 'manual', 'instructions', 'how to'],
    'tutorial': ['guide', 'help', 'manual', 'instructions', 'how to'],
    'help': ['support', 'assist', 'guide', 'tutorial', 'manual'],
    'billing': ['payment', 'subscription', 'plan', 'pricing', 'invoice', 'cost'],
    'payment': ['billing', 'subscription', 'plan', 'pricing', 'invoice', 'cost'],
    'error': ['issue', 'problem', 'bug', 'troubleshoot', 'fix', 'debug'],
    'problem': ['error', 'issue', 'bug', 'troubleshoot', 'fix', 'debug'],
    'setup': ['configure', 'install', 'setup', 'initialize', 'prepare'],
    'configure': ['setup', 'install', 'initialize', 'prepare', 'settings'],
    'deploy': ['deployment', 'publish', 'release', 'launch', 'push'],
    'monitor': ['tracking', 'watch', 'observe', 'check', 'surveillance'],
    'logs': ['logging', 'records', 'history', 'trail', 'audit'],
    'api': ['interface', 'endpoint', 'rest', 'webhook', 'integration'],
    'security': ['protection', 'safety', 'secure', 'authentication', 'encryption'],
    'database': ['db', 'storage', 'data', 'sql', 'nosql'],
    'docker': ['container', 'containerization', 'image', 'build'],
    'kubernetes': ['k8s', 'orchestration', 'cluster', 'pod', 'service'],
    'jenkins': ['ci', 'cd', 'pipeline', 'automation', 'build']
  }), []);

  const intelligentSearch = useCallback((query: string, content: typeof helpContent) => {
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    const expandedTerms = new Set<string>();

    // Expand search terms with synonyms
    searchTerms.forEach(term => {
      expandedTerms.add(term);
      if (searchSynonyms[term]) {
        searchSynonyms[term].forEach((synonym: string) => expandedTerms.add(synonym));
      }
    });

    return content.filter(item => {
      const searchableText = `${item.title} ${item.content} ${item.keywords.join(' ')}`.toLowerCase();
      const category = item.category.toLowerCase();
      
      // Check for exact matches first (highest priority)
      if (item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.content.toLowerCase().includes(query.toLowerCase())) {
        return true;
      }

      // Check for keyword matches
      if (item.keywords.some(keyword => keyword.toLowerCase().includes(query.toLowerCase()))) {
        return true;
      }

      // Check for synonym matches
      for (const term of expandedTerms) {
        if (searchableText.includes(term) || category.includes(term)) {
          return true;
        }
      }

      // Check for partial word matches
      for (const term of searchTerms) {
        if (term.length > 2 && searchableText.includes(term)) {
          return true;
        }
      }

      return false;
    });
  }, [searchSynonyms]);

  // Search functionality with intelligent matching
  useEffect(() => {
    if (searchTerm.trim()) {
      setIsSearching(true);
      
      // Use intelligent search
      const results = intelligentSearch(searchTerm, helpContent);
      
      setSearchResults(results);
      setIsSearching(false);
      
      // Show appropriate toast message
      if (results.length > 0) {
        toast.success(`Found ${results.length} helpful results for "${searchTerm}"`);
      } else {
        toast.error(`No exact matches found for "${searchTerm}". Try different keywords or visit our Getting Started Guide.`);
      }
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, helpContent, intelligentSearch]);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'discord':
        window.open('https://discord.gg/zAHQqQJH', '_blank');
        toast.success('Opening Discord community...');
        break;
      case 'email':
        window.open('mailto:opslessraj@gmail.com?subject=Help Request', '_blank');
        toast.success('Opening email client...');
        break;
      case 'phone':
        window.open('tel:+9185111734001', '_blank');
        toast.success('Opening phone dialer...');
        break;
      case 'bug':
        window.open('https://docs.google.com/forms/d/e/1FAIpQLSdKhPptsKR5jXlM8fiFD3IKqNoOJhVw4y0m1ROk_9yvdgZbFg/viewform?usp=dialog', '_blank');
        toast.success('Opening bug report form...');
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

        {/* Search Results */}
        {searchTerm && (
          <div className="max-w-2xl mx-auto mb-12">
            {searchResults.length > 0 ? (
              <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">
                    {isSearching ? 'Searching...' : `Found ${searchResults.length} helpful results for "${searchTerm}"`}
                  </h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {searchResults.map((result) => (
                    <div key={result.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
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
            ) : (
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Sorry, I couldn't find that
                </h3>
                <p className="text-gray-600 mb-4">
                  No results found for "{searchTerm}". Try searching with different words or visit our Getting Started Guide.
                </p>
                <div className="space-y-3">
                  <p className="text-sm text-gray-500">Try searching for:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['getting started', 'how to use', 'billing', 'troubleshoot', 'setup'].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => window.location.href = `/help?search=${encodeURIComponent(suggestion)}`}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                  <div className="pt-4">
                    <button
                      onClick={() => window.location.href = '/help'}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Browse All Help Articles
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

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
                  onClick={() => handleQuickAction('phone')}
                  className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <Phone className="h-6 w-6 text-green-600" />
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">Phone Support</div>
                    <div className="text-sm text-gray-600">(+91) 8511734001</div>
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
            <div className="bg-white rounded-lg shadow-lg">
              <QuickLinks />
            </div>

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