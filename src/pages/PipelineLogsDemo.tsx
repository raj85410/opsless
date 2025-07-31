import React from 'react';
import PipelineLogs from '../components/Logs/PipelineLogs';

const PipelineLogsDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Pipeline Logs Demo</h1>
          <p className="text-gray-600">
            This is a demonstration of the Pipeline Logs component. Click "Start Stream" to see real-time pipeline execution logs.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Pipeline Logs */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Main Pipeline</h2>
            <PipelineLogs pipelineId="main-pipeline" />
          </div>
          
          {/* Secondary Pipeline Logs */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Secondary Pipeline</h2>
            <PipelineLogs pipelineId="secondary-pipeline" />
          </div>
        </div>
        
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Features Demonstrated</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Real-time Streaming</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Live log updates every second</li>
                <li>• Sequential timestamp generation</li>
                <li>• Auto-scroll functionality</li>
                <li>• Connection status indicator</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Log Management</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Copy logs to clipboard</li>
                <li>• Download logs as JSON</li>
                <li>• Clear logs functionality</li>
                <li>• Color-coded log levels</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineLogsDemo; 