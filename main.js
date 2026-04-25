import './style.css';
import 'xterm/css/xterm.css';
import { WebContainer } from '@webcontainer/api';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import * as monaco from 'monaco-editor';
import { files as defaultFiles } from './files';

// Monaco Worker Setup
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') return new jsonWorker();
    if (label === 'css' || label === 'scss' || label === 'less') return new cssWorker();
    if (label === 'html' || label === 'handlebars' || label === 'razor') return new htmlWorker();
    if (label === 'typescript' || label === 'javascript') return new tsWorker();
    return new editorWorker();
  },
};

/** @type {import('@webcontainer/api').WebContainer}  */
let webcontainerInstance;
let editor;
let terminal;
let fitAddon;
let serverProcess;
let serverUrl;
let activeFile = 'index.js';

const models = new Map();
const writeTimeouts = new Map();

// Metrics
const metrics = {
    bootStart: 0,
    bootEnd: 0,
    installStart: 0,
    installEnd: 0
};

const statusText = document.getElementById('status-text');
const statusBadge = document.getElementById('status-badge');
const iframeEl = document.getElementById('preview-iframe');
const terminalContainer = document.getElementById('terminal-container');
const editorContainer = document.getElementById('editor-container');
const previewOverlay = document.getElementById('preview-overlay');
const fileListEl = document.getElementById('file-list');
const activeFileNameEl = document.getElementById('active-file-name');

const runBtn = document.getElementById('run-btn');
const stopBtn = document.getElementById('stop-btn');
const restartBtn = document.getElementById('restart-btn');
const openExternalBtn = document.getElementById('open-external-btn');
const newFileBtn = document.getElementById('new-file-btn');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const helpBtn = document.getElementById('help-btn');
const diagBtn = document.getElementById('diag-btn');

const toggleWrapBtn = document.getElementById('toggle-wrap-btn');
const toggleMinimapBtn = document.getElementById('toggle-minimap-btn');

// --- Session Persistence ---

function saveSession() {
    const projectData = {
        activeFile,
        files: {}
    };
    
    models.forEach((model, name) => {
        projectData.files[name] = {
            contents: model.getValue()
        };
    });
    
    localStorage.setItem('codexel_project', JSON.stringify(projectData));
}

function loadSession() {
    const saved = localStorage.getItem('codexel_project');
    if (!saved) return null;
    try {
        return JSON.parse(saved);
    } catch (e) {
        console.error('Failed to load session:', e);
        return null;
    }
}

// --- Lifecycle & UI ---

function updateStatus(state, text) {
    statusBadge.className = `badge ${state.toLowerCase()}`;
    statusBadge.innerText = state;
    statusText.innerText = text;

    runBtn.disabled = state === 'RUNNING' || state === 'BOOTING' || state === 'INSTALLING';
    stopBtn.disabled = state !== 'RUNNING';
    restartBtn.disabled = state !== 'RUNNING' && state !== 'FAILED';
    
    if (state === 'INSTALLING') {
        previewOverlay.classList.remove('hidden');
        previewOverlay.querySelector('span').innerText = 'Installing dependencies...';
    } else if (state === 'RUNNING') {
        previewOverlay.querySelector('span').innerText = 'Starting dev server...';
    } else if (state === 'IDLE' || state === 'FAILED') {
        previewOverlay.classList.add('hidden');
    }
}

function renderFileList() {
    fileListEl.innerHTML = '';
    const sortedFiles = Array.from(models.keys()).sort();
    
    sortedFiles.forEach(name => {
        const li = document.createElement('li');
        li.className = `file-item ${name === activeFile ? 'active' : ''}`;
        li.dataset.file = name;
        li.innerHTML = `
            <span>${name}</span>
            <span class="delete-file" title="Delete File">×</span>
        `;
        
        li.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-file')) {
                handleDeleteFile(name);
            } else {
                switchFile(name);
            }
        });
        
        fileListEl.appendChild(li);
    });
}

function switchFile(name) {
    activeFile = name;
    activeFileNameEl.innerText = name;
    const model = models.get(name);
    if (model) {
        editor.setModel(model);
    }
    renderFileList();
    saveSession();
}

async function handleNewFile() {
    const fileName = prompt('Enter file name:');
    if (!fileName) return;
    if (models.has(fileName)) {
        alert('File already exists');
        return;
    }

    const lang = getLanguage(fileName);
    const model = monaco.editor.createModel('', lang);
    models.set(fileName, model);
    
    model.onDidChangeContent(() => {
        debouncedWrite(fileName, model.getValue());
    });

    await writeToWebContainer(fileName, '');
    switchFile(fileName);
}

async function handleDeleteFile(name) {
    if (name === 'package.json' || name === 'index.js') {
        alert('Cannot delete core files');
        return;
    }
    if (!confirm(`Delete ${name}?`)) return;

    models.delete(name);
    if (webcontainerInstance) await webcontainerInstance.fs.rm(name);
    
    if (activeFile === name) {
        switchFile('index.js');
    } else {
        renderFileList();
        saveSession();
    }
}

