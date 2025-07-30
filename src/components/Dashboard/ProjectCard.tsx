import React from 'react';
import { Project } from '../../types';
import { 
  GitBranch, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ExternalLink,
  Settings,
  Globe,
  Code,
  Calendar
} from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const getStatusIcon = () => {
    switch (project.status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'inactive':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'archived':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (project.status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFrameworkIcon = () => {
    switch (project.framework) {
      case 'react':
        return '⚛️';
      case 'vue':
        return '⚡';
      case 'angular':
        return '🅰️';
      case 'node':
        return '🟢';
      case 'python':
        return '🐍';
      case 'java':
        return '☕';
      case 'dotnet':
        return '🔷';
      case 'php':
        return '🐘';
      case 'go':
        return '🐹';
      case 'rust':
        return '🦀';
      default:
        return '⚙️';
    }
  };

  const getPlatformIcon = () => {
    switch (project.deploymentConfig.platform) {
      case 'aws':
        return '☁️';
      case 'gcp':
        return '🌐';
      case 'azure':
        return '🔵';
      case 'vercel':
        return '▲';
      case 'netlify':
        return '🌐';
      case 'heroku':
        return '🟣';
      case 'docker':
        return '🐳';
      case 'kubernetes':
        return '⚓';
      default:
        return '🚀';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{getFrameworkIcon()}</span>
            <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
            <div className="flex items-center gap-1">
              {getStatusIcon()}
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                {project.status}
              </span>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-3">{project.description}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <GitBranch className="w-4 h-4" />
              <span>{project.branch}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-lg">{getPlatformIcon()}</span>
              <span className="capitalize">{project.deploymentConfig.platform}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <button className="text-gray-600 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <Code className="w-4 h-4" />
              <span className="capitalize">{project.framework}</span>
            </div>
            {project.deploymentConfig.domain && (
              <div className="flex items-center gap-1 text-blue-600">
                <Globe className="w-4 h-4" />
                <span>{project.deploymentConfig.domain}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {project.deploymentConfig.sslEnabled && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                SSL
              </span>
            )}
            {project.deploymentConfig.autoScaling && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Auto-Scale
              </span>
            )}
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Deploy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;