import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { 
  FileCode2, 
  Folder, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown, 
  Plus,
  FileText,
  FileJson,
  FileType,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
  language?: string;
  content?: string;
}

interface FileBrowserProps {
  projectId: number;
  onFileSelect?: (file: FileNode) => void;
  onCreateFile?: (path: string, name: string) => void;
}

export function FileBrowser({ projectId, onFileSelect, onCreateFile }: FileBrowserProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src']));
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock file structure - would come from API
  const fileTree: FileNode[] = [
    {
      id: 'src',
      name: 'src',
      type: 'folder',
      path: '/src',
      children: [
        {
          id: 'src/components',
          name: 'components',
          type: 'folder',
          path: '/src/components',
          children: [
            {
              id: 'src/components/App.tsx',
              name: 'App.tsx',
              type: 'file',
              path: '/src/components/App.tsx',
              language: 'typescript'
            },
            {
              id: 'src/components/Header.tsx',
              name: 'Header.tsx',
              type: 'file',
              path: '/src/components/Header.tsx',
              language: 'typescript'
            }
          ]
        },
        {
          id: 'src/index.tsx',
          name: 'index.tsx',
          type: 'file',
          path: '/src/index.tsx',
          language: 'typescript'
        },
        {
          id: 'src/styles.css',
          name: 'styles.css',
          type: 'file',
          path: '/src/styles.css',
          language: 'css'
        }
      ]
    },
    {
      id: 'package.json',
      name: 'package.json',
      type: 'file',
      path: '/package.json',
      language: 'json'
    },
    {
      id: 'README.md',
      name: 'README.md',
      type: 'file',
      path: '/README.md',
      language: 'markdown'
    }
  ];

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleFileClick = (file: FileNode) => {
    if (file.type === 'file') {
      setSelectedFile(file.id);
      onFileSelect?.(file);
    } else {
      toggleFolder(file.id);
    }
  };

  const getFileIcon = (file: FileNode) => {
    if (file.type === 'folder') {
      return expandedFolders.has(file.id) ? 
        <FolderOpen className="w-4 h-4" /> : 
        <Folder className="w-4 h-4" />;
    }

    switch (file.language) {
      case 'typescript':
      case 'javascript':
        return <FileCode2 className="w-4 h-4 text-blue-500" />;
      case 'json':
        return <FileJson className="w-4 h-4 text-yellow-500" />;
      case 'markdown':
        return <FileText className="w-4 h-4 text-gray-500" />;
      default:
        return <FileType className="w-4 h-4 text-gray-400" />;
    }
  };

  const renderFileTree = (nodes: FileNode[], level = 0) => {
    return nodes.map((node) => {
      const isExpanded = expandedFolders.has(node.id);
      const isSelected = selectedFile === node.id;

      if (searchQuery && !node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return null;
      }

      return (
        <div key={node.id}>
          <div
            className={cn(
              "flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-accent rounded transition-colors",
              isSelected && "bg-accent",
              level > 0 && "ml-4"
            )}
            onClick={() => handleFileClick(node)}
          >
            {node.type === 'folder' && (
              <div className="p-0.5">
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </div>
            )}
            {node.type === 'file' && <div className="w-4" />}
            {getFileIcon(node)}
            <span className="text-sm flex-1">{node.name}</span>
          </div>

          {node.type === 'folder' && isExpanded && node.children && (
            <div>{renderFileTree(node.children, level + 1)}</div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="h-full flex flex-col bg-muted/30">
      <div className="p-3 border-b space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">File Explorer</h3>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {renderFileTree(fileTree)}
        </div>
      </ScrollArea>
    </div>
  );
}