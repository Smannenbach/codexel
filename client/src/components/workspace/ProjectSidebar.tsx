import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, FolderOpen, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Project } from '@shared/schema';

interface ProjectSidebarProps {
  projects: Project[];
  selectedProjectId: number | null;
  onSelectProject: (id: number) => void;
  onCreateProject: (name: string, description: string) => Promise<void>;
  isLoading: boolean;
}

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

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    setIsCreating(true);
    try {
      await onCreateProject(newProjectName, newProjectDescription);
      setIsCreateDialogOpen(false);
      setNewProjectName('');
      setNewProjectDescription('');
    } finally {
      setIsCreating(false);
    }
  };

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

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8 px-4">
              <FolderOpen className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No projects yet. Create your first one!
              </p>
            </div>
          ) : (
            projects.map((project) => (
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="My Awesome App"
                disabled={isCreating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-description">Description (Optional)</Label>
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
              onClick={() => setIsCreateDialogOpen(false)}
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