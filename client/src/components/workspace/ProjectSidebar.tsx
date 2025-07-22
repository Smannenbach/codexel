import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FolderOpen, Loader2, Search, Globe, User, Store, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Project } from '@shared/schema';

interface ProjectSidebarProps {
  projects: Project[];
  selectedProjectId: number | null;
  onSelectProject: (id: number) => void;
  onCreateProject: (name: string, description: string) => Promise<void>;
  isLoading: boolean;
}

const projectTemplates = [
  {
    id: 'business-website',
    name: 'Business Website',
    description: 'Professional website for your business with contact forms, services, and about pages',
    icon: Briefcase,
    color: 'bg-blue-500'
  },
  {
    id: 'personal-website',
    name: 'Personal Website',
    description: 'Portfolio or personal site with blog, projects, and resume sections',
    icon: User,
    color: 'bg-green-500'
  },
  {
    id: 'ecommerce',
    name: 'E-commerce Store',
    description: 'Online store with product catalog, shopping cart, and payment integration',
    icon: Store,
    color: 'bg-purple-500'
  },
  {
    id: 'web-app',
    name: 'Web Application',
    description: 'Custom web application with user authentication and database',
    icon: Globe,
    color: 'bg-orange-500'
  }
];

export function ProjectSidebar({
  projects,
  selectedProjectId,
  onSelectProject,
  onCreateProject,
  isLoading
}: ProjectSidebarProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    setIsCreating(true);
    try {
      await onCreateProject(newProjectName, newProjectDescription);
      setIsCreateDialogOpen(false);
      setNewProjectName('');
      setNewProjectDescription('');
      setSelectedTemplate(null);
    } finally {
      setIsCreating(false);
    }
  };

  const handleTemplateSelect = (template: typeof projectTemplates[0]) => {
    setSelectedTemplate(template.id);
    setNewProjectName(template.name);
    setNewProjectDescription(template.description);
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-muted/50">
      <div className="p-4 border-b">
        <Button 
          className="w-full" 
          onClick={() => setIsCreateDialogOpen(true)}
          disabled={isLoading}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-8 px-4">
              <FolderOpen className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {searchTerm ? 'No projects match your search.' : 'No projects yet. Create your first one!'}
              </p>
            </div>
          ) : (
            filteredProjects.map((project) => (
              <button
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  selectedProjectId === project.id && "bg-accent text-accent-foreground"
                )}
              >
                <div className="font-medium text-sm">{project.name}</div>
                {project.description && (
                  <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {project.description}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground capitalize">
                    {project.status}
                  </span>
                  {project.progress > 0 && (
                    <span className="text-xs text-muted-foreground">
                      • {project.progress}%
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label>Choose a Template</Label>
              <div className="grid grid-cols-2 gap-3">
                {projectTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      selectedTemplate === template.id && "ring-2 ring-primary"
                    )}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <div className={cn("p-2 rounded-md text-white", template.color)}>
                          <template.icon className="w-4 h-4" />
                        </div>
                        <CardTitle className="text-sm">{template.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="text-xs leading-relaxed">
                        {template.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="My Awesome Project"
                disabled={isCreating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="A brief description of what you want to build..."
                rows={3}
                disabled={isCreating}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setSelectedTemplate(null);
                setNewProjectName('');
                setNewProjectDescription('');
              }}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={!newProjectName.trim() || isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}