function getLanguage(fileName) {
    if (fileName.endsWith('.json')) return 'json';
    if (fileName.endsWith('.css')) return 'css';
    if (fileName.endsWith('.html')) return 'html';
    return 'javascript';
}

function debouncedWrite(path, content) {
    if (writeTimeouts.has(path)) {
        clearTimeout(writeTimeouts.get(path));
    }
    
    const timeout = setTimeout(async () => {
        await writeToWebContainer(path, content);
        saveSession();
        writeTimeouts.delete(path);
    }, 500);
    
    writeTimeouts.set(path, timeout);
}

function handleExport() {
    const projectData = {
        files: {}
    };
    models.forEach((model, name) => {
        projectData.files[name] = { file: { contents: model.getValue() } };
    });
    
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codexel-project-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function handleImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (re) => {
            try {
                const data = JSON.parse(re.target.result);
                if (!data.files) throw new Error('Invalid project format');
                
                models.forEach(m => m.dispose());
                models.clear();
                
                const mountFiles = {};
                for (const [name, fileObj] of Object.entries(data.files)) {
                    const content = fileObj.file?.contents || fileObj.contents || '';
                    const model = monaco.editor.createModel(content, getLanguage(name));
                    models.set(name, model);
                    model.onDidChangeContent(() => {
                        debouncedWrite(name, model.getValue());
                    });
                    mountFiles[name] = { file: { contents: content } };
                }
                
                if (webcontainerInstance) {
                    await webcontainerInstance.mount(mountFiles);
                }
                
                switchFile(models.has('index.js') ? 'index.js' : Array.from(models.keys())[0]);
                terminal.writeln('\x1b[32mProject imported successfully.\x1b[0m');
            } catch (err) {
                alert('Failed to import: ' + err.message);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// --- Modals ---

function showModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <span class="modal-close">×</span>
        <h2>${title}</h2>
        <div>${content}</div>
    `;
    document.body.appendChild(modal);
    
    const close = () => {
        document.body.removeChild(modal);
        window.removeEventListener('keydown', escClose);
    };
    
    const escClose = (e) => { if (e.key === 'Escape') close(); };
    
    modal.querySelector('.modal-close').onclick = close;
    window.addEventListener('keydown', escClose);
}

function handleHelp() {
    showModal('Help & Keyboard Shortcuts', `
        <ul>
            <li><kbd>Ctrl + Enter</kbd> - Run Application</li>
            <li><kbd>Ctrl + S</kbd> - Save Session</li>
            <li><kbd>ESC</kbd> - Close Modals</li>
        </ul>
        <div style="margin-top: 20px; font-size: 13px; opacity: 0.8;">
            <b>Getting Started:</b><br/>
            1. Edit <code>index.js</code> or add new files.<br/>
            2. Click <b>Run</b> to install and start the server.<br/>
            3. Preview appears in the right pane once ready.
        </div>
    `);
}

function handleDiagnostics() {
    const isSharedArrayBufferSupported = !!window.SharedArrayBuffer;
    const bootTime = metrics.bootEnd ? `${metrics.bootEnd - metrics.bootStart}ms` : 'N/A';
    const installTime = metrics.installEnd ? `${metrics.installEnd - metrics.installStart}ms` : 'N/A';

    showModal('System Diagnostics', `
        <ul>
            <li><b>SharedArrayBuffer:</b> ${isSharedArrayBufferSupported ? '✅ Supported' : '❌ Missing (Cross-Origin isolation required)'}</li>
            <li><b>WebContainer Boot:</b> ${bootTime}</li>
            <li><b>Last Install Duration:</b> ${installTime}</li>
            <li><b>Files in memory:</b> ${models.size}</li>
            <li><b>Active Process:</b> ${serverProcess ? 'Running' : 'None'}</li>
            <li><b>Browser:</b> ${navigator.userAgent.split(' ').pop()}</li>
        </ul>
    `);
}

// --- Editor Actions ---

let isWordWrap = false;
let isMinimap = false;

function toggleWordWrap() {
    isWordWrap = !isWordWrap;
    editor.updateOptions({ wordWrap: isWordWrap ? 'on' : 'off' });
    toggleWrapBtn.classList.toggle('active', isWordWrap);
}

function toggleMinimap() {
    isMinimap = !isMinimap;
    editor.updateOptions({ minimap: { enabled: isMinimap } });
    toggleMinimapBtn.classList.toggle('active', isMinimap);
}

// --- Initialization ---

window.addEventListener('load', async () => {
  terminal = new Terminal({
    convertEol: true,
    fontFamily: 'Menlo, Monaco, "Courier New", monospace',
    fontSize: 12,
    theme: { background: '#000000' }
  });
  fitAddon = new FitAddon();
  terminal.loadAddon(fitAddon);
  terminal.open(terminalContainer);
  fitAddon.fit();

  editor = monaco.editor.create(editorContainer, {
    theme: 'vs-dark',
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 14,
    wordWrap: 'off'
  });

  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (!runBtn.disabled) handleRun();
  });
  
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      terminal.writeln('\x1b[90mSession saved manually.\x1b[0m');
      saveSession();
  });

  const session = loadSession();
  const initialFiles = session ? session.files : defaultFiles;
  activeFile = session ? session.activeFile : 'index.js';

  for (const [name, fileObj] of Object.entries(initialFiles)) {
      const content = fileObj.file?.contents || fileObj.contents || '';
      const model = monaco.editor.createModel(content, getLanguage(name));
      models.set(name, model);
      
      model.onDidChangeContent(() => {
          debouncedWrite(name, model.getValue());
      });
  }

  switchFile(models.has(activeFile) ? activeFile : 'index.js');

  terminal.writeln('Welcome to Codexel.ai IDE');
  terminal.writeln('\x1b[90mTip: Type help(?) for shortcuts\x1b[0m');
  updateStatus('BOOTING', 'Initializing WebContainer...');

  try {
    metrics.bootStart = Date.now();
    webcontainerInstance = await WebContainer.boot();
    metrics.bootEnd = Date.now();
    
    const mountObj = {};
    models.forEach((model, name) => {
        mountObj[name] = { file: { contents: model.getValue() } };
    });
    await webcontainerInstance.mount(mountObj);
    
    updateStatus('IDLE', 'Ready to run');
    terminal.writeln(`WebContainer ready in ${metrics.bootEnd - metrics.bootStart}ms.`);

    runBtn.addEventListener('click', handleRun);
    stopBtn.addEventListener('click', handleStop);
    restartBtn.addEventListener('click', handleRestart);
    newFileBtn.addEventListener('click', handleNewFile);
    exportBtn.addEventListener('click', handleExport);
    importBtn.addEventListener('click', handleImport);
    helpBtn.addEventListener('click', handleHelp);
    diagBtn.addEventListener('click', handleDiagnostics);
    toggleWrapBtn.addEventListener('click', toggleWordWrap);
    toggleMinimapBtn.addEventListener('click', toggleMinimap);
    
    openExternalBtn.addEventListener('click', () => {
        if (serverUrl) window.open(serverUrl, '_blank');
    });

  } catch (err) {
    console.error(err);
    terminal.writeln(`\x1b[31mBoot Error: ${err.message}\x1b[0m`);
    updateStatus('FAILED', 'Boot failed');
  }
});

async function handleRun() {
    terminal.writeln('\x1b[33mStarting application...\x1b[0m');
    updateStatus('INSTALLING', 'Installing dependencies...');
    
    try {
        metrics.installStart = Date.now();
        const exitCode = await installDependencies();
        metrics.installEnd = Date.now();
        
        if (exitCode !== 0) {
            updateStatus('FAILED', 'Installation failed');
            return;
        }

        terminal.writeln(`Dependencies installed in ${metrics.installEnd - metrics.installStart}ms.`);
        updateStatus('RUNNING', 'Application is running');
        startDevServer();
    } catch (err) {
        terminal.writeln(`\x1b[31mRun Error: ${err.message}\x1b[0m`);
        updateStatus('FAILED', 'Run error');
    }
}

async function handleStop() {
    if (serverProcess) {
        terminal.writeln('\x1b[33mStopping process...\x1b[0m');
        serverProcess.kill();
        serverProcess = null;
        serverUrl = null;
        iframeEl.src = 'loading.html';
        openExternalBtn.disabled = true;
        updateStatus('IDLE', 'Process stopped');
    }
}

async function handleRestart() {
    await handleStop();
    handleRun();
}

async function installDependencies() {
  const installProcess = await webcontainerInstance.spawn('npm', ['install']);
  installProcess.output.pipeTo(new WritableStream({
    write(data) { terminal.write(data); }
  }));
  return installProcess.exit;
}

async function startDevServer() {
  serverProcess = await webcontainerInstance.spawn('npm', ['run', 'start']);
  serverProcess.output.pipeTo(new WritableStream({
    write(data) { terminal.write(data); }
  }));

  webcontainerInstance.on('server-ready', (port, url) => {
    serverUrl = url;
    iframeEl.src = url;
    openExternalBtn.disabled = false;
    previewOverlay.classList.add('hidden');
    terminal.writeln(`\x1b[32mServer is ready at ${url}\x1b[0m`);
  });
}

async function writeToWebContainer(path, content) {
  if (webcontainerInstance) {
    await webcontainerInstance.fs.writeFile(path, content);
  }
}

window.addEventListener('resize', () => {
    if (fitAddon) fitAddon.fit();
});
