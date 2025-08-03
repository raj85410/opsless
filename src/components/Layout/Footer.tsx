import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../Logo';
import { 
  MessageCircle, 
  Mail, 
  Github, 
  ExternalLink,
  Heart
} from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <Logo size="md" showText={false} className="text-white" />
              <span className="text-xl font-bold ml-3">Opsless</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Streamline your DevOps workflow with our comprehensive platform. 
              Deploy, monitor, and manage your applications with ease.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://discord.com/channels/1401307658253893654/1401307658908340225"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
                title="Join our Discord community"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href="mailto:opslessraj@gmail.com"
                className="text-gray-300 hover:text-white transition-colors"
                title="Contact us via email"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a
                href="https://github.com/raj85410/opsless"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
                title="View on GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/dashboard" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  to="/monitoring" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Monitoring
                </Link>
              </li>
              <li>
                <Link 
                  to="/support" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Support
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://discord.com/channels/1401307658253893654/1401307658908340225"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors flex items-center"
                >
                  Discord Community
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
              <li>
                <a
                  href="mailto:opslessraj@gmail.com"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Email Support
                </a>
              </li>
              <li>
                <Link 
                  to="/help" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link 
                  to="/support" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Report Bug
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-300 text-sm">
            © {currentYear} Opsless. Made with <Heart className="w-4 h-4 inline text-red-500" /> by Raj
          </div>
          <div className="text-gray-300 text-sm mt-4 md:mt-0">
            <span>Contact: </span>
            <a 
              href="mailto:opslessraj@gmail.com"
              className="text-blue-400 hover:text-blue-300"
            >
              opslessraj@gmail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 