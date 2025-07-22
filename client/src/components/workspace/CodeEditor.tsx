import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Save, 
  Copy, 
  Download, 
  X, 
  Check,
  Loader2,
  FileCode2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OpenFile {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  isDirty: boolean;
}

interface CodeEditorProps {
  projectId: number;
  onSave?: (file: OpenFile) => void;
}

export function CodeEditor({ projectId, onSave }: CodeEditorProps) {
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([
    // Mock open files
    {
      id: 'src/App.tsx',
      name: 'App.tsx',
      path: '/src/App.tsx',
      content: `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to Codexel</h1>
        <p>Build amazing apps with AI assistance</p>
      </header>
    </div>
  );
}

export default App;`,
      language: 'typescript',
      isDirty: false
    }
  ]);
  const [activeFileId, setActiveFileId] = useState<string | null>('src/App.tsx');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeFile = openFiles.find(f => f.id === activeFileId);

  const handleContentChange = (newContent: string) => {
    if (!activeFile) return;

    setOpenFiles(files => 
      files.map(f => 
        f.id === activeFile.id 
          ? { ...f, content: newContent, isDirty: true }
          : f
      )
    );
  };

  const handleSave = async () => {
    if (!activeFile) return;

    setSaving(true);
    try {
      await onSave?.(activeFile);
      setOpenFiles(files => 
        files.map(f => 
          f.id === activeFile.id 
            ? { ...f, isDirty: false }
            : f
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    if (!activeFile) return;
    
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCloseFile = (fileId: string) => {
    setOpenFiles(files => files.filter(f => f.id !== fileId));
    if (activeFileId === fileId) {
      const remainingFiles = openFiles.filter(f => f.id !== fileId);
      setActiveFileId(remainingFiles[0]?.id || null);
    }
  };

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      typescript: 'text-blue-500',
      javascript: 'text-yellow-500',
      css: 'text-pink-500',
      html: 'text-orange-500',
      python: 'text-green-500',
      json: 'text-gray-500',
    };
    return colors[language] || 'text-gray-500';
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {openFiles.length > 0 ? (
        <>
          <div className="border-b">
            <div className="flex items-center">
              <div className="flex-1 overflow-x-auto">
                <div className="flex">
                  {openFiles.map((file) => (
                    <div
                      key={file.id}
                      className={cn(
                        "px-3 py-2 border-r cursor-pointer hover:bg-accent/50 transition-colors flex items-center gap-2 group",
                        activeFileId === file.id && "bg-accent"
                      )}
                      onClick={() => setActiveFileId(file.id)}
                    >
                      <FileCode2 className={cn("w-4 h-4", getLanguageColor(file.language))} />
                      <span className="text-sm">{file.name}</span>
                      {file.isDirty && (
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCloseFile(file.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-2 px-3">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSave}
                  disabled={!activeFile?.isDirty || saving}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {activeFile && (
            <div className="flex-1 flex flex-col">
              <div className="px-4 py-2 bg-muted/50 flex items-center justify-between">
                <span className="text-sm text-muted-foreground font-mono">
                  {activeFile.path}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {activeFile.language}
                </Badge>
              </div>
              
              <div className="flex-1 p-4">
                <textarea
                  ref={textareaRef}
                  value={activeFile.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="w-full h-full bg-transparent font-mono text-sm resize-none focus:outline-none"
                  spellCheck={false}
                />
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <FileCode2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No files open</p>
            <p className="text-xs mt-1">Select a file from the file browser</p>
          </div>
        </div>
      )}
    </div>
  );
}