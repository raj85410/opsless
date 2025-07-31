import React, { useState } from 'react';
import { Deployment } from '../../types';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import PipelineLogs from '../Logs/PipelineLogs';

interface DeploymentHistoryProps {
  deployments: Deployment[];
}

const DeploymentHistory: React.FC<DeploymentHistoryProps> = ({ deployments }) => {
  const [showPipelineLogs, setShowPipelineLogs] = useState(false);
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null);
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'building':
        return <Clock className="h-5 w-5 text-yellow-500 animate-spin" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'building':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDuration = (deployment: Deployment) => {
    if (!deployment.completedAt) return 'In progress...';
    const duration = new Date(deployment.completedAt).getTime() - new Date(deployment.startedAt).getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  if (deployments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No deployments yet</h3>
        <p className="text-gray-600">
          Your deployment history will appear here once you start deploying projects.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Deployment History</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {deployments.map((deployment) => (
          <div key={deployment.id} className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {getStatusIcon(deployment.status)}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      Version {deployment.version}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deployment.status)}`}>
                      {deployment.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <span>{deployment.environment}</span>
                    <span>{new Date(deployment.startedAt).toLocaleString()}</span>
                    <span>{getDuration(deployment)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => {
                    setSelectedDeployment(deployment);
                    setShowPipelineLogs(true);
                  }}
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1"
                >
                  <ExternalLink size={16} />
                  <span>View Logs</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Pipeline Logs Modal */}
    {showPipelineLogs && selectedDeployment && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <PipelineLogs 
              pipelineId={`deployment-${selectedDeployment.id}`}
              onClose={() => {
                setShowPipelineLogs(false);
                setSelectedDeployment(null);
              }} 
            />
          </div>
        </div>
      </div>
    )}
  </>
  );
};

export default DeploymentHistory;