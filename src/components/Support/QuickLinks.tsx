import React from 'react';
import { 
  MessageCircle, 
  Mail, 
  Bug, 
  ExternalLink, 
  HelpCircle,
  AlertTriangle,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

const QuickLinks: React.FC = () => {
  const handleDiscordClick = () => {
    window.open('https://discord.gg/zAHQqQJH', '_blank');
    toast.success('Opening Discord community...');
  };

  const handleEmailClick = () => {
    const subject = encodeURIComponent('Opsless Support Request');
    const body = encodeURIComponent(`Hi Raj,\n\nI need help with Opsless.\n\nIssue Description:\n\n\nUser ID: ${localStorage.getItem('userId') || 'Not logged in'}\nBrowser: ${navigator.userAgent}\nTimestamp: ${new Date().toISOString()}`);
    
    window.open(`mailto:opslessraj@gmail.com?subject=${subject}&body=${body}`, '_blank');
    toast.success('Opening email client...');
  };

  const handleBugReport = () => {
    window.open('https://docs.google.com/forms/d/e/1FAIpQLSdKhPptsKR5jXlM8fiFD3IKqNoOJhVw4y0m1ROk_9yvdgZbFg/viewform?usp=dialog', '_blank');
    toast.success('Opening bug report form...');
  };

  const handleFeatureRequest = () => {
    const subject = encodeURIComponent('Feature Request - Opsless Platform');
    const body = encodeURIComponent(`Feature Request for Opsless Platform

Feature Description:
[Please describe the feature you'd like to see]

Use Case:
[How would this feature help you?]

Priority:
[High/Medium/Low]

Additional Information:
- User ID: ${localStorage.getItem('userId') || 'Not logged in'}
- Browser: ${navigator.userAgent}
- Timestamp: ${new Date().toISOString()}`);
    
    window.open(`mailto:opslessraj@gmail.com?subject=${subject}&body=${body}`, '_blank');
    toast.success('Opening feature request email...');
  };

  const handleSystemStatus = () => {
    // For now, show a static status page
    toast.success('System Status: All services operational');
  };

  const handleServiceUpdates = () => {
    // For now, show a static updates page
    toast.success('Service Updates: Latest features and improvements');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
      <div className="flex items-center mb-6">
        <HelpCircle className="w-6 h-6 text-blue-600 mr-3" />
        <h2 className="text-xl font-bold text-gray-900">Quick Links</h2>
      </div>

      <div className="space-y-4">
        {/* System Status */}
        <button
          onClick={handleSystemStatus}
          className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 group"
        >
          <div className="flex items-center">
            <Activity className="w-5 h-5 text-green-600 mr-3" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">System Status</div>
              <div className="text-sm text-gray-600">Check service status</div>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
        </button>

        {/* Service Updates */}
        <button
          onClick={handleServiceUpdates}
          className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 group"
        >
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-blue-600 mr-3" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">Service Updates</div>
              <div className="text-sm text-gray-600">Latest updates</div>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
        </button>

        {/* Discord Community */}
        <button
          onClick={handleDiscordClick}
          className="w-full flex items-center justify-between p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors duration-200 group"
        >
          <div className="flex items-center">
            <MessageCircle className="w-5 h-5 text-indigo-600 mr-3" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">Community Forum</div>
              <div className="text-sm text-gray-600">Join our Discord</div>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
        </button>

        {/* Feature Request */}
        <button
          onClick={handleFeatureRequest}
          className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200 group"
        >
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-purple-600 mr-3" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">Feature Requests</div>
              <div className="text-sm text-gray-600">Suggest new features</div>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
        </button>

        {/* Bug Report */}
        <button
          onClick={handleBugReport}
          className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200 group"
        >
          <div className="flex items-center">
            <Bug className="w-5 h-5 text-red-600 mr-3" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">Bug Reports</div>
              <div className="text-sm text-gray-600">Report issues</div>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
        </button>

        {/* Direct Email Contact */}
        <button
          onClick={handleEmailClick}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 group"
        >
          <div className="flex items-center">
            <Mail className="w-5 h-5 text-gray-600 mr-3" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">Contact Support</div>
              <div className="text-sm text-gray-600">Email us directly</div>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          <div className="font-semibold mb-2">Contact Information:</div>
          <div>📧 Email: opslessraj@gmail.com</div>
          <div>📞 Phone: (+91) 8511734001</div>
          <div>💬 Discord: <a 
            href="https://discord.gg/zAHQqQJH" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Join Community
          </a></div>
        </div>
      </div>
    </div>
  );
};

export default QuickLinks; 