"use client";

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  BarChart3,
  RefreshCw,
  XCircle
} from 'lucide-react';

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    message: 'Initializing AI Visibility analysis...',
    showProgress: false
  },
  running: {
    icon: Loader2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    message: 'Crawling and collecting data...',
    showProgress: true,
    animated: true
  },
  analyzing: {
    icon: BarChart3,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    message: 'Analyzing entities and schema...',
    showProgress: true,
    animated: true
  },
  scoring: {
    icon: RefreshCw,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    message: 'Calculating AI visibility score...',
    showProgress: true,
    animated: true
  },
  completed: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    message: 'Analysis completed successfully!',
    showProgress: false
  },
  failed: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    message: 'Analysis failed',
    showProgress: false
  }
};

export default function AIVisibilityStatusRenderer({ 
  status, 
  progressPercentage = 0,
  error = null,
  onRetry = null 
}) {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="max-w-md w-full p-8 text-center">
        {/* Status Icon */}
        <div className={`mx-auto w-16 h-16 ${config.bgColor} rounded-full flex items-center justify-center mb-6`}>
          <Icon 
            className={`w-8 h-8 ${config.color} ${config.animated ? 'animate-spin' : ''}`} 
          />
        </div>

        {/* Status Message */}
        <h3 className={`text-xl font-semibold mb-2 ${config.color}`}>
          {config.message}
        </h3>

        {/* Progress Bar */}
        {config.showProgress && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Progress</span>
              <span className="text-sm font-medium">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        {/* Error Message */}
        {status === 'failed' && error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Error Details</span>
            </div>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        )}

        {/* Additional Info */}
        {status === 'completed' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              Your AI Visibility analysis is ready! View the detailed results in the dashboard.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          {status === 'failed' && onRetry && (
            <Button onClick={handleRetry} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Analysis
            </Button>
          )}
          
          {status === 'completed' && (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
              <CheckCircle className="w-3 h-3 mr-1" />
              Complete
            </Badge>
          )}
        </div>

        {/* Status Badge */}
        <div className="mt-6 flex justify-center">
          <Badge 
            variant="outline" 
            className={`${config.bgColor} ${config.color} border-current`}
          >
            Status: {status.toUpperCase()}
          </Badge>
        </div>
      </Card>
    </div>
  );
}
