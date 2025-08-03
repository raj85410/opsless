import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Download, RefreshCw, Play, Pause, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  source: string;
  projectId?: string;
  deploymentId?: string;
}

const LogViewer: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Mock data for demonstration
  const mockLogs: LogEntry[] = [
    {
      id: '1',
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Application started successfully',
      source: 'app',
      projectId: 'proj_123',
      deploymentId: 'dep_456'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 1000).toISOString(),
      level: 'info',
      message: 'Database connection established',
      source: 'database',
      projectId: 'proj_123',
      deploymentId: 'dep_456'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 2000).toISOString(),
      level: 'warning',
      message: 'High memory usage detected',
      source: 'monitoring',
      projectId: 'proj_123',
      deploymentId: 'dep_456'
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 3000).toISOString(),
      level: 'error',
      message: 'Failed to connect to external API',
      source: 'api',
      projectId: 'proj_123',
      deploymentId: 'dep_456'
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 4000).toISOString(),
      level: 'success',
      message: 'Deployment completed successfully',
      source: 'deployment',
      projectId: 'proj_123',
      deploymentId: 'dep_456'
    }
  ];

  useEffect(() => {
    setLogs(mockLogs);
    setFilteredLogs(mockLogs);
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, selectedLevel, selectedSource]);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredLogs, autoScroll]);

  const filterLogs = () => {
    let filtered = logs;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.source.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by level
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(log => log.level === selectedLevel);
    }

    // Filter by source
    if (selectedSource !== 'all') {
      filtered = filtered.filter(log => log.source === selectedSource);
    }

    setFilteredLogs(filtered);
  };

  const clearLogs = () => {
    setLogs([]);
    setFilteredLogs([]);
    toast.success('Logs cleared');
  };

  const refreshLogs = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLogs([...mockLogs, ...logs.slice(0, 5)]);
      toast.success('Logs refreshed');
    } catch (error) {
      toast.error('Failed to refresh logs');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadLogs = () => {
    const logText = filteredLogs
      .map(log => `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}`)
      .join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Logs downloaded');
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return '🔴';
      case 'warning': return '🟡';
      case 'success': return '🟢';
      default: return '🔵';
    }
  };

  const sources = ['all', ...Array.from(new Set(logs.map(log => log.source)))];
  const levels = ['all', 'info', 'warning', 'error', 'success'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Log Viewer</h1>
              <p className="text-gray-600">Monitor your application logs in real-time</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsLive(!isLive)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isLive 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isLive ? 'Live' : 'Paused'}
              </button>
              <button
                onClick={refreshLogs}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={downloadLogs}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={clearLogs}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Level Filter */}
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {levels.map(level => (
                <option key={level} value={level}>
                  {level === 'all' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>

            {/* Source Filter */}
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {sources.map(source => (
                <option key={source} value={source}>
                  {source === 'all' ? 'All Sources' : source.charAt(0).toUpperCase() + source.slice(1)}
                </option>
              ))}
            </select>

            {/* Auto-scroll Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Auto-scroll</span>
            </label>
          </div>
        </div>

        {/* Logs Display */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Logs ({filteredLogs.length} entries)
              </h3>
              <div className="flex gap-2 text-sm text-gray-500">
                <span>Info: {filteredLogs.filter(log => log.level === 'info').length}</span>
                <span>Warning: {filteredLogs.filter(log => log.level === 'warning').length}</span>
                <span>Error: {filteredLogs.filter(log => log.level === 'error').length}</span>
                <span>Success: {filteredLogs.filter(log => log.level === 'success').length}</span>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No logs found matching your filters</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-4 hover:bg-gray-50 transition-colors border-l-4 ${getLevelColor(log.level)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm">{getLevelIcon(log.level)}</span>
                          <span className="text-xs font-medium text-gray-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getLevelColor(log.level)}`}>
                            {log.level.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">[{log.source}]</span>
                        </div>
                        <p className="text-sm text-gray-900 font-mono">{log.message}</p>
                        {log.projectId && (
                          <div className="mt-2 text-xs text-gray-500">
                            Project: {log.projectId} | Deployment: {log.deploymentId}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogViewer;