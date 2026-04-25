import React, { useEffect, useRef, useState } from 'react';
import { WebContainer } from '@webcontainer/api';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import * as monaco from 'monaco-editor';
import 'xterm/css/xterm.css';
import { 
  Zap, Square, RotateCcw, Download, Upload, 
  HelpCircle, Settings, FilePlus, X, ExternalLink,
  ChevronRight, FileCode, Package, FileJson, FileText,
  Loader2, Globe
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// Monaco Worker Setup
if (typeof window !== 'undefined') {
  // @ts-ignore
  import('monaco-editor/esm/vs/editor/editor.worker?worker').then(({ default: EditorWorker }) => {
    // @ts-ignore
    import('monaco-editor/esm/vs/language/json/json.worker?worker').then(({ default: JsonWorker }) => {
      // @ts-ignore
      import('monaco-editor/esm/vs/language/css/css.worker?worker').then(({ default: CssWorker }) => {
        // @ts-ignore
        import('monaco-editor/esm/vs/language/html/html.worker?worker').then(({ default: HtmlWorker }) => {
          // @ts-ignore
          import('monaco-editor/esm/vs/language/typescript/ts.worker?worker').then(({ default: TsWorker }) => {
            window.MonacoEnvironment = {
              getWorker(_, label) {
                if (label === 'json') return new JsonWorker();
                if (label === 'css' || label === 'scss' || label === 'less') return new CssWorker();
                if (label === 'html' || label === 'handlebars' || label === 'razor') return new HtmlWorker();
                if (label === 'typescript' || label === 'javascript') return new TsWorker();
                return new EditorWorker();
              },
            };
          });
        });
      });
    });
  });
}

interface BrowserIDEProps {
  siteId?: string;
  initialFiles?: any;
}

export default function BrowserIDE({ siteId, initialFiles }: BrowserIDEProps) {
  const { toast } = useToast();
  
  // Refs
  const terminalRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Instances
  const webcontainer = useRef<WebContainer | null>(null);
  const editor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const terminal = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const serverProcess = useRef<any>(null);
  const models = useRef<Map<string, monaco.editor.ITextModel>>(new Map());
  const writeTimeouts = useRef<Map<string, any>>(new Map());

  // State
  const [status, setStatus] = useState<'IDLE' | 'BOOTING' | 'INSTALLING' | 'RUNNING' | 'FAILED'>('BOOTING');
  const [statusText, setStatusText] = useState('Initializing...');
  const [activeFile, setActiveFile] = useState('index.js');
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [isWordWrap, setIsWordWrap] = useState(false);
  const [isMinimap, setIsMinimap] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showDiag, setShowDiag] = useState(false);

  useEffect(() => {
    initIDE();
    return () => {
      // Cleanup
      if (serverProcess.current) serverProcess.current.kill();
      if (editor.current) editor.current.dispose();
      models.current.forEach(m => m.dispose());
    };
  }, []);

  const initIDE = async () => {
    // 1. Init Terminal
    if (!terminal.current && terminalRef.current) {
      terminal.current = new Terminal({
        convertEol: true,
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        fontSize: 12,
        theme: { background: '#0a0a0a' }
      });
      fitAddon.current = new FitAddon();
      terminal.current.loadAddon(fitAddon.current);
      terminal.current.open(terminalRef.current);
      fitAddon.current.fit();
    }

    // 2. Init Editor
    if (!editor.current && editorRef.current) {
      editor.current = monaco.editor.create(editorRef.current, {
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: 'off',
        padding: { top: 10 }
      });

      // Shortcuts
      editor.current.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
        if (status === 'IDLE' || status === 'FAILED') handleRun();
      });
    }

    // 3. Load Files & Models
    const defaultProj = initialFiles || {
      'index.js': { file: { contents: `import express from 'express';\nconst app = express();\nconst port = 3111;\n\napp.get('/', (req, res) => {\n  res.send('Welcome to Codexel.ai IDE!');\n});\n\napp.listen(port, () => {\n  console.log(\`App listening on port \${port}\`);\n});` } },
      'package.json': { file: { contents: `{\n  "name": "codexel-app",\n  "type": "module",\n  "dependencies": {\n    "express": "latest",\n    "nodemon": "latest"\n  },\n  "scripts": {\n    "start": "nodemon index.js"\n  }\n}` } }
    };

    for (const [name, fileObj] of Object.entries(defaultProj)) {
      const content = (fileObj as any).file?.contents || '';
      const model = monaco.editor.createModel(content, getLanguage(name));
      models.current.set(name, model);
      model.onDidChangeContent(() => debouncedWrite(name, model.getValue()));
    }
    setFileNames(Array.from(models.current.keys()).sort());
    
    if (editor.current && models.current.has('index.js')) {
      editor.current.setModel(models.current.get('index.js')!);
    }

    // 4. Boot WebContainer
    try {
      setStatus('BOOTING');
      setStatusText('Booting WebContainer...');
      terminal.current?.writeln('Welcome to Codexel.ai IDE');
      
      webcontainer.current = await WebContainer.boot();
      
      const mountObj: any = {};
      models.current.forEach((model, name) => {
        mountObj[name] = { file: { contents: model.getValue() } };
      });
      await webcontainer.current.mount(mountObj);
      
      setStatus('IDLE');
      setStatusText('Ready');
      terminal.current?.writeln('WebContainer ready.');
    } catch (err: any) {
      console.error(err);
      setStatus('FAILED');
      setStatusText('Boot failed');
      terminal.current?.writeln(`\x1b[31mBoot Error: ${err.message}\x1b[0m`);
    }
  };

  const getLanguage = (fileName: string) => {
    if (fileName.endsWith('.json')) return 'json';
    if (fileName.endsWith('.css')) return 'css';
    if (fileName.endsWith('.html')) return 'html';
    return 'javascript';
  };

  const debouncedWrite = (path: string, content: string) => {
    if (writeTimeouts.current.has(path)) clearTimeout(writeTimeouts.current.get(path));
    const timeout = setTimeout(async () => {
      if (webcontainer.current) await webcontainer.current.fs.writeFile(path, content);
      writeTimeouts.current.delete(path);
    }, 500);
    writeTimeouts.current.set(path, timeout);
  };

  const handleRun = async () => {
    if (!webcontainer.current) return;
    setStatus('INSTALLING');
    setStatusText('Installing dependencies...');
    terminal.current?.writeln('\x1b[33mInstalling dependencies...\x1b[0m');

    const installProcess = await webcontainer.current.spawn('npm', ['install']);
    installProcess.output.pipeTo(new WritableStream({
      write(data) { terminal.current?.write(data); }
    }));
    
    const exitCode = await installProcess.exit;
    if (exitCode !== 0) {
      setStatus('FAILED');
      setStatusText('Installation failed');
      return;
    }

    setStatus('RUNNING');
    setStatusText('Starting server...');
    terminal.current?.writeln('\x1b[33mStarting server...\x1b[0m');

    serverProcess.current = await webcontainer.current.spawn('npm', ['run', 'start']);
    serverProcess.current.output.pipeTo(new WritableStream({
      write(data) { terminal.current?.write(data); }
    }));

    webcontainer.current.on('server-ready', (port, url) => {
      setServerUrl(url);
      if (iframeRef.current) iframeRef.current.src = url;
      setStatus('RUNNING');
      setStatusText('Application is live');
      terminal.current?.writeln(`\x1b[32mServer is ready at ${url}\x1b[0m`);
    });
  };

  const handleStop = () => {
    if (serverProcess.current) {
      serverProcess.current.kill();
      serverProcess.current = null;
    }
    setServerUrl(null);
    if (iframeRef.current) iframeRef.current.src = 'about:blank';
    setStatus('IDLE');
    setStatusText('Ready');
    terminal.current?.writeln('\x1b[33mProcess stopped.\x1b[0m');
  };

  const handleRestart = async () => {
    handleStop();
    handleRun();
  };

  const handleNewFile = () => {
    const fileName = prompt('Enter file name:');
    if (!fileName) return;
    if (models.current.has(fileName)) {
      toast({ title: "Error", description: "File already exists", variant: "destructive" });
      return;
    }

    const model = monaco.editor.createModel('', getLanguage(fileName));
    models.current.set(fileName, model);
    model.onDidChangeContent(() => debouncedWrite(fileName, model.getValue()));
    
    setFileNames(Array.from(models.current.keys()).sort());
    switchFile(fileName);
  };

  const handleDeleteFile = async (name: string) => {
    if (name === 'package.json' || name === 'index.js') {
      toast({ title: "Action Denied", description: "Cannot delete core files", variant: "destructive" });
      return;
    }
    if (!confirm(`Delete ${name}?`)) return;

    models.current.delete(name);
    setFileNames(Array.from(models.current.keys()).sort());
    if (webcontainer.current) await webcontainer.current.fs.rm(name);
    
    if (activeFile === name) switchFile('index.js');
  };

  const switchFile = (name: string) => {
    setActiveFile(name);
    const model = models.current.get(name);
    if (model && editor.current) {
      editor.current.setModel(model);
    }
  };

  const getFileIcon = (name: string) => {
    if (name === 'package.json') return <Package className="w-4 h-4 text-orange-400" />;
    if (name.endsWith('.json')) return <FileJson className="w-4 h-4 text-yellow-400" />;
    if (name.endsWith('.js') || name.endsWith('.ts')) return <FileCode className="w-4 h-4 text-blue-400" />;
    if (name.endsWith('.css')) return <FileText className="w-4 h-4 text-purple-400" />;
    return <FileText className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] text-[#cccccc] overflow-hidden select-none">
      {/* --- IDE Header --- */}
      <header className="h-12 bg-[#3c3c3c] border-b border-[#454545] flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 font-bold text-white tracking-tight">
            <Globe className="w-4 h-4 text-blue-400" />
            Codexel<span className="font-light opacity-80">Studio</span>
          </div>
          <div className="flex items-center gap-1 ml-4">
            <button 
              onClick={handleRun} 
              disabled={status === 'RUNNING' || status === 'BOOTING' || status === 'INSTALLING'}
              className="flex items-center gap-1.5 px-3 py-1 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-xs font-bold rounded transition-all"
            >
              <Zap className="w-3 h-3 fill-current" /> RUN
            </button>
            <button 
              onClick={handleStop} 
              disabled={status !== 'RUNNING'}
              className="flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold rounded transition-all"
            >
              <Square className="w-3 h-3 fill-current" /> STOP
            </button>
            <button 
              onClick={handleRestart} 
              disabled={status !== 'RUNNING' && status !== 'FAILED'}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#444] hover:bg-[#555] disabled:opacity-50 text-white text-xs font-bold rounded transition-all"
            >
              <RotateCcw className="w-3 h-3" /> RESTART
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[11px]">
            <span className={`w-2 h-2 rounded-full ${
              status === 'RUNNING' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 
              status === 'FAILED' ? 'bg-red-500' : 'bg-yellow-500'
            }`} />
            <span className="font-medium uppercase tracking-wider">{statusText}</span>
          </div>
          <div className="h-4 w-px bg-[#555]" />
          <div className="flex items-center gap-1">
            <button onClick={() => setShowDiag(true)} className="p-1.5 hover:bg-[#444] rounded text-[#aaa] hover:text-white transition-colors" title="System Status"><Settings className="w-4 h-4" /></button>
            <button onClick={() => setShowHelp(true)} className="p-1.5 hover:bg-[#444] rounded text-[#aaa] hover:text-white transition-colors" title="Help"><HelpCircle className="w-4 h-4" /></button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* --- Sidebar --- */}
        <aside className="w-56 bg-[#252526] border-right border-[#454545] flex flex-col">
          <div className="px-4 py-3 text-[10px] font-bold text-[#888] uppercase tracking-widest flex items-center justify-between">
            <span>Explorer</span>
            <button onClick={handleNewFile} className="hover:text-white transition-colors"><FilePlus className="w-3.5 h-3.5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {fileNames.map(name => (
              <div 
                key={name}
                onClick={() => switchFile(name)}
                className={`group flex items-center justify-between px-4 py-1.5 text-sm cursor-pointer transition-colors ${
                  activeFile === name ? 'bg-[#37373d] text-white border-l-2 border-blue-500' : 'text-[#aaa] hover:bg-[#2a2d2e] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  {getFileIcon(name)}
                  <span className="truncate">{name}</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteFile(name); }}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* --- Editor Area --- */}
        <section className="flex-1 flex flex-col min-w-0">
          <div className="h-9 bg-[#252526] border-b border-[#454545] flex items-center px-4 justify-between">
            <div className="flex items-center gap-2 text-xs text-[#aaa]">
              <span className="opacity-50">src</span>
              <ChevronRight className="w-3 h-3 opacity-30" />
              <span className="text-white font-medium">{activeFile}</span>
            </div>
            <div className="flex items-center gap-2">
               <button 
                onClick={() => {
                  setIsWordWrap(!isWordWrap);
                  editor.current?.updateOptions({ wordWrap: !isWordWrap ? 'on' : 'off' });
                }} 
                className={`p-1 rounded transition-colors ${isWordWrap ? 'bg-blue-600 text-white' : 'text-[#888] hover:text-white'}`}
                title="Toggle Word Wrap"
               >
                <FileText className="w-3.5 h-3.5" />
               </button>
               <button 
                onClick={() => {
                  setIsMinimap(!isMinimap);
                  editor.current?.updateOptions({ minimap: { enabled: !isMinimap } });
                }} 
                className={`p-1 rounded transition-colors ${isMinimap ? 'bg-blue-600 text-white' : 'text-[#888] hover:text-white'}`}
                title="Toggle Minimap"
               >
                <Globe className="w-3.5 h-3.5" />
               </button>
            </div>
          </div>
          <div ref={editorRef} className="flex-1" />
        </section>

        {/* --- Right Pane (Preview + Terminal) --- */}
        <section className="w-[40%] border-l border-[#454545] flex flex-col bg-[#0a0a0a]">
          {/* Preview */}
          <div className="flex-1 flex flex-col min-h-0 border-b border-[#454545]">
            <div className="h-9 bg-[#252526] flex items-center justify-between px-4 border-b border-[#454545]">
              <span className="text-[10px] font-bold text-[#888] uppercase tracking-widest">Preview</span>
              <button 
                onClick={() => serverUrl && window.open(serverUrl, '_blank')}
                disabled={!serverUrl}
                className="text-[#888] hover:text-white disabled:opacity-30 p-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 bg-white relative overflow-hidden">
              {(status === 'INSTALLING' || status === 'RUNNING' && !serverUrl) && (
                <div className="absolute inset-0 z-10 bg-black/80 flex flex-col items-center justify-center gap-4 text-white">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <span className="text-sm font-medium tracking-wide animate-pulse">
                    {status === 'INSTALLING' ? 'Installing modules...' : 'Launching server...'}
                  </span>
                </div>
              )}
              <iframe ref={iframeRef} className="w-full h-full border-none" src="about:blank" />
            </div>
          </div>

          {/* Terminal */}
          <div className="h-64 flex flex-col min-h-0">
             <div className="h-9 bg-[#252526] flex items-center px-4 border-b border-[#454545]">
              <span className="text-[10px] font-bold text-[#888] uppercase tracking-widest">Output Terminal</span>
            </div>
            <div ref={terminalRef} className="flex-1 p-2 bg-[#0a0a0a]" />
          </div>
        </section>
      </main>

      {/* --- Modals --- */}
      {showHelp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[450px] bg-[#252526] border border-[#454545] rounded-xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowHelp(false)} className="absolute top-4 right-4 text-[#888] hover:text-white"><X className="w-5 h-5" /></button>
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-[#454545] pb-3">
              <HelpCircle className="w-5 h-5 text-blue-400" />
              Help & Shortcuts
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-[#1e1e1e] p-3 rounded-lg border border-[#333]">
                <span className="text-sm">Run Application</span>
                <kbd className="px-2 py-1 bg-[#333] border border-[#555] rounded text-blue-400 font-mono text-xs">Ctrl + Enter</kbd>
              </div>
              <div className="flex items-center justify-between bg-[#1e1e1e] p-3 rounded-lg border border-[#333]">
                <span className="text-sm">Save Session</span>
                <kbd className="px-2 py-1 bg-[#333] border border-[#555] rounded text-blue-400 font-mono text-xs">Ctrl + S</kbd>
              </div>
              <div className="pt-4 border-t border-[#454545]">
                <h4 className="text-xs font-bold text-[#888] uppercase mb-2">Getting Started</h4>
                <p className="text-sm text-[#aaa] leading-relaxed">
                  Codexel Studio runs your code in a isolated browser environment. Edit your files, click <b>RUN</b>, and watch the preview update live.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDiag && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[450px] bg-[#252526] border border-[#454545] rounded-xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowDiag(false)} className="absolute top-4 right-4 text-[#888] hover:text-white"><X className="w-5 h-5" /></button>
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-[#454545] pb-3">
              <Settings className="w-5 h-5 text-orange-400" />
              System Diagnostics
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-[#333]">
                <span className="text-sm text-[#aaa]">Isolated Runtime</span>
                <span className="text-sm text-green-400 font-bold">Enabled</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#333]">
                <span className="text-sm text-[#aaa]">SharedArrayBuffer</span>
                <span className="text-sm text-white">{window.SharedArrayBuffer ? '✅ Supported' : '❌ Disabled'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#333]">
                <span className="text-sm text-[#aaa]">Active Models</span>
                <span className="text-sm text-white">{models.current.size} files</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#333]">
                <span className="text-sm text-[#aaa]">Process State</span>
                <span className="text-sm text-white font-mono">{status}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
