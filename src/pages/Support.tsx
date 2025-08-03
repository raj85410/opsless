import React from 'react';
import QuickLinks from '../components/Support/QuickLinks';
import { 
  MessageCircle, 
  Mail, 
  HelpCircle, 
  Users,
  Clock,
  CheckCircle
} from 'lucide-react';

const Support: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Support Center</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Need help with Opsless? We're here to assist you with any questions, 
            bug reports, or feature requests.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Links */}
          <div className="lg:col-span-1">
            <QuickLinks />
          </div>

          {/* Support Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Response Times */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 text-blue-600 mr-2" />
                Response Times
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">24h</div>
                  <div className="text-sm text-gray-600">Bug Reports</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">48h</div>
                  <div className="text-sm text-gray-600">General Support</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">1 Week</div>
                  <div className="text-sm text-gray-600">Feature Requests</div>
                </div>
              </div>
            </div>

            {/* Contact Methods */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <MessageCircle className="w-5 h-5 text-blue-600 mr-2" />
                Contact Methods
              </h2>
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-indigo-50 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-indigo-600 mr-3" />
                  <div>
                    <div className="font-semibold text-gray-900">Discord Community</div>
                    <div className="text-sm text-gray-600">
                      Join our Discord server for real-time support and community discussions
                    </div>
                    <a 
                      href="https://discord.com/channels/1401307658253893654/1401307658908340225"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                      Join Discord →
                    </a>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <div className="font-semibold text-gray-900">Email Support</div>
                    <div className="text-sm text-gray-600">
                      Send us an email for detailed support requests
                    </div>
                    <a 
                      href="mailto:opslessraj@gmail.com"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      opslessraj@gmail.com →
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <HelpCircle className="w-5 h-5 text-blue-600 mr-2" />
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    How do I set up AWS credentials?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Navigate to the AWS Credentials section in your dashboard. Enter your Access Key ID, 
                    Secret Access Key, and select your preferred region. Click "Test Credentials" to verify 
                    they work before saving.
                  </p>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    What AWS services are supported?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Opsless supports EC2, ECS, Elastic Beanstalk, S3, ECR, and CloudWatch. 
                    We're continuously adding support for more AWS services.
                  </p>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    How do I report a bug?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Use the "Report a Bug" button above, or send an email to opslessraj@gmail.com 
                    with detailed information about the issue, including steps to reproduce.
                  </p>
                </div>

                <div className="pb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Can I request new features?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Absolutely! Use the "Feature Request" button above or join our Discord community 
                    to discuss new feature ideas with other users.
                  </p>
                </div>
              </div>
            </div>

            {/* Community Guidelines */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 text-blue-600 mr-2" />
                Community Guidelines
              </h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Be respectful and helpful to other community members</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Search existing discussions before asking questions</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Provide detailed information when reporting bugs</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Share your experiences and solutions with others</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support; 