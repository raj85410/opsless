import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, 
  Square, 
  RefreshCw, 
  Download, 
  Filter,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  step: string;
}

interface PipelineLogsProps {
  pipelineId?: string;
  onClose?: () => void;
}

const PipelineLogs: React.FC<PipelineLogsProps> = ({ pipelineId = 'demo-pipeline', onClose }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [filter, setFilter] = useState<'all' | 'info' | 'warning' | 'error' | 'success'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock log data for demonstration
  const mockLogs: LogEntry[] = useMemo(() => [
    {
      id: '1',
      timestamp: new Date(Date.now() - 60000),
      level: 'info',
      message: 'Pipeline started',
      step: 'Initialization'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 55000),
      level: 'info',
      message: 'Checking out code from repository',
      step: 'Checkout'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 50000),
      level: 'success',
      message: 'Code checkout completed successfully',
      step: 'Checkout'
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 45000),
      level: 'info',
      message: 'Installing dependencies',
      step: 'Dependencies'
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 40000),
      level: 'warning',
      message: 'Some dependencies are outdated',
      step: 'Dependencies'
    },
    {
      id: '6',
      timestamp: new Date(Date.now() - 35000),
      level: 'success',
      message: 'Dependencies installed successfully',
      step: 'Dependencies'
    },
    {
      id: '7',
      timestamp: new Date(Date.now() - 30000),
      level: 'info',
      message: 'Running tests',
      step: 'Testing'
    },
    {
      id: '8',
      timestamp: new Date(Date.now() - 25000),
      level: 'success',
      message: 'All tests passed',
      step: 'Testing'
    },
    {
      id: '9',
      timestamp: new Date(Date.now() - 20000),
      level: 'info',
      message: 'Building application',
      step: 'Build'
    },
    {
      id: '10',
      timestamp: new Date(Date.now() - 15000),
      level: 'success',
      message: 'Build completed successfully',
      step: 'Build'
    },
    {
      id: '11',
      timestamp: new Date(Date.now() - 10000),
      level: 'info',
      message: 'Deploying to production',
      step: 'Deploy'
    },
    {
      id: '12',
      timestamp: new Date(Date.now() - 5000),
      level: 'success',
      message: 'Deployment completed successfully',
      step: 'Deploy'
    }
  ], []);

  useEffect(() => {
    setLogs(mockLogs);
  }, [mockLogs]);

  const startStream = () => {
    setIsStreaming(true);
    // Simulate real-time log streaming
    const interval = setInterval(() => {
      const newLog: LogEntry = {
        id: Date.now().toString(),
        timestamp: new Date(),
        level: ['info', 'success', 'warning'][Math.floor(Math.random() * 3)] as 'info' | 'success' | 'warning',
        message: `Real-time log entry ${Date.now()}`,
        step: 'Monitoring'
      };
      setLogs(prev => [...prev, newLog]);
    }, 2000);

    return () => clearInterval(interval);
  };

  const stopStream = () => {
    setIsStreaming(false);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const downloadLogs = () => {
    const logText = logs.map(log => 
      `[${log.timestamp.toISOString()}] ${log.level.toUpperCase()}: ${log.message} (${log.step})`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pipeline-logs-${pipelineId}-${new Date().toISOString()}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'success':
        return 'text-green-600 bg-green-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || log.level === filter;
    const matchesSearch = searchTerm === '' || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.step.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Pipeline Logs</h2>
          <p className="text-sm text-gray-600">Pipeline ID: {pipelineId}</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={isStreaming ? stopStream : startStream}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isStreaming 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {isStreaming ? (
              <>
                <Square className="w-4 h-4" />
                Stop Stream
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start Stream
              </>
            )}
          </button>
          <button
            onClick={clearLogs}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Clear
          </button>
          <button
            onClick={downloadLogs}
            className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'info' | 'warning' | 'error' | 'success')}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Logs */}
      <div className="h-96 overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No logs found</p>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`flex items-start space-x-3 p-3 rounded-lg border ${
                  log.level === 'error' ? 'border-red-200 bg-red-50' :
                  log.level === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                  log.level === 'success' ? 'border-green-200 bg-green-50' :
                  'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getLevelIcon(log.level)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(log.level)}`}>
                        {log.level.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-600">{log.step}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {log.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 mt-1">{log.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Total logs: {filteredLogs.length}</span>
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

export default PipelineLogs; 