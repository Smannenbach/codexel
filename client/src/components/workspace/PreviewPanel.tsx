import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileCode2, Globe, Terminal, Copy, Check, ExternalLink, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PreviewPanelProps {
  projectId: number;
  isGenerating?: boolean;
}

interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export function PreviewPanel({ projectId, isGenerating }: PreviewPanelProps) {
  const [activeTab, setActiveTab] = useState('preview');
  const [copied, setCopied] = useState<string | null>(null);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([
    // Mock data - would come from API
    {
      path: 'src/App.tsx',
      content: `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to Your App</h1>
        <p>Start editing to see some magic happen!</p>
      </header>
    </div>
  );
}

export default App;`,
      language: 'typescript'
    },
    {
      path: 'src/App.css',
      content: `.App {
  text-align: center;
}

.App-header {
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
}`,
      language: 'css'
    }
  ]);

  const handleCopy = (content: string, path: string) => {
    navigator.clipboard.writeText(content);
    setCopied(path);
    setTimeout(() => setCopied(null), 2000);
  };

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      typescript: 'bg-blue-500',
      javascript: 'bg-yellow-500',
      css: 'bg-pink-500',
      html: 'bg-orange-500',
      python: 'bg-green-500',
      json: 'bg-gray-500',
    };
    return colors[language] || 'bg-gray-500';
  };

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full">
          <TabsTrigger value="preview" className="flex-1">
            <Globe className="w-4 h-4 mr-2" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="code" className="flex-1">
            <FileCode2 className="w-4 h-4 mr-2" />
            Code
          </TabsTrigger>
          <TabsTrigger value="terminal" className="flex-1">
            <Terminal className="w-4 h-4 mr-2" />
            Terminal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="flex-1 p-4">
          <Card className="h-full">
            {isGenerating ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-sm text-muted-foreground">Generating preview...</p>
                </div>
              </div>
            ) : (
              <div className="h-full relative">
                <div className="absolute top-2 right-2 z-10">
                  <Button size="sm" variant="secondary">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in new tab
                  </Button>
                </div>
                <iframe
                  src="about:blank"
                  className="w-full h-full border-0 rounded"
                  title="App Preview"
                />
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="code" className="flex-1 p-4">
          <ScrollArea className="h-full">
            <div className="space-y-4">
              {generatedFiles.map((file) => (
                <Card key={file.path} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileCode2 className="w-4 h-4 text-muted-foreground" />
                      <span className="font-mono text-sm">{file.path}</span>
                      <Badge 
                        variant="secondary" 
                        className={cn("text-xs text-white", getLanguageColor(file.language))}
                      >
                        {file.language}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopy(file.content, file.path)}
                    >
                      {copied === file.path ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <pre className="bg-muted p-3 rounded overflow-x-auto">
                    <code className="text-xs">{file.content}</code>
                  </pre>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="terminal" className="flex-1 p-4">
          <Card className="h-full bg-black text-green-400 font-mono p-4">
            <div className="space-y-2 text-sm">
              <div>$ npm create vite@latest my-app --template react-ts</div>
              <div className="text-gray-400">✔ Project created successfully!</div>
              <div>$ cd my-app</div>
              <div>$ npm install</div>
              <div className="text-gray-400">added 152 packages in 12s</div>
              <div>$ npm run dev</div>
              <div className="text-gray-400">
                <div>  VITE v5.0.0  ready in 320 ms</div>
                <div>  ➜  Local:   http://localhost:5173/</div>
                <div>  ➜  Network: use --host to expose</div>
              </div>
              <div className="animate-pulse">▊</div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}