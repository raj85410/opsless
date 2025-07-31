import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Copy, 
  Download, 
  Trash2,
  Terminal,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PipelineLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  step?: string;
}

interface PipelineLogsProps {
  pipelineId?: string;
  onClose?: () => void;
}

const PipelineLogs: React.FC<PipelineLogsProps> = ({ pipelineId, onClose }) => {
  const [logs, setLogs] = useState<PipelineLog[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Mock pipeline logs for demonstration
  const generateMockLogs = (): PipelineLog[] => {
    const now = Date.now();
    return [
      {
        id: '1',
        timestamp: new Date(now),
        level: 'info',
        message: 'Pipeline execution started',
        step: 'Initialization'
      },
      {
        id: '2',
        timestamp: new Date(now + 1000),
        level: 'info',
        message: 'Cloning repository: https://github.com/user/my-app',
        step: 'Source'
      },
      {
        id: '3',
        timestamp: new Date(now + 2000),
        level: 'info',
        message: 'Installing dependencies...',
        step: 'Build'
      },
      {
        id: '4',
        timestamp: new Date(now + 3000),
        level: 'success',
        message: 'Dependencies installed successfully',
        step: 'Build'
      },
      {
        id: '5',
        timestamp: new Date(now + 4000),
        level: 'info',
        message: 'Running tests...',
        step: 'Test'
      },
      {
        id: '6',
        timestamp: new Date(now + 5000),
        level: 'success',
        message: 'All tests passed (12/12)',
        step: 'Test'
      },
      {
        id: '7',
        timestamp: new Date(now + 6000),
        level: 'info',
        message: 'Building Docker image...',
        step: 'Build'
      },
      {
        id: '8',
        timestamp: new Date(now + 7000),
        level: 'success',
        message: 'Docker image built successfully: my-app:latest',
        step: 'Build'
      },
      {
        id: '9',
        timestamp: new Date(now + 8000),
        level: 'info',
        message: 'Deploying to production...',
        step: 'Deploy'
      },
      {
        id: '10',
        timestamp: new Date(now + 9000),
        level: 'success',
        message: 'Deployment completed successfully',
        step: 'Deploy'
      }
    ];
  };

  useEffect(() => {
    if (autoScroll) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startStream = () => {
    try {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      setIsStreaming(true);
      setIsConnected(true);
      setIsLoading(true);
      setLogs([]);
      
      // Generate fresh mock logs for this stream
      const mockPipelineLogs = generateMockLogs();
      
      // Simulate real-time log streaming
      let logIndex = 0;
      intervalRef.current = setInterval(() => {
        if (logIndex < mockPipelineLogs.length) {
          setLogs(prev => [...prev, mockPipelineLogs[logIndex]]);
          logIndex++;
        } else {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setIsStreaming(false);
          setIsLoading(false);
          toast.success('Pipeline execution completed successfully!');
        }
      }, 1000);

      setIsLoading(false);
      toast.success('Pipeline logs streaming started');
    } catch (error) {
      console.error('Error starting stream:', error);
      setIsStreaming(false);
      setIsConnected(false);
      setIsLoading(false);
      toast.error('Failed to start pipeline logs stream');
    }
  };

  const stopStream = () => {
    try {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsStreaming(false);
      setIsConnected(false);
      setIsLoading(false);
      toast.info('Pipeline logs streaming stopped');
    } catch (error) {
      console.error('Error stopping stream:', error);
      toast.error('Failed to stop pipeline logs stream');
    }
  };

  const copyLogs = () => {
    const logText = logs.map(log => 
      `[${log.timestamp.toISOString()}] ${log.level.toUpperCase()}: ${log.message}`
    ).join('\n');
    
    navigator.clipboard.writeText(logText).then(() => {
      toast.success('Logs copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy logs');
    });
  };

  const downloadLogs = () => {
    const logData = logs.map(log => ({
      timestamp: log.timestamp.toISOString(),
      level: log.level,
      message: log.message,
      step: log.step
    }));
    
    const blob = new Blob([JSON.stringify(logData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pipeline-logs-${pipelineId || 'default'}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Logs downloaded successfully');
  };

  const clearLogs = () => {
    setLogs([]);
    setIsConnected(false);
    setIsStreaming(false);
    toast.success('Logs cleared');
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      case 'success':
        return 'text-green-400';
      case 'info':
      default:
        return 'text-gray-300';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Terminal className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Pipeline Logs</h3>
            <p className="text-sm text-gray-600">Real-time execution logs</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
                     <button
             onClick={isStreaming ? stopStream : startStream}
             disabled={isLoading}
             className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
               isStreaming 
                 ? 'bg-red-600 text-white hover:bg-red-700' 
                 : 'bg-green-600 text-white hover:bg-green-700'
             } disabled:opacity-50 disabled:cursor-not-allowed`}
           >
             {isLoading ? (
               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
             ) : (
               <Play className={`h-4 w-4 ${isStreaming ? 'hidden' : ''}`} />
             )}
             <span>{isLoading ? 'Starting...' : (isStreaming ? 'Stop Stream' : 'Start Stream')}</span>
           </button>
          
          <button
            onClick={copyLogs}
            disabled={logs.length === 0}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Copy logs"
          >
            <Copy className="h-4 w-4" />
          </button>
          
          <button
            onClick={downloadLogs}
            disabled={logs.length === 0}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Download logs"
          >
            <Download className="h-4 w-4" />
          </button>
          
          <button
            onClick={clearLogs}
            disabled={logs.length === 0}
            className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Clear logs"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Log Display Area */}
      <div className="bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
        {logs.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            Pipeline logs will appear here when execution starts...
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start space-x-2">
                <span className="text-gray-600 text-xs mt-1 min-w-[60px]">
                  {log.timestamp.toLocaleTimeString()}
                </span>
                <span className={`${getLevelColor(log.level)}`}>
                  {getLevelIcon(log.level)}
                </span>
                {log.step && (
                  <span className="text-blue-400 text-xs mt-1 min-w-[80px]">
                    [{log.step}]
                  </span>
                )}
                <span className={`${getLevelColor(log.level)} flex-1`}>
                  {log.message}
                </span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          <span className={`flex items-center space-x-1 ${
            isConnected ? 'text-green-600' : 'text-gray-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </span>
          <span>{logs.length} log entries</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="flex items-center space-x-1">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded"
            />
            <span>Auto-scroll</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default PipelineLogs; 