import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { cn } from '@/lib/utils';

interface WorkspaceLayoutProps {
  className?: string;
  sidebar?: React.ReactNode;
  mainContent?: React.ReactNode;
  rightPanel?: React.ReactNode;
}

export function WorkspaceLayout({ 
  className, 
  sidebar, 
  mainContent, 
  rightPanel 
}: WorkspaceLayoutProps) {
  return (
    <div className={cn("h-screen w-full overflow-hidden bg-background", className)}>
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Sidebar */}
        {sidebar && (
          <>
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
              {sidebar}
            </ResizablePanel>
            <ResizableHandle />
          </>
        )}

        {/* Main Content */}
        <ResizablePanel defaultSize={rightPanel ? 60 : 80}>
          {mainContent}
        </ResizablePanel>

        {/* Right Panel */}
        {rightPanel && (
          <>
            <ResizableHandle />
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
              {rightPanel}
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
}