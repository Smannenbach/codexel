import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Upload, 
  Star, 
  Search, 
  Filter, 
  Grid3X3, 
  Layout,
  TrendingUp,
  Award,
  Sparkles,
  Save,
  Share2,
  Eye,
  Heart,
  MessageSquare,
  Clock,
  Users
} from 'lucide-react';
import type { WorkspaceLayout } from '@shared/schema';

// Business categories for filtering
const BUSINESS_CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'legal', label: 'Legal Services' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Financial Services' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'retail', label: 'Retail & E-commerce' },
  { value: 'technology', label: 'Technology' },
  { value: 'creative', label: 'Creative & Design' },
  { value: 'education', label: 'Education' },
  { value: 'nonprofit', label: 'Nonprofit' },
];

export default function LayoutMarketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'rating'>('popular');
  const [activeTab, setActiveTab] = useState<'browse' | 'my-layouts'>('browse');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch public layouts
  const { data: layouts, isLoading } = useQuery<WorkspaceLayout[]>({
    queryKey: ['/api/layouts', selectedCategory, sortBy, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({
        category: selectedCategory,
        sort: sortBy,
        q: searchQuery,
      });
      const response = await apiRequest('GET', `/api/layouts?${params}`);
      return response.json();
    },
  });

  // Fetch user's layouts
  const { data: myLayouts } = useQuery<WorkspaceLayout[]>({
    queryKey: ['/api/layouts/my-layouts'],
    enabled: activeTab === 'my-layouts',
  });

  // Download layout mutation
  const downloadLayout = useMutation({
    mutationFn: async (layoutId: number) => {
      const response = await apiRequest('POST', `/api/layouts/${layoutId}/download`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Layout Downloaded",
        description: "The workspace layout has been applied successfully!",
      });
      // Apply the layout configuration
      if (data.configuration) {
        localStorage.setItem('workspace-layout', JSON.stringify(data.configuration));
        window.location.href = '/workspace';
      }
    },
  });

  // Rate layout mutation
  const rateLayout = useMutation({
    mutationFn: async ({ layoutId, rating, comment }: { layoutId: number; rating: number; comment?: string }) => {
      return apiRequest('POST', `/api/layouts/${layoutId}/rate`, { rating, comment });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/layouts'] });
      toast({
        title: "Rating Submitted",
        description: "Thank you for your feedback!",
      });
    },
  });

  const formatDownloads = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  const renderLayoutCard = (layout: WorkspaceLayout) => (
    <motion.div
      key={layout.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <Card className="h-full bg-gray-900/50 border-gray-800 hover:border-purple-600/50 transition-all duration-300 backdrop-blur-sm">
        <CardHeader className="space-y-2">
          {/* Preview Image */}
          <div className="relative h-48 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-lg bg-gray-800">
            {layout.preview ? (
              <img 
                src={layout.preview} 
                alt={layout.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Grid3X3 className="w-12 h-12 text-gray-600" />
              </div>
            )}
            
            {/* Overlay Stats */}
            <div className="absolute top-2 right-2 flex gap-2">
              <Badge variant="secondary" className="bg-black/50 backdrop-blur-sm">
                <Download className="w-3 h-3 mr-1" />
                {formatDownloads(layout.downloads || 0)}
              </Badge>
              <Badge variant="secondary" className="bg-black/50 backdrop-blur-sm">
                <Star className="w-3 h-3 mr-1 text-yellow-500" />
                {(layout.rating || 0).toFixed(1)}
              </Badge>
            </div>

            {/* Business Type Badge */}
            <div className="absolute bottom-2 left-2">
              <Badge className="bg-purple-600/80 backdrop-blur-sm">
                {layout.businessType}
              </Badge>
            </div>
          </div>

          <div className="space-y-1">
            <CardTitle className="text-lg line-clamp-1">{layout.name}</CardTitle>
            <CardDescription className="line-clamp-2 text-sm">
              {layout.description}
            </CardDescription>
          </div>

          {/* Tags */}
          {layout.tags && layout.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-2">
              {layout.tags.slice(0, 3).map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {layout.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{layout.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Author Info */}
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>by {layout.userId}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{layout.createdAt ? new Date(layout.createdAt).toLocaleDateString() : 'Recently'}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={() => downloadLayout.mutate(layout.id)}
              disabled={downloadLayout.isPending}
            >
              <Download className="w-4 h-4 mr-2" />
              Use Layout
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                // Preview functionality
                toast({
                  title: "Preview Mode",
                  description: "Preview functionality coming soon!",
                });
              }}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-b from-purple-900/20 to-transparent border-b border-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Layout Marketplace
              </h1>
              <p className="text-gray-400 mt-2">
                Discover and share specialized workspace configurations
              </p>
            </div>
            
            <Button
              onClick={() => window.location.href = '/workspace'}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              Share Your Layout
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search layouts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px] bg-gray-800 border-gray-700">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger className="w-full md:w-[150px] bg-gray-800 border-gray-700">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="browse" className="data-[state=active]:bg-purple-600">
              <Layout className="w-4 h-4 mr-2" />
              Browse Layouts
            </TabsTrigger>
            <TabsTrigger value="my-layouts" className="data-[state=active]:bg-purple-600">
              <Save className="w-4 h-4 mr-2" />
              My Layouts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Featured Section */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h2 className="text-2xl font-semibold">Featured Layouts</h2>
              </div>
              
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i} className="h-[400px] bg-gray-900/50 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <AnimatePresence>
                    {layouts?.slice(0, 4).map(renderLayoutCard)}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* All Layouts */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Grid3X3 className="w-5 h-5 text-blue-400" />
                <h2 className="text-2xl font-semibold">All Layouts</h2>
              </div>
              
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto" />
                </div>
              ) : layouts?.length === 0 ? (
                <Card className="bg-gray-900/50 border-gray-800 p-12 text-center">
                  <Layout className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No layouts found. Be the first to share!</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <AnimatePresence>
                    {layouts?.map(renderLayoutCard)}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="my-layouts" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {myLayouts?.length === 0 ? (
                <Card className="col-span-full bg-gray-900/50 border-gray-800 p-12 text-center">
                  <Save className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">You haven't saved any layouts yet</p>
                  <Button onClick={() => window.location.href = '/workspace'}>
                    Create Your First Layout
                  </Button>
                </Card>
              ) : (
                myLayouts?.map(renderLayoutCard)
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}