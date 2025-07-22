import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Code2, 
  Play, 
  Save, 
  Download, 
  Share2, 
  History, 
  Eye,
  Edit3,
  MessageSquare,
  Sparkles,
  Bug,
  FileText,
  Palette,
  Settings,
  Maximize2,
  Copy,
  Check,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CanvasVersion {
  id: string;
  timestamp: Date;
  content: string;
  type: 'code' | 'text';
  description: string;
}

interface CanvasComment {
  id: string;
  line: number;
  text: string;
  type: 'suggestion' | 'bug' | 'improvement';
  timestamp: Date;
  resolved: boolean;
}

interface CanvasInterfaceProps {
  initialContent?: string;
  contentType: 'code' | 'text';
  language?: string;
  onContentChange: (content: string) => void;
  onSendMessage: (message: string) => void;
  isExecuting?: boolean;
}

export function CanvasInterface({
  initialContent = '',
  contentType = 'code',
  language = 'typescript',
  onContentChange,
  onSendMessage,
  isExecuting = false
}: CanvasInterfaceProps) {
  const [content, setContent] = useState(initialContent);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [versions, setVersions] = useState<CanvasVersion[]>([]);
  const [comments, setComments] = useState<CanvasComment[]>([]);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Canvas actions similar to ChatGPT Canvas
  const canvasActions = {
    code: [
      { id: 'review', label: 'Review Code', icon: Eye, description: 'Get AI feedback on code quality' },
      { id: 'debug', label: 'Debug & Fix', icon: Bug, description: 'Find and fix bugs automatically' },
      { id: 'comments', label: 'Add Comments', icon: FileText, description: 'Generate documentation' },
      { id: 'optimize', label: 'Optimize', icon: Sparkles, description: 'Improve performance and readability' },
      { id: 'convert', label: 'Convert Language', icon: Code2, description: 'Port to another language' },
      { id: 'test', label: 'Add Tests', icon: Settings, description: 'Generate unit tests' }
    ],
    text: [
      { id: 'polish', label: 'Polish', icon: Sparkles, description: 'Improve grammar and clarity' },
      { id: 'adjust-length', label: 'Adjust Length', icon: Edit3, description: 'Make shorter or longer' },
      { id: 'reading-level', label: 'Reading Level', icon: FileText, description: 'Adjust complexity' },
      { id: 'translate', label: 'Translate', icon: Globe, description: 'Convert to another language' },
      { id: 'style', label: 'Change Style', icon: Palette, description: 'Adjust tone and voice' },
      { id: 'format', label: 'Format', icon: Settings, description: 'Structure and organize' }
    ]
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    onContentChange(newContent);
  };

  const handleActionClick = (actionId: string) => {
    const action = canvasActions[contentType].find(a => a.id === actionId);
    if (action) {
      let prompt = '';
      
      switch (actionId) {
        case 'review':
          prompt = `Please review this ${contentType} and provide suggestions for improvement:\n\n${content}`;
          break;
        case 'debug':
          prompt = `Find and fix any bugs in this code:\n\n${content}`;
          break;
        case 'comments':
          prompt = `Add helpful comments and documentation to this code:\n\n${content}`;
          break;
        case 'optimize':
          prompt = `Optimize this code for better performance and readability:\n\n${content}`;
          break;
        case 'polish':
          prompt = `Polish this text for better grammar, clarity, and flow:\n\n${content}`;
          break;
        case 'adjust-length':
          prompt = `Make this text more concise while keeping the key information:\n\n${content}`;
          break;
        default:
          prompt = `Apply "${action.label}" to this ${contentType}:\n\n${content}`;
      }
      
      onSendMessage(prompt);
    }
  };

  const handleExecuteCode = () => {
    if (contentType === 'code') {
      onSendMessage(`Execute this ${language} code and show the output:\n\n${content}`);
    }
  };

  const saveVersion = () => {
    const newVersion: CanvasVersion = {
      id: `v${Date.now()}`,
      timestamp: new Date(),
      content,
      type: contentType,
      description: `Version saved at ${new Date().toLocaleTimeString()}`
    };
    setVersions([newVersion, ...versions]);
  };

  const restoreVersion = (version: CanvasVersion) => {
    setContent(version.content);
    onContentChange(version.content);
    setShowVersionHistory(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const addComment = (line: number, text: string, type: 'suggestion' | 'bug' | 'improvement') => {
    const newComment: CanvasComment = {
      id: `comment-${Date.now()}`,
      line,
      text,
      type,
      timestamp: new Date(),
      resolved: false
    };
    setComments([...comments, newComment]);
  };

  // Calculate line numbers for content
  const lines = content.split('\n');
  const lineCount = lines.length;

  return (
    <div className={cn(
      "relative bg-background border rounded-lg",
      isFullscreen && "fixed inset-0 z-50 rounded-none"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {contentType === 'code' ? (
              <Code2 className="w-5 h-5 text-primary" />
            ) : (
              <FileText className="w-5 h-5 text-primary" />
            )}
            <h3 className="font-semibold">
              {contentType === 'code' ? 'Code Canvas' : 'Writing Canvas'}
            </h3>
          </div>
          {language && contentType === 'code' && (
            <Badge variant="secondary">{language}</Badge>
          )}
          <Badge variant="outline">{lineCount} lines</Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowVersionHistory(!showVersionHistory)}
          >
            <History className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex h-[600px]">
        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Action Bar */}
          <div className="p-3 border-b bg-muted/30">
            <div className="flex flex-wrap gap-2">
              {canvasActions[contentType].map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleActionClick(action.id)}
                    className="text-xs"
                    title={action.description}
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    {action.label}
                  </Button>
                );
              })}
              
              {contentType === 'code' && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleExecuteCode}
                  disabled={isExecuting}
                  className="text-xs ml-auto"
                >
                  <Play className="w-3 h-3 mr-1" />
                  {isExecuting ? 'Running...' : 'Execute'}
                </Button>
              )}
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              className={cn(
                "w-full h-full resize-none border-0 rounded-none font-mono text-sm",
                "focus:ring-0 focus:border-0 p-4"
              )}
              placeholder={
                contentType === 'code' 
                  ? "Start coding here. Use the action buttons above for AI assistance..."
                  : "Start writing here. Use the action buttons above to improve your text..."
              }
              style={{
                lineHeight: '1.5',
                tabSize: 2
              }}
            />

            {/* Line numbers (for code) */}
            {contentType === 'code' && content && (
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-muted/50 border-r flex flex-col text-xs text-muted-foreground font-mono">
                <div className="p-4 pt-4">
                  {lines.map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        "text-right leading-6 cursor-pointer hover:bg-muted",
                        selectedLine === index + 1 && "bg-primary/20"
                      )}
                      onClick={() => setSelectedLine(index + 1)}
                    >
                      {index + 1}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comments overlay */}
            {comments.length > 0 && (
              <div className="absolute right-0 top-0 bottom-0 w-64 bg-background border-l">
                <div className="p-3 border-b">
                  <h4 className="font-medium text-sm">Comments</h4>
                </div>
                <ScrollArea className="h-full">
                  <div className="p-3 space-y-3">
                    {comments.map((comment) => (
                      <Card key={comment.id} className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            Line {comment.line}
                          </Badge>
                          <Badge 
                            variant={comment.type === 'bug' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {comment.type}
                          </Badge>
                        </div>
                        <p className="text-sm">{comment.text}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {comment.timestamp.toLocaleTimeString()}
                        </p>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{content.length} characters</span>
              <span>{content.split(/\s+/).filter(word => word.length > 0).length} words</span>
              {contentType === 'code' && <span>{lineCount} lines</span>}
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={saveVersion}>
                <Save className="w-4 h-4 mr-1" />
                Save Version
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Version History Sidebar */}
        {showVersionHistory && (
          <div className="w-80 border-l bg-background">
            <div className="p-4 border-b">
              <h4 className="font-semibold">Version History</h4>
            </div>
            <ScrollArea className="h-full">
              <div className="p-4 space-y-3">
                {versions.map((version) => (
                  <Card key={version.id} className="p-3 cursor-pointer hover:bg-muted/50"
                        onClick={() => restoreVersion(version)}>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{version.id}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {version.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm">{version.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {version.content.length} chars, {version.content.split('\n').length} lines
                    </p>
                  </Card>
                ))}
                
                {versions.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No versions saved yet</p>
                    <p className="text-xs">Click "Save Version" to create snapshots</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}