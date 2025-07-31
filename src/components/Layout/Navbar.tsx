import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../Logo';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings,
  Shield,
  BarChart3,
  FileText,
  MessageCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import ProfilePicture from '../Profile/ProfilePicture';

const Navbar: React.FC = React.memo(() => {
  const { currentUser, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [activeTab, setActiveTab] = useState('General');
  const [chatMessages, setChatMessages] = useState<Array<{id: string, text: string, isUser: boolean}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await logout();
      toast.success('Signed out successfully');
    } catch {
      toast.error('Failed to sign out');
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: chatInput,
      isUser: true
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);

    // Simulate AI response based on active tab
    setTimeout(() => {
      const responses = {
        'General': [
          'I can help you with DevOps best practices, CI/CD concepts, and troubleshooting common issues.',
          'For DevOps best practices, focus on automation, monitoring, and collaboration between teams.',
          'Common DevOps tools include Git, Docker, Jenkins, Kubernetes, and Terraform.'
        ],
        'Docker': [
          'Docker helps you containerize applications for consistent deployment across environments.',
          'Here\'s a basic Dockerfile for a Node.js app:\n\n```dockerfile\nFROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nEXPOSE 3000\nCMD ["npm", "start"]\n```',
          'Use multi-stage builds to reduce Docker image size and improve security.'
        ],
        'Jenkins': [
          'Jenkins is a popular CI/CD tool for automating build, test, and deployment processes.',
          'Here\'s a basic Jenkins pipeline:\n\n```groovy\npipeline {\n  agent any\n  stages {\n    stage(\'Build\') {\n      steps {\n        echo \'Building...\'\n      }\n    }\n    stage(\'Test\') {\n      steps {\n        echo \'Testing...\'\n      }\n    }\n    stage(\'Deploy\') {\n      steps {\n        echo \'Deploying...\'\n      }\n    }\n  }\n}\n```',
          'Jenkins pipelines can be declarative or scripted, with declarative being the recommended approach.'
        ],
        'K8s': [
          'Kubernetes (K8s) is a container orchestration platform for managing containerized applications.',
          'Here\'s a basic Kubernetes deployment:\n\n```yaml\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: my-app\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: my-app\n  template:\n    metadata:\n      labels:\n        app: my-app\n    spec:\n      containers:\n      - name: my-app\n        image: my-app:latest\n        ports:\n        - containerPort: 3000\n```',
          'Kubernetes provides features like auto-scaling, load balancing, and self-healing for your applications.'
        ]
      };

      const tabResponses = responses[activeTab as keyof typeof responses] || responses['General'];
      const randomResponse = tabResponses[Math.floor(Math.random() * tabResponses.length)];

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        isUser: false
      };

      setChatMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: <Logo size="sm" showText={false} className="text-blue-600" /> },
    { name: 'Monitoring', href: '/monitoring', icon: <BarChart3 className="w-4 h-4" /> },
    { name: 'Credentials', href: '/credentials', icon: <Shield className="w-4 h-4" /> },
    { name: 'Logs', href: '/logs', icon: <FileText className="w-4 h-4" /> }
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Logo size="md" showText={false} className="text-blue-600" />
              </div>
              <span className="text-xl font-bold text-gray-900">Opsless</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {currentUser ? (
              <>
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                ))}
                
                {/* Live Chat Button */}
                <button
                  onClick={() => setShowLiveChat(true)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Live Chat</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/about"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  About
                </Link>
                <Link
                  to="/help"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Help
                </Link>
              </>
            )}
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                >
                  <ProfilePicture size="sm" />
                  <span className="hidden md:block text-sm font-medium">
                    {currentUser.displayName || currentUser.email}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                      <p className="font-medium">{currentUser.displayName || 'User'}</p>
                      <p className="text-gray-500">{currentUser.email}</p>
                    </div>
                    <div className="px-4 py-2 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <ProfilePicture size="md" showUploadButton={true} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Profile Picture</p>
                          <p className="text-xs text-gray-500">Click camera icon to upload</p>
                        </div>
                      </div>
                    </div>
                    <Link
                      to="/credentials"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Shield className="w-4 h-4" />
                      <span>Credentials</span>
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-gray-900 focus:outline-none"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              {currentUser ? (
                <>
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                        isActive(item.href)
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </Link>
                  ))}
                  
                  {/* Mobile Live Chat Button */}
                  <button
                    onClick={() => {
                      setShowLiveChat(true);
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Live Chat</span>
                  </button>
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="px-3 py-2 text-sm text-gray-700">
                      <p className="font-medium">{currentUser.displayName || 'User'}</p>
                      <p className="text-gray-500">{currentUser.email}</p>
                    </div>
                    <Link
                      to="/credentials"
                      className="flex items-center space-x-2 px-3 py-2 text-base text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Shield className="w-4 h-4" />
                      <span>Credentials</span>
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center space-x-2 px-3 py-2 text-base text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-base text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/about"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    About
                  </Link>
                  <Link
                    to="/help"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Help
                  </Link>
                  <div className="pt-4 space-y-2">
                    <Link
                      to="/login"
                      className="block text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      className="block bg-blue-600 text-white px-4 py-2 rounded-md text-base font-medium hover:bg-blue-700 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Live Chat Modal */}
      {showLiveChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm">🤖</span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">DevOps Assistant</h2>
              </div>
              <button
                onClick={() => setShowLiveChat(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              {['General', 'Docker', 'Jenkins', 'K8s'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Hi! I'm your DevOps assistant.</h3>
                <p className="text-sm text-gray-600 mb-4">I can help you with:</p>
                <ul className="text-sm text-gray-600 space-y-1 text-left max-w-md mx-auto">
                  <li>• <strong>General Questions:</strong> DevOps concepts, best practices, troubleshooting</li>
                  <li>• <strong>Docker:</strong> Containerization, Dockerfiles, optimization</li>
                  <li>• <strong>Jenkins:</strong> CI/CD pipelines, automation, deployment</li>
                  <li>• <strong>Kubernetes:</strong> Deployment, configuration, cluster management</li>
                </ul>
              </div>

              {/* Chat Messages */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                        message.isUser
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 px-3 py-2 rounded-lg text-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about DevOps..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
});

export default Navbar;