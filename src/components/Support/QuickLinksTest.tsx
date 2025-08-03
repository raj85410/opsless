import React from 'react';
import { 
  MessageCircle, 
  Mail, 
  Bug, 
  ExternalLink, 
  HelpCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const QuickLinksTest: React.FC = () => {
  const testDiscord = () => {
    console.log('Discord button clicked');
    try {
      window.open('https://discord.com/channels/1401307658253893654/1401307658908340225', '_blank');
      toast.success('Opening Discord community...');
    } catch (error) {
      console.error('Error opening Discord:', error);
      toast.error('Failed to open Discord');
    }
  };

  const testEmail = () => {
    console.log('Email button clicked');
    try {
      const subject = encodeURIComponent('Test Email - Opsless Support');
      const body = encodeURIComponent('This is a test email from QuickLinks component');
      window.open(`mailto:opslessraj@gmail.com?subject=${subject}&body=${body}`, '_blank');
      toast.success('Opening email client...');
    } catch (error) {
      console.error('Error opening email:', error);
      toast.error('Failed to open email');
    }
  };

  const testBugReport = () => {
    console.log('Bug report button clicked');
    try {
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
- Screen Resolution: ${window.screen.width}x${window.screen.height}`);
      
      window.open(`mailto:opslessraj@gmail.com?subject=${subject}&body=${body}`, '_blank');
      toast.success('Opening bug report email...');
    } catch (error) {
      console.error('Error opening bug report:', error);
      toast.error('Failed to open bug report');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
      <div className="flex items-center mb-6">
        <HelpCircle className="w-6 h-6 text-blue-600 mr-3" />
        <h2 className="text-xl font-bold text-gray-900">Quick Links Test</h2>
      </div>

      <div className="space-y-4">
        {/* Test Discord */}
        <button
          onClick={testDiscord}
          className="w-full flex items-center justify-between p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors duration-200 group"
        >
          <div className="flex items-center">
            <MessageCircle className="w-5 h-5 text-indigo-600 mr-3" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">Test Discord</div>
              <div className="text-sm text-gray-600">Click to test Discord link</div>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
        </button>

        {/* Test Email */}
        <button
          onClick={testEmail}
          className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 group"
        >
          <div className="flex items-center">
            <Mail className="w-5 h-5 text-blue-600 mr-3" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">Test Email</div>
              <div className="text-sm text-gray-600">Click to test email</div>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
        </button>

        {/* Test Bug Report */}
        <button
          onClick={testBugReport}
          className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200 group"
        >
          <div className="flex items-center">
            <Bug className="w-5 h-5 text-red-600 mr-3" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">Test Bug Report</div>
              <div className="text-sm text-gray-600">Click to test bug report</div>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          <div className="font-semibold mb-2">Debug Info:</div>
          <div>User Agent: {navigator.userAgent.substring(0, 50)}...</div>
          <div>URL: {window.location.href}</div>
          <div>Screen: {window.screen.width}x{window.screen.height}</div>
          <div>User ID: {localStorage.getItem('userId') || 'Not logged in'}</div>
        </div>
      </div>
    </div>
  );
};

export default QuickLinksTest; 