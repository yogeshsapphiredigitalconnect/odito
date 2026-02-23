"use client";

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Shield, BarChart3, Search } from 'lucide-react';

export default function AIVisibilityEmptyState({ onStartAnalysis, disabled = false }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="max-w-md w-full p-8 text-center">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
          <Shield className="w-8 h-8 text-blue-600" />
        </div>

        {/* Content */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Start your first AI Visibility Analysis
        </h2>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          Analyze your site's AI readiness, entity structure, and structured data signals.
        </p>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center">
            <div className="mx-auto w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-xs text-gray-600">Entity Analysis</p>
          </div>
          <div className="text-center">
            <div className="mx-auto w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-2">
              <Search className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-xs text-gray-600">Schema Detection</p>
          </div>
          <div className="text-center">
            <div className="mx-auto w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-2">
              <Shield className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-xs text-gray-600">AI Readiness</p>
          </div>
        </div>

        {/* CTA Button */}
        <Button 
          onClick={onStartAnalysis}
          disabled={disabled}
          className="w-full"
          size="lg"
        >
          <Play className="w-4 h-4 mr-2" />
          Check AI Visibility
        </Button>
      </Card>
    </div>
  );
}
