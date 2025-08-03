import React from 'react';
import { 
  MessageCircle, 
  Mail, 
  Bug, 
  ExternalLink, 
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

const QuickLinks: React.FC = () => {
  const handleDiscordClick = () => {
    window.open('https://discord.com/channels/1401307658253893654/1401307658908340225', '_blank');
    toast.success('Opening Discord community...');
  };

  const handleEmailClick = () => {
    const subject = encodeURIComponent('Opsless Support Request');
    const body = encodeURIComponent(`Hi Raj,\n\nI need help with Opsless.\n\nIssue Description:\n\n\nUser ID: ${localStorage.getItem('userId') || 'Not logged in'}\nBrowser: ${navigator.userAgent}\nTimestamp: ${new Date().toISOString()}`);
    
    window.open(`mailto:opslessraj@gmail.com?subject=${subject}&body=${body}`, '_blank');
    toast.success('Opening email client...');
  };

  const handleBugReport = () => {
    const subject = encodeURIComponent('Bug Report - Opsless Platform');
    const body = encodeURIComponent(`Bug Report for Opsless Platform

Bug Description:
[Please describe the bug you encountered]

Steps to Reproduce:
1. 
2. 
3. 

Expected Behavior:
[What should happen]

Actual Behavior:
[What actually happened]

Additional Information:
- User ID: ${localStorage.getItem('userId') || 'Not logged in'}
- Browser: ${navigator.userAgent}
- URL: ${window.location.href}
- Timestamp: ${new Date().toISOString()}
- Screen Resolution: ${window.screen.width}x${window.screen.height}

Screenshots (if any):
[Please attach screenshots if relevant]`);
    
    window.open(`mailto:opslessraj@gmail.com?subject=${subject}&body=${body}`, '_blank');
    toast.success('Opening bug report email...');
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

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
      <div className="flex items-center mb-6">
        <HelpCircle className="w-6 h-6 text-blue-600 mr-3" />
        <h2 className="text-xl font-bold text-gray-900">Quick Links</h2>
      </div>

      <div className="space-y-4">
        {/* Discord Community */}
        <button
          onClick={handleDiscordClick}
          className="w-full flex items-center justify-between p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors duration-200 group"
        >
          <div className="flex items-center">
            <MessageCircle className="w-5 h-5 text-indigo-600 mr-3" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">Discord Community</div>
              <div className="text-sm text-gray-600">Join our community</div>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
        </button>

        {/* Bug Report */}
        <button
          onClick={handleBugReport}
          className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200 group"
        >
          <div className="flex items-center">
            <Bug className="w-5 h-5 text-red-600 mr-3" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">Report a Bug</div>
              <div className="text-sm text-gray-600">Found an issue? Let us know</div>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
        </button>

        {/* Feature Request */}
        <button
          onClick={handleFeatureRequest}
          className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 group"
        >
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-green-600 mr-3" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">Feature Request</div>
              <div className="text-sm text-gray-600">Suggest new features</div>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
        </button>

        {/* Direct Email Contact */}
        <button
          onClick={handleEmailClick}
          className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 group"
        >
          <div className="flex items-center">
            <Mail className="w-5 h-5 text-blue-600 mr-3" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">Contact Support</div>
              <div className="text-sm text-gray-600">Email us directly</div>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          <div className="font-semibold mb-2">Contact Information:</div>
          <div>📧 Email: opslessraj@gmail.com</div>
          <div>💬 Discord: <a 
            href="https://discord.com/channels/1401307658253893654/1401307658908340225" 
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