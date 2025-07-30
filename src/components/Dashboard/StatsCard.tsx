import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'emerald' | 'purple';
  trend?: string;
  trendDirection?: 'up' | 'down';
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon, 
  color, 
  trend, 
  trendDirection 
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 text-blue-600';
      case 'green':
        return 'bg-green-50 text-green-600';
      case 'yellow':
        return 'bg-yellow-50 text-yellow-600';
      case 'red':
        return 'bg-red-50 text-red-600';
      case 'emerald':
        return 'bg-emerald-50 text-emerald-600';
      case 'purple':
        return 'bg-purple-50 text-purple-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  const getTrendColor = () => {
    if (trendDirection === 'up') {
      return 'text-green-600';
    } else if (trendDirection === 'down') {
      return 'text-red-600';
    }
    return 'text-gray-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {trend && trendDirection && (
              <div className={`flex items-center gap-1 text-sm font-medium ${getTrendColor()}`}>
                {trendDirection === 'up' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {trend}
              </div>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-lg ${getColorClasses()}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;