"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Play, Clock } from 'lucide-react';
import ScreenshotPreviewModal from './ScreenshotPreviewModal';

export default function ProjectAuditHeroCard({
  crawlStatus,
  crawlStarted,
  crawlFinished,
  crawlDuration,
  numberOfCrawls,
  scheduledCrawls,
  websiteUrl,
  overallScore,
  techMetaScore,
  structureScore,
  contentScore,
  screenshotPath
}) {
  const [isScreenshotModalOpen, setIsScreenshotModalOpen] = useState(false);
  const getStatusBadge = () => {
    const baseClasses = "transition-colors duration-300";
    switch (crawlStatus) {
      case 'completed':
        return <Badge className={`${baseClasses} bg-green-100 text-green-800`}><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'in-progress':
        return <Badge className={`${baseClasses} bg-blue-100 text-blue-800 animate-pulse`}><Play className="h-3 w-3 mr-1" />In Progress</Badge>;
      case 'failed':
        return <Badge className={`${baseClasses} bg-red-100 text-red-800`}>Failed</Badge>;
      case 'scheduled':
        return <Badge className={`${baseClasses} bg-yellow-100 text-yellow-800 animate-pulse`}><Clock className="h-3 w-3 mr-1" />Scheduled</Badge>;
      default:
        return <Badge className={`${baseClasses} bg-gray-100 text-gray-800`}>Not started</Badge>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not started';
    return new Date(dateString).toLocaleDateString() + ' at ' + new Date(dateString).toLocaleTimeString();
  };

  const formatDuration = (durationMs) => {
    if (!durationMs || durationMs === 0) return 'Not available';
    
    const totalSeconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (minutes === 0) {
      return `${seconds}s`;
    } else if (seconds === 0) {
      return `${minutes}m`;
    } else {
      return `${minutes}m ${seconds}s`;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 border-green-500 bg-green-100';
    if (score >= 60) return 'text-yellow-600 border-yellow-500 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 border-orange-500 bg-orange-100';
    return 'text-red-600 border-red-500 bg-red-100';
  };

  const getDonutColor = (score) => {
    if (score >= 80) return 'border-green-400';
    if (score >= 60) return 'border-yellow-400';
    if (score >= 40) return 'border-orange-400';
    return 'border-red-400';
  };

  return (
    <Card className="motion-safe:transition-all duration-300 ease-out rounded-2xl border shadow-sm bg-card p-8 hover:shadow-lg hover:-translate-y-[2px] hover:border-muted-foreground/30">
      <div className="flex flex-col lg:flex-row items-center lg:justify-between gap-8 lg:gap-10">
        
        {/* LEFT SECTION - Crawl Summary */}
        <div className="flex-1 w-full">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Website Preview Thumbnail */}
            <div className="w-[220px] h-[200px] rounded-xl border bg-muted overflow-hidden shrink-0 shadow-inner transition-all duration-300 hover:bg-muted/70 hover:scale-[1.02] cursor-pointer">
              { screenshotPath ? (
                <img 
                  src={screenshotPath}
                  alt="Website preview"
                  className="w-full h-full object-cover object-top rounded-lg hover:opacity-90 transition-opacity"
                  style={{ objectPosition: 'top center' }}
                  onClick={() => setIsScreenshotModalOpen(true)}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null }
              <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground" style={{ display: screenshotPath ? 'none' : 'flex' }}>
                <div className="text-center">
                  <div className="text-xs mb-1">Website Preview</div>
                  <div className="text-xs font-mono truncate max-w-[180px]">{websiteUrl || 'No URL provided'}</div>
                  <div className="text-xs text-gray-500 mt-1">Screenshots disabled</div>
                </div>
              </div>
            </div>
            
            {/* Crawl Details */}
            <div className="space-y-3 ml-0 md:ml-6 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Crawl status</span>
                {getStatusBadge()}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Crawl started</span>
                <span className="text-sm font-medium">{formatDate(crawlStarted)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Crawl finished</span>
                <span className="text-sm font-medium">{formatDate(crawlFinished)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Crawl duration</span>
                <span className="text-sm font-medium">{formatDuration(crawlDuration)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vertical Divider - Desktop Only */}
        <div className="hidden lg:block h-[220px] w-px bg-gradient-to-b from-transparent via-border to-transparent"></div>

        {/* RIGHT SECTION - Score Overview */}
        <div className="flex-1 flex items-center justify-between w-full">
          <div className="flex flex-col lg:flex-row items-center gap-8 w-full">
            {/* Donut Chart Placeholder */}
            <div className="flex flex-col items-center">
              <div className={`w-[170px] h-[170px] rounded-full border-[14px] ${overallScore ? getDonutColor(overallScore) : 'border-gray-200'} border-r-muted flex items-center justify-center shadow-inner relative transition-transform duration-500 hover:scale-105`}>
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none"></div>
                <div className="text-center relative z-10">
                  <span className="text-3xl font-bold animate-in fade-in zoom-in duration-700">{Math.round(overallScore || 0)}%</span>
                  <p className="text-muted-foreground text-sm mt-1">Overall 37 rules</p>
                </div>
              </div>
              <Badge variant="secondary" className="mt-4 text-xs">
                {overallScore > 0 ? `${Math.round(overallScore)}%` : 'No data'}
              </Badge>
            </div>

            {/* Mini Score Items */}
            <div className="space-y-4 ml-0 lg:ml-10 w-full max-w-[260px]">
              {/* Tech & Meta Score */}
              <div className="group transition-all duration-300 cursor-pointer flex items-center justify-between border rounded-xl px-4 py-3 hover:shadow-md hover:-translate-y-1 hover:border-muted-foreground/30 hover:bg-muted/40">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full border-2 ${techMetaScore ? getScoreColor(techMetaScore) : 'border-gray-300'} flex items-center justify-center text-xs font-semibold transition-transform duration-300 group-hover:scale-110`}>
                    {techMetaScore || 0}%
                  </div>
                  <span className="text-sm font-medium">Tech & Meta</span>
                </div>
                <div className={`text-sm font-semibold ${techMetaScore ? getScoreColor(techMetaScore).split(' ')[0] : 'text-gray-500'}`}>
                  {techMetaScore || 0}%
                </div>
              </div>

              {/* Structure Score */}
              <div className="group transition-all duration-300 cursor-pointer flex items-center justify-between border rounded-xl px-4 py-3 hover:shadow-md hover:-translate-y-1 hover:border-muted-foreground/30 hover:bg-muted/40">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full border-2 ${structureScore ? getScoreColor(structureScore) : 'border-gray-300'} flex items-center justify-center text-xs font-semibold transition-transform duration-300 group-hover:scale-110`}>
                    {structureScore || 0}%
                  </div>
                  <span className="text-sm font-medium">Structure</span>
                </div>
                <div className={`text-sm font-semibold ${structureScore ? getScoreColor(structureScore).split(' ')[0] : 'text-gray-500'}`}>
                  {structureScore || 0}%
                </div>
              </div>

              {/* Content Score */}
              <div className="group transition-all duration-300 cursor-pointer flex items-center justify-between border rounded-xl px-4 py-3 hover:shadow-md hover:-translate-y-1 hover:border-muted-foreground/30 hover:bg-muted/40">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full border-2 ${contentScore ? getScoreColor(contentScore) : 'border-gray-300'} flex items-center justify-center text-xs font-semibold transition-transform duration-300 group-hover:scale-110`}>
                    {contentScore || 0}%
                  </div>
                  <span className="text-sm font-medium">Content</span>
                </div>
                <div className={`text-sm font-semibold ${contentScore ? getScoreColor(contentScore).split(' ')[0] : 'text-gray-500'}`}>
                  {contentScore || 0}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Screenshot Preview Modal */}
      <ScreenshotPreviewModal 
        isOpen={isScreenshotModalOpen}
        onClose={() => setIsScreenshotModalOpen(false)}
        screenshotPath={screenshotPath}
      />
    </Card>
  );
}
