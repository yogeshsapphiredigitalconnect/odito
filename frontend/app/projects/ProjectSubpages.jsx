"use client";

import { useState, useEffect } from 'react';
import apiService from '@/lib/apiService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  ExternalLink,
  Search,
  Settings,
  Filter,
  ChevronDown,
  Star,
  Lock,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';

export default function ProjectSubpages({ projectId, projectName, onBack }) {
  const router = useRouter();
  const [subpages, setSubpages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('indexable');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('page_score');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showPremiumBanner, setShowPremiumBanner] = useState(true);
  const [projectStats, setProjectStats] = useState({
    crawled_pages: 0,
    found_pages: 0,
    analyzed_pages: 0
  });

  useEffect(() => {
    const fetchSubpages = async () => {
      try {
        setLoading(true);
        const filters = {
          filter: activeFilter,
          search: searchTerm,
          sortBy: sortBy,
          sortOrder: sortOrder
        };
        
        const response = await apiService.getProjectSubpages(projectId, filters);
        
        console.log('📊 API Response:', response);
        
        if (response.success) {
          console.log('📄 Subpages data:', response.data.subpages);
          console.log('📈 Project stats:', {
            crawled_pages: response.data.crawled_pages,
            found_pages: response.data.found_pages,
            analyzed_pages: response.data.analyzed_pages
          });
          
          setSubpages(response.data.subpages || []);
          setProjectStats({
            crawled_pages: response.data.crawled_pages || 0,
            found_pages: response.data.found_pages || 0,
            analyzed_pages: response.data.analyzed_pages || 0
          });
        } else {
          throw new Error(response.message || 'API response not successful');
        }
      } catch (error) {
        console.error('❌ Error fetching subpages:', error);
        setError(error.message || 'Failed to load subpages');
        // Set empty state on error
        setSubpages([]);
        setProjectStats({
          crawled_pages: 0,
          found_pages: 0,
          analyzed_pages: 0
        });
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchSubpages();
    }
  }, [projectId, activeFilter, searchTerm, sortBy, sortOrder]);

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getIssuesBadgeColor = (count) => {
    if (count === 0) return 'bg-green-100 text-green-800';
    if (count <= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const filteredSubpages = subpages.filter(page => {
    const matchesFilter = activeFilter === 'all' || 
      (activeFilter === 'indexable' && page.is_indexable) ||
      (activeFilter === 'not-indexable' && !page.is_indexable);
    
    const matchesSearch = !searchTerm || 
      page.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (page.page_title && page.page_title.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const sortedSubpages = [...filteredSubpages].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (aValue === null) aValue = -1;
    if (bValue === null) bValue = -1;
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handlePageClick = (page, event) => {
    event.preventDefault();
    // Navigate to the new page route instead of opening modal
    const encodedUrl = encodeURIComponent(page.url);
    router.push(`/projects/${projectId}/pages/${encodedUrl}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </Card>
          ))}
        </div>
        
        <Card className="p-6">
          <Skeleton className="h-8 w-full mb-4" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Subpages</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
        <div className="flex gap-2 justify-center mt-4">
          <Button variant="outline" onClick={onBack}>
            Back to Projects
          </Button>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Crawled pages</div>
          <div className="text-2xl font-bold">{projectStats.crawled_pages}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Indexed pages</div>
          <div className="text-2xl font-bold">{projectStats.found_pages}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Analyzed pages</div>
          <div className="text-2xl font-bold">{projectStats.analyzed_pages}</div>
        </Card>
      </div>

      {/* Premium Feature Banner */}
      {showPremiumBanner && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="h-6 w-6 text-yellow-500" />
              <div>
                <div className="font-semibold text-gray-900">Premium feature!</div>
                <div className="text-sm text-gray-600">Upgrade to unlock all your data!</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowPremiumBanner(false)}
                className="text-gray-500 hover:text-muted-foreground"
              >
                ×
              </Button>
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
                Upgrade now
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Filter Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex items-center gap-6">
          {['all', 'indexable', 'not-indexable', 'rankings', 'robots-txt-blocked'].map((filter) => (
            <Button
              key={filter}
              variant="ghost"
              className={`pb-3 cursor-pointer ${
                activeFilter === filter
                  ? 'text-blue-600 font-semibold border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1).replace('-', ' ')}
            </Button>
          ))}
        </div>
      </div>

      {/* Table Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Search subpages..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="page_score">Page Score</SelectItem>
              <SelectItem value="issues_count">Issues</SelectItem>
              <SelectItem value="url">URL</SelectItem>
              <SelectItem value="incoming_links">Incoming Links</SelectItem>
              <SelectItem value="outgoing_links">Outgoing Links</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm">
            Default
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Subpages Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left">
                  <Button 
                    variant="ghost" 
                    className="font-semibold text-xs uppercase text-muted-foreground h-auto p-0"
                    onClick={() => handleSort('page_score')}
                  >
                    Page score
                    {sortBy === 'page_score' && (
                      <ChevronDown className={`h-3 w-3 ml-1 inline ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                    )}
                  </Button>
                </th>
                <th className="px-4 py-3 text-left">
                  <Button 
                    variant="ghost" 
                    className="font-semibold text-xs uppercase text-muted-foreground h-auto p-0"
                    onClick={() => handleSort('url')}
                  >
                    URL
                    {sortBy === 'url' && (
                      <ChevronDown className={`h-3 w-3 ml-1 inline ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                    )}
                  </Button>
                </th>
                <th className="px-4 py-3 text-left">
                  <Button 
                    variant="ghost" 
                    className="font-semibold text-xs uppercase text-muted-foreground h-auto p-0"
                    onClick={() => handleSort('issues_count')}
                  >
                    Issues
                    {sortBy === 'issues_count' && (
                      <ChevronDown className={`h-3 w-3 ml-1 inline ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                    )}
                  </Button>
                </th>
                <th className="px-4 py-3 text-left font-semibold text-xs uppercase text-muted-foreground">CD</th>
                <th className="px-4 py-3 text-left font-semibold text-xs uppercase text-muted-foreground">Inc. links</th>
                <th className="px-4 py-3 text-left font-semibold text-xs uppercase text-muted-foreground">Out. links</th>
                <th className="px-4 py-3 text-left font-semibold text-xs uppercase text-muted-foreground">Ext. links</th>
                <th className="px-4 py-3 text-left font-semibold text-xs uppercase text-muted-foreground">Backlinks</th>
                <th className="px-4 py-3 text-left font-semibold text-xs uppercase text-muted-foreground">Rankings</th>
                <th className="px-4 py-3 text-left font-semibold text-xs uppercase text-muted-foreground">Page title</th>
              </tr>
            </thead>
            <tbody>
              {sortedSubpages.map((page, index) => (
                <tr 
                  key={page.id} 
                  className={`border-b border-border ${index % 2 === 0 ? 'bg-card' : 'bg-muted'} ${
                    page.is_premium ? 'relative' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    {page.is_premium ? (
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-400 text-sm">Premium</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getScoreColor(page.page_score)}`}
                            style={{ width: `${page.page_score}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{page.page_score}%</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-3 w-3 text-gray-400" />
                      <button
                        onClick={(e) => handlePageClick(page, e)}
                        className={`text-blue-600 hover:underline hover:text-blue-700 focus:underline focus:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 text-sm truncate max-w-xs text-left transition-colors ${
                          page.is_premium ? 'blur-sm text-gray-400' : ''
                        }`}
                        aria-label={`View page details for ${page.is_premium ? 'premium page' : page.url}`}
                        type="button"
                      >
                        {page.is_premium ? 'premium.example.com/page' : page.url}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {page.is_premium ? (
                      <div className="w-16 h-6 bg-muted rounded blur-sm"></div>
                    ) : (
                      <Badge className={getIssuesBadgeColor(page.issues_count)}>
                        {page.issues_count} Issues
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {page.is_premium ? (
                      <div className="w-4 h-4 bg-muted rounded blur-sm"></div>
                    ) : (
                      page.crawl_depth
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {page.is_premium ? (
                      <div className="w-8 h-4 bg-muted rounded blur-sm"></div>
                    ) : (
                      page.incoming_links
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {page.is_premium ? (
                      <div className="w-8 h-4 bg-muted rounded blur-sm"></div>
                    ) : (
                      page.outgoing_links
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {page.is_premium ? (
                      <div className="w-8 h-4 bg-muted rounded blur-sm"></div>
                    ) : (
                      page.external_links
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {page.is_premium ? (
                      <div className="w-8 h-4 bg-muted rounded blur-sm"></div>
                    ) : (
                      page.backlinks
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {page.is_premium ? (
                      <div className="w-8 h-4 bg-muted rounded blur-sm"></div>
                    ) : (
                      page.rankings
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {page.is_premium ? (
                      <div className="w-20 h-4 bg-muted rounded blur-sm"></div>
                    ) : (
                      page.page_title || 'No title'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Bottom Premium Banner */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">Try Seobility Premium now and unlock our complete toolset for more visibility!</div>
          </div>
          <Button className="bg-card text-primary hover:bg-muted border border-border">
            Try 14 days for free
          </Button>
        </div>
      </Card>

      {/* Help Button */}
      <div className="fixed bottom-6 right-6">
        <Button className="bg-blue-600 hover:bg-blue-700 rounded-full h-12 w-12 p-0 relative">
          <HelpCircle className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
        </Button>
      </div>
    </div>
  )
}
