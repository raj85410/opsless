import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Clock, 
  Database, 
  HardDrive as DiskIcon, 
  Network, 
  Server,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface MetricData {
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
  history: Array<{ timestamp: number; value: number }>;
}

interface MonitoringMetrics {
  cpuLoad: MetricData;
  memoryUsage: MetricData;
  systemLoad: MetricData;
  uptime: MetricData;
  threadCount: MetricData;
  garbageCollection: MetricData;
  networkTraffic: MetricData;
  diskUsage: MetricData;
}

const MonitoringDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<MonitoringMetrics>({
    cpuLoad: {
      value: 0.00021,
      unit: '%',
      trend: 'stable',
      status: 'good',
      history: []
    },
    memoryUsage: {
      value: 192.92,
      unit: 'MiB',
      trend: 'up',
      status: 'good',
      history: []
    },
    systemLoad: {
      value: 2.3,
      unit: '',
      trend: 'up',
      status: 'warning',
      history: []
    },
    uptime: {
      value: 1.0683,
      unit: 'hours',
      trend: 'up',
      status: 'good',
      history: []
    },
    threadCount: {
      value: 45,
      unit: '',
      trend: 'stable',
      status: 'good',
      history: []
    },
    garbageCollection: {
      value: 0.18,
      unit: 's',
      trend: 'down',
      status: 'good',
      history: []
    },
    networkTraffic: {
      value: 1.2,
      unit: 'MB/s',
      trend: 'up',
      status: 'good',
      history: []
    },
    diskUsage: {
      value: 68.5,
      unit: '%',
      trend: 'up',
      status: 'warning',
      history: []
    }
  });

  const [timeRange, setTimeRange] = useState('5m');
  const [refreshInterval, setRefreshInterval] = useState('5s');

  useEffect(() => {
    // Generate mock historical data
    const generateHistory = () => {
      const now = Date.now();
      const history = [];
      for (let i = 0; i < 20; i++) {
        history.push({
          timestamp: now - (20 - i) * 1000,
          value: Math.random() * 100
        });
      }
      return history;
    };

    setMetrics(prev => ({
      ...prev,
      cpuLoad: { ...prev.cpuLoad, history: generateHistory() },
      memoryUsage: { ...prev.memoryUsage, history: generateHistory() },
      systemLoad: { ...prev.systemLoad, history: generateHistory() },
      uptime: { ...prev.uptime, history: generateHistory() },
      threadCount: { ...prev.threadCount, history: generateHistory() },
      garbageCollection: { ...prev.garbageCollection, history: generateHistory() },
      networkTraffic: { ...prev.networkTraffic, history: generateHistory() },
      diskUsage: { ...prev.diskUsage, history: generateHistory() }
    }));

    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        cpuLoad: { ...prev.cpuLoad, value: Math.random() * 0.001 },
        memoryUsage: { ...prev.memoryUsage, value: 180 + Math.random() * 40 },
        systemLoad: { ...prev.systemLoad, value: 1.5 + Math.random() * 2 },
        uptime: { ...prev.uptime, value: prev.uptime.value + 0.0014 },
        threadCount: { ...prev.threadCount, value: 40 + Math.floor(Math.random() * 10) },
        garbageCollection: { ...prev.garbageCollection, value: Math.random() * 0.3 },
        networkTraffic: { ...prev.networkTraffic, value: 0.5 + Math.random() * 2 },
        diskUsage: { ...prev.diskUsage, value: 65 + Math.random() * 10 }
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const MetricCard: React.FC<{
    title: string;
    metric: MetricData;
    icon: React.ReactNode;
    type?: 'single' | 'graph';
  }> = ({ title, metric, icon, type = 'single' }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {icon}
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        </div>
        <div className="flex items-center space-x-1">
          {getTrendIcon(metric.trend)}
          <div className={`w-2 h-2 rounded-full ${getStatusColor(metric.status).replace('text-', 'bg-')}`}></div>
        </div>
      </div>
      
      {type === 'single' ? (
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {metric.value.toFixed(4)}
            <span className="text-sm text-gray-500 ml-1">{metric.unit}</span>
          </div>
          <div className="mt-2 h-16 bg-gray-50 rounded">
            {/* Simple area chart */}
            <svg className="w-full h-full" viewBox="0 0 100 40">
              <path
                d="M0,40 L20,30 L40,35 L60,25 L80,20 L100,15 L100,40 Z"
                fill="rgba(59, 130, 246, 0.1)"
                stroke="rgba(59, 130, 246, 0.5)"
                strokeWidth="1"
              />
            </svg>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-lg font-semibold text-gray-900">
            {metric.value.toFixed(2)}
            <span className="text-sm text-gray-500 ml-1">{metric.unit}</span>
          </div>
          <div className="h-20 bg-gray-50 rounded">
            {/* Line chart */}
            <svg className="w-full h-full" viewBox="0 0 100 40">
              <path
                d="M0,30 L20,25 L40,20 L60,15 L80,10 L100,5"
                fill="none"
                stroke="rgba(59, 130, 246, 0.8)"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                MicroProfile Metrics Dashboard
              </h1>
              <span className="text-sm text-gray-500">
                {new Date().toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="5m">Last 5 minutes</option>
                <option value="15m">Last 15 minutes</option>
                <option value="1h">Last 1 hour</option>
                <option value="6h">Last 6 hours</option>
                <option value="24h">Last 24 hours</option>
              </select>
              
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="5s">5s</option>
                <option value="10s">10s</option>
                <option value="30s">30s</option>
                <option value="1m">1m</option>
              </select>
              
              <button className="text-gray-400 hover:text-gray-600">
                <Activity className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <MetricCard
            title="Process CPU Load"
            metric={metrics.cpuLoad}
            icon={<Cpu className="h-5 w-5 text-blue-600" />}
            type="single"
          />
          <MetricCard
            title="Memory Usage"
            metric={metrics.memoryUsage}
            icon={<HardDrive className="h-5 w-5 text-green-600" />}
            type="graph"
          />
          <MetricCard
            title="System Load Average"
            metric={metrics.systemLoad}
            icon={<Server className="h-5 w-5 text-yellow-600" />}
            type="single"
          />
          <MetricCard
            title="JVM Uptime"
            metric={metrics.uptime}
            icon={<Clock className="h-5 w-5 text-purple-600" />}
            type="single"
          />
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <MetricCard
            title="Thread Count"
            metric={metrics.threadCount}
            icon={<Activity className="h-5 w-5 text-indigo-600" />}
            type="graph"
          />
          <MetricCard
            title="Garbage Collection Time"
            metric={metrics.garbageCollection}
            icon={<Database className="h-5 w-5 text-red-600" />}
            type="graph"
          />
          <MetricCard
            title="Network Traffic"
            metric={metrics.networkTraffic}
            icon={<Network className="h-5 w-5 text-teal-600" />}
            type="graph"
          />
          <MetricCard
            title="Disk Usage"
            metric={metrics.diskUsage}
            icon={<DiskIcon className="h-5 w-5 text-orange-600" />}
            type="graph"
          />
        </div>

        {/* Additional Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">System Health</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">CPU Status</span>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Healthy</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Memory Status</span>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Healthy</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Disk Status</span>
                <div className="flex items-center space-x-1">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-yellow-600">Warning</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Performance Alerts</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-600">High system load detected</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-600">Disk usage approaching limit</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
                View Detailed Logs
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
                Export Metrics
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
                Configure Alerts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringDashboard; 