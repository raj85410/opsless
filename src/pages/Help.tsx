import React, { useState } from 'react';
import { 
  Search, 
  Book, 
  MessageCircle, 
  Mail, 
  Phone,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileText,
  Video,
  Code,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const Help: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const faqs = [
    {
      question: "How do I deploy my first application?",
      answer: "To deploy your first application, navigate to your dashboard and click 'New Project'. Upload your repository, configure your build settings, and click 'Deploy'. Our AI assistant can help generate the necessary configuration files."
    },
    {
      question: "What types of applications can I deploy?",
      answer: "Opsless supports a wide variety of applications including Node.js, Python, Java, Go, PHP, and static sites. We support both containerized and traditional applications with automatic detection of your tech stack."
    },
    {
      question: "How does the AI assistant work?",
      answer: "Our AI assistant powered by Gemini API can help you generate Dockerfiles, Jenkins pipelines, and Kubernetes configurations. Simply describe your requirements in the chat, and it will provide optimized configurations for your specific use case."
    },
    {
      question: "Can I integrate with my existing CI/CD pipeline?",
      answer: "Yes! Opsless provides APIs and webhooks that integrate seamlessly with popular CI/CD tools like GitHub Actions, GitLab CI, and Bitbucket Pipelines. You can also use our Jenkins integration for more complex workflows."
    },
    {
      question: "How do I monitor my deployments?",
      answer: "Opsless provides comprehensive monitoring through our integrated Prometheus and Grafana setup. You can view real-time metrics, logs, and alerts directly from your dashboard. Custom dashboards and alerting rules can be configured based on your needs."
    },
    {
      question: "What security measures are in place?",
      answer: "We implement enterprise-grade security including role-based access control, encrypted data transmission, vulnerability scanning, and compliance monitoring. All deployments run in isolated environments with network policies and security contexts."
    },
    {
      question: "How much does Opsless cost?",
      answer: "Opsless offers flexible pricing plans starting with a free tier for small projects. Our paid plans scale based on usage and include additional features like advanced monitoring, priority support, and enterprise integrations."
    },
    {
      question: "Can I use custom domains?",
      answer: "Yes, you can configure custom domains for your deployments. We support SSL/TLS certificates through Let's Encrypt or you can upload your own certificates. DNS configuration is handled automatically."
    }
  ];

  const resources = [
    {
      title: "Getting Started Guide",
      description: "Complete walkthrough for new users",
      icon: <Book className="h-6 w-6" />,
      type: "Documentation"
    },
    {
      title: "API Reference",
      description: "Comprehensive API documentation",
      icon: <Code className="h-6 w-6" />,
      type: "Documentation"
    },
    {
      title: "Video Tutorials",
      description: "Step-by-step video guides",
      icon: <Video className="h-6 w-6" />,
      type: "Video"
    },
    {
      title: "Best Practices",
      description: "DevOps best practices and tips",
      icon: <FileText className="h-6 w-6" />,
      type: "Guide"
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleContactSupport = () => {
    setShowContactModal(true);
  };

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message) {
      toast.error('Please fill in all fields');
      return;
    }
    
    toast.success('Support request submitted! We\'ll get back to you soon.');
    setShowContactModal(false);
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  const handleResourceClick = (title: string) => {
    toast.success(`${title} would open here`);
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

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredFaqs.map((faq, index) => (
                  <div key={index} className="px-6 py-4">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <h3 className="text-lg font-medium text-gray-900 pr-4">{faq.question}</h3>
                      {expandedFaq === index ? (
                        <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      )}
                    </button>
                    {expandedFaq === index && (
                      <div className="mt-4 text-gray-600">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Resources</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resources.map((resource, index) => (
                    <div 
                      key={index} 
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleResourceClick(resource.title)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-blue-600">{resource.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                            <ExternalLink className="h-4 w-4 text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                          <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {resource.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Support */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Support</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Live Chat</p>
                    <p className="text-sm text-gray-600">Available 24/7</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Email Support</p>
                    <p className="text-sm text-gray-600">support@opsless.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Phone Support</p>
                    <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleContactSupport}
                className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Contact Support
              </button>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
              <div className="space-y-2">
                <a href="#" className="block text-blue-600 hover:text-blue-700 text-sm">
                  System Status
                </a>
                <a href="#" className="block text-blue-600 hover:text-blue-700 text-sm">
                  Service Updates
                </a>
                <a href="#" className="block text-blue-600 hover:text-blue-700 text-sm">
                  Community Forum
                </a>
                <a href="#" className="block text-blue-600 hover:text-blue-700 text-sm">
                  Feature Requests
                </a>
                <a href="#" className="block text-blue-600 hover:text-blue-700 text-sm">
                  Bug Reports
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Contact Support</h3>
              <button 
                onClick={() => setShowContactModal(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmitContact} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of your issue"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your issue in detail..."
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Help;