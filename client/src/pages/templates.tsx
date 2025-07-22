import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Building2, 
  User, 
  Home, 
  TrendingUp, 
  Hotel, 
  ShoppingCart,
  Building,
  Stethoscope,
  Scale,
  GraduationCap,
  Car,
  Dumbbell,
  ArrowRight,
  Clock,
  Star
} from 'lucide-react';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { 
  projectTemplates, 
  getCategories, 
  getTemplatesByCategory,
  getIndividualTemplates,
  getCompanyTemplates,
  type ProjectTemplate 
} from '@shared/templates';

// Icon mapping for categories
const categoryIcons: Record<string, any> = {
  'Real Estate': Home,
  'Financial Services': TrendingUp,
  'Hospitality': Hotel,
  'Retail': ShoppingCart,
  'Construction': Building,
  'Healthcare': Stethoscope,
  'Legal': Scale,
  'Education': GraduationCap,
  'Automotive': Car,
  'Fitness': Dumbbell
};

export default function TemplatesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [, setLocation] = useLocation();

  const categories = getCategories();
  
  // Filter templates based on search and category
  const filteredTemplates = projectTemplates.filter(template => {
    const matchesSearch = searchTerm === '' || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (template.targetRole && template.targetRole.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = (template: ProjectTemplate) => {
    // Navigate to workspace with template
    setLocation(`/workspace?template=${template.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3">Industry-Specific Templates</h1>
          <p className="text-xl text-muted-foreground">
            Choose from {projectTemplates.length}+ professional templates designed for your industry
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search by industry, role, or template name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
            className="mb-2"
          >
            All Categories
          </Button>
          {categories.map(category => {
            const Icon = categoryIcons[category] || Building2;
            const count = getTemplatesByCategory(category).length;
            return (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="mb-2"
              >
                <Icon className="w-4 h-4 mr-1" />
                {category}
                <Badge variant="secondary" className="ml-2">
                  {count}
                </Badge>
              </Button>
            );
          })}
        </div>

        {/* Templates Grid */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-6">
            <TabsTrigger value="all">All Templates</TabsTrigger>
            <TabsTrigger value="company">Companies</TabsTrigger>
            <TabsTrigger value="individual">Individuals</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <TemplateGrid templates={filteredTemplates} onSelectTemplate={handleUseTemplate} />
          </TabsContent>

          <TabsContent value="company">
            <TemplateGrid 
              templates={filteredTemplates.filter(t => !t.targetRole)} 
              onSelectTemplate={handleUseTemplate} 
            />
          </TabsContent>

          <TabsContent value="individual">
            <TemplateGrid 
              templates={filteredTemplates.filter(t => t.targetRole)} 
              onSelectTemplate={handleUseTemplate} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function TemplateGrid({ 
  templates, 
  onSelectTemplate 
}: { 
  templates: ProjectTemplate[];
  onSelectTemplate: (template: ProjectTemplate) => void;
}) {
  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No templates found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map(template => {
        const Icon = categoryIcons[template.category] || Building2;
        
        return (
          <Card 
            key={template.id} 
            className="hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => onSelectTemplate(template)}
          >
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <div className={cn(
                  "p-3 rounded-lg text-white",
                  template.category === 'Real Estate' && 'bg-blue-500',
                  template.category === 'Financial Services' && 'bg-green-500',
                  template.category === 'Hospitality' && 'bg-purple-500',
                  template.category === 'Retail' && 'bg-orange-500',
                  template.category === 'Construction' && 'bg-yellow-500',
                  template.category === 'Healthcare' && 'bg-red-500',
                  template.category === 'Legal' && 'bg-indigo-500',
                  template.category === 'Education' && 'bg-pink-500',
                  template.category === 'Automotive' && 'bg-gray-500',
                  template.category === 'Fitness' && 'bg-teal-500'
                )}>
                  <Icon className="w-6 h-6" />
                </div>
                {template.targetRole ? (
                  <Badge variant="secondary">
                    <User className="w-3 h-3 mr-1" />
                    Individual
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <Building2 className="w-3 h-3 mr-1" />
                    Company
                  </Badge>
                )}
              </div>
              
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {template.name}
              </CardTitle>
              
              <div className="flex flex-wrap gap-1 mt-2">
                <Badge variant="outline" className="text-xs">
                  {template.industry}
                </Badge>
                {template.targetRole && (
                  <Badge variant="outline" className="text-xs">
                    {template.targetRole}
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              <CardDescription className="line-clamp-3 mb-4">
                {template.description}
              </CardDescription>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 mr-2" />
                  {template.estimatedTime}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Star className="w-4 h-4 mr-2" />
                  {template.difficulty}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {template.features.slice(0, 3).map((feature, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {template.features.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{template.features.length - 3} more
                  </Badge>
                )}
              </div>
              
              <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                Use This Template
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}