import { useState } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatPanel } from './ChatPanel';
import { AgentStatus } from './AgentStatus';
import { ChecklistPanel } from './ChecklistPanel';
import { PreviewPanel } from './PreviewPanel';
import { FileBrowser } from './FileBrowser';
import { CodeEditor } from './CodeEditor';
import { DeployPanel } from './DeployPanel';
import { 
  MessageSquare, 
  Users, 
  CheckSquare, 
  Eye, 
  FolderTree, 
  Code2,
  Sparkles,
  Zap,
  Rocket
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Project, Agent, Message, ChecklistItem } from '@shared/schema';

interface WorkspaceContainerProps {
  project: Project;
  agents: Agent[];
  messages: Message[];
  checklist: ChecklistItem[];
  onSendMessage: (content: string) => void;
  onToggleChecklistItem?: (itemId: number) => void;
  onFileSelect?: (file: any) => void;
  onSaveFile?: (file: any) => void;
}

export function WorkspaceContainer({
  project,
  agents,
  messages,
  checklist,
  onSendMessage,
  onToggleChecklistItem,
  onFileSelect,
  onSaveFile
}: WorkspaceContainerProps) {
  const [mainTab, setMainTab] = useState('chat');
  const [rightTab, setRightTab] = useState('agents');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      {/* Left Panel - File Browser */}
      <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
        <div className="h-full bg-muted/30 border-r">
          <div className="h-12 px-3 flex items-center border-b bg-background">
            <FolderTree className="w-4 h-4 mr-2" />
            <span className="font-semibold text-sm">Project Files</span>
          </div>
          <FileBrowser 
            projectId={project.id} 
            onFileSelect={onFileSelect}
          />
        </div>
      </ResizablePanel>

      <ResizableHandle />

      {/* Main Content */}
      <ResizablePanel defaultSize={50}>
        <Tabs value={mainTab} onValueChange={setMainTab} className="h-full flex flex-col">
          <div className="border-b bg-background">
            <TabsList className="w-full justify-start h-12 p-0 bg-transparent">
              <TabsTrigger 
                value="chat" 
                className="data-[state=active]:bg-muted rounded-none h-12 px-4"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                AI Chat
              </TabsTrigger>
              <TabsTrigger 
                value="code" 
                className="data-[state=active]:bg-muted rounded-none h-12 px-4"
              >
                <Code2 className="w-4 h-4 mr-2" />
                Code Editor
              </TabsTrigger>
              <TabsTrigger 
                value="preview" 
                className="data-[state=active]:bg-muted rounded-none h-12 px-4"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </TabsTrigger>
              <div className="ml-auto px-4 flex items-center gap-2">
                <button className="p-2 hover:bg-accent rounded transition-colors">
                  <Sparkles className="w-4 h-4 text-primary" />
                </button>
                <button className="p-2 hover:bg-accent rounded transition-colors">
                  <Zap className="w-4 h-4 text-yellow-500" />
                </button>
              </div>
            </TabsList>
          </div>

          <TabsContent value="chat" className="flex-1 m-0">
            <ChatPanel
              messages={messages}
              onSendMessage={onSendMessage}
              isLoading={false}
            />
          </TabsContent>

          <TabsContent value="code" className="flex-1 m-0">
            <CodeEditor
              projectId={project.id}
              onSave={onSaveFile}
            />
          </TabsContent>

          <TabsContent value="preview" className="flex-1 m-0">
            <PreviewPanel
              projectId={project.id}
              isGenerating={isGeneratingCode}
            />
          </TabsContent>
        </Tabs>
      </ResizablePanel>

      <ResizableHandle />

      {/* Right Panel */}
      <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
        <Tabs value={rightTab} onValueChange={setRightTab} className="h-full flex flex-col">
          <div className="border-b bg-background">
            <TabsList className="w-full h-12 p-0 bg-transparent">
              <TabsTrigger 
                value="agents" 
                className="flex-1 data-[state=active]:bg-muted rounded-none h-12"
              >
                <Users className="w-4 h-4 mr-2" />
                Agents
              </TabsTrigger>
              <TabsTrigger 
                value="checklist" 
                className="flex-1 data-[state=active]:bg-muted rounded-none h-12"
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                Checklist
              </TabsTrigger>
              <TabsTrigger 
                value="deploy" 
                className="flex-1 data-[state=active]:bg-muted rounded-none h-12"
              >
                <Rocket className="w-4 h-4 mr-2" />
                Deploy
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="agents" className="flex-1 m-0">
            <AgentStatus agents={agents} />
          </TabsContent>

          <TabsContent value="checklist" className="flex-1 m-0">
            <ChecklistPanel 
              items={checklist} 
              projectProgress={project.progress || 0}
              onToggleItem={onToggleChecklistItem}
            />
          </TabsContent>
          
          <TabsContent value="deploy" className="flex-1 m-0">
            <DeployPanel
              projectId={project.id}
              projectName={project.name}
              isReady={project.progress && project.progress >= 80}
            />
          </TabsContent>
        </Tabs>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}