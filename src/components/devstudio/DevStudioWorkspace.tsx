/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — DEV STUDIO WORKSPACE                                     │
 * │                                                                             │
 * │ Full IDE-like workspace for building websites and apps                     │
 * │ File tree, code editor, live preview, AI assistance                        │
 * │                                                                             │
 * │ Lucy helps you build.                                                      │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Folder,
  File,
  FileCode,
  FilePlus,
  FolderPlus,
  Trash2,
  Save,
  Play,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Code,
  Eye,
  Terminal,
  Settings,
  Sparkles,
  Download,
  Upload,
  Globe,
  Loader2,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import devStudioService, { DevProject, DevFile } from '@/services/devStudioService';

// =============================================================================
// TYPES
// =============================================================================

interface FileTreeNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileTreeNode[];
  isOpen?: boolean;
}

interface DevStudioWorkspaceProps {
  projectId: string;
  onClose?: () => void;
}

// =============================================================================
// FILE TREE COMPONENT
// =============================================================================

interface FileTreeItemProps {
  node: FileTreeNode;
  depth: number;
  selectedPath: string | null;
  onSelect: (path: string) => void;
  onToggle: (path: string) => void;
  onDelete: (path: string) => void;
}

function FileTreeItem({ node, depth, selectedPath, onSelect, onToggle, onDelete }: FileTreeItemProps) {
  const isSelected = selectedPath === node.path;
  const isDirectory = node.type === 'directory';

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'tsx':
      case 'ts':
      case 'jsx':
      case 'js':
        return <FileCode className="w-4 h-4 text-blue-400" />;
      case 'css':
      case 'scss':
        return <FileCode className="w-4 h-4 text-pink-400" />;
      case 'html':
        return <FileCode className="w-4 h-4 text-orange-400" />;
      case 'json':
        return <FileCode className="w-4 h-4 text-yellow-400" />;
      case 'md':
        return <File className="w-4 h-4 text-gray-400" />;
      default:
        return <File className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div>
      <div
        className={`flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-muted/50 rounded ${
          isSelected ? 'bg-primary/20 text-primary' : ''
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => isDirectory ? onToggle(node.path) : onSelect(node.path)}
      >
        {isDirectory ? (
          node.isOpen ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )
        ) : (
          <span className="w-4" />
        )}
        {isDirectory ? (
          <Folder className={`w-4 h-4 ${node.isOpen ? 'text-amber-400' : 'text-amber-500'}`} />
        ) : (
          getFileIcon(node.name)
        )}
        <span className="text-sm truncate flex-1">{node.name}</span>
      </div>
      {isDirectory && node.isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// CODE EDITOR COMPONENT (Simple)
// =============================================================================

interface CodeEditorProps {
  content: string;
  onChange: (content: string) => void;
  language: string;
  readOnly?: boolean;
}

function CodeEditor({ content, onChange, language, readOnly }: CodeEditorProps) {
  return (
    <textarea
      value={content}
      onChange={(e) => onChange(e.target.value)}
      readOnly={readOnly}
      className="w-full h-full bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm p-4 resize-none focus:outline-none"
      style={{ tabSize: 2 }}
      spellCheck={false}
    />
  );
}

// =============================================================================
// MAIN WORKSPACE
// =============================================================================

export function DevStudioWorkspace({ projectId, onClose }: DevStudioWorkspaceProps) {
  const { toast } = useToast();
  
  // State
  const [project, setProject] = useState<DevProject | null>(null);
  const [files, setFiles] = useState<DevFile[]>([]);
  const [fileTree, setFileTree] = useState<FileTreeNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [originalContent, setOriginalContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set(['/']));

  // Load project and files
  useEffect(() => {
    const loadProject = async () => {
      setLoading(true);
      try {
        const [projectData, filesData] = await Promise.all([
          devStudioService.getProject(projectId),
          devStudioService.getFiles(projectId),
        ]);

        if (!projectData) {
          toast({ title: 'Project not found', variant: 'destructive' });
          return;
        }

        setProject(projectData);
        setFiles(filesData);
        buildFileTree(filesData);
      } catch (err) {
        console.error('[DevStudio] Load error:', err);
        toast({ title: 'Failed to load project', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId, toast]);

  // Build file tree from flat file list
  const buildFileTree = useCallback((files: DevFile[]) => {
    const root: FileTreeNode[] = [];
    const nodeMap = new Map<string, FileTreeNode>();

    // Sort files so directories come first
    const sorted = [...files].sort((a, b) => {
      if (a.fileType !== b.fileType) {
        return a.fileType === 'directory' ? -1 : 1;
      }
      return a.path.localeCompare(b.path);
    });

    sorted.forEach((file) => {
      if (file.path === '/') return; // Skip root

      const node: FileTreeNode = {
        id: file.id,
        name: file.name,
        path: file.path,
        type: file.fileType,
        children: file.fileType === 'directory' ? [] : undefined,
        isOpen: openFolders.has(file.path),
      };

      nodeMap.set(file.path, node);

      // Find parent
      const parentPath = file.path.substring(0, file.path.lastIndexOf('/')) || '/';
      const parent = nodeMap.get(parentPath);

      if (parent && parent.children) {
        parent.children.push(node);
      } else if (parentPath === '/') {
        root.push(node);
      }
    });

    setFileTree(root);
  }, [openFolders]);

  // Rebuild tree when openFolders changes
  useEffect(() => {
    if (files.length > 0) {
      buildFileTree(files);
    }
  }, [files, openFolders, buildFileTree]);

  // Select file
  const handleSelectFile = async (path: string) => {
    // Check for unsaved changes
    if (selectedFile && fileContent !== originalContent) {
      const confirm = window.confirm('You have unsaved changes. Discard them?');
      if (!confirm) return;
    }

    setSelectedFile(path);
    
    const file = files.find(f => f.path === path);
    if (file?.content !== undefined) {
      setFileContent(file.content);
      setOriginalContent(file.content);
    } else {
      // Load from server
      try {
        const loadedFile = await devStudioService.getFile(projectId, path);
        if (loadedFile) {
          setFileContent(loadedFile.content || '');
          setOriginalContent(loadedFile.content || '');
        }
      } catch (err) {
        console.error('[DevStudio] Load file error:', err);
      }
    }
  };

  // Toggle folder
  const handleToggleFolder = (path: string) => {
    setOpenFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  // Save file
  const handleSaveFile = async () => {
    if (!selectedFile) return;

    setSaving(true);
    try {
      await devStudioService.updateFile(projectId, selectedFile, fileContent);
      setOriginalContent(fileContent);
      
      // Update local files state
      setFiles(prev => prev.map(f => 
        f.path === selectedFile ? { ...f, content: fileContent } : f
      ));

      toast({ title: 'File saved' });
    } catch (err) {
      console.error('[DevStudio] Save error:', err);
      toast({ title: 'Failed to save file', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Create new file
  const handleCreateFile = async () => {
    const name = prompt('Enter file name:');
    if (!name) return;

    const parentPath = selectedFile?.includes('.') 
      ? selectedFile.substring(0, selectedFile.lastIndexOf('/'))
      : selectedFile || '/src';
    const path = `${parentPath}/${name}`;

    try {
      await devStudioService.createFile(projectId, path, name, '');
      const updatedFiles = await devStudioService.getFiles(projectId);
      setFiles(updatedFiles);
      setSelectedFile(path);
      setFileContent('');
      setOriginalContent('');
      toast({ title: 'File created' });
    } catch (err) {
      console.error('[DevStudio] Create file error:', err);
      toast({ title: 'Failed to create file', variant: 'destructive' });
    }
  };

  // Delete file
  const handleDeleteFile = async (path: string) => {
    if (!confirm(`Delete ${path}?`)) return;

    try {
      await devStudioService.deleteFile(projectId, path);
      const updatedFiles = await devStudioService.getFiles(projectId);
      setFiles(updatedFiles);
      
      if (selectedFile === path) {
        setSelectedFile(null);
        setFileContent('');
        setOriginalContent('');
      }
      
      toast({ title: 'File deleted' });
    } catch (err) {
      console.error('[DevStudio] Delete file error:', err);
      toast({ title: 'Failed to delete file', variant: 'destructive' });
    }
  };

  // Get language from file extension
  const getLanguage = (path: string) => {
    const ext = path.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'tsx':
      case 'ts':
        return 'typescript';
      case 'jsx':
      case 'js':
        return 'javascript';
      case 'css':
        return 'css';
      case 'html':
        return 'html';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      default:
        return 'plaintext';
    }
  };

  const hasUnsavedChanges = fileContent !== originalContent;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen-dvh bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen-dvh flex flex-col bg-[#1e1e1e] text-white">
      {/* Header */}
      <div className="h-12 bg-[#252526] border-b border-[#3c3c3c] flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Code className="w-5 h-5 text-blue-400" />
          <span className="font-medium">{project?.name || 'Dev Studio'}</span>
          {hasUnsavedChanges && (
            <span className="text-xs text-amber-400">• Unsaved</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveFile}
            disabled={!selectedFile || saving || !hasUnsavedChanges}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span className="ml-2">Save</span>
          </Button>
          <Button variant="ghost" size="sm">
            <Play className="w-4 h-4" />
            <span className="ml-2">Run</span>
          </Button>
          <Button variant="ghost" size="sm">
            <Sparkles className="w-4 h-4" />
            <span className="ml-2">AI</span>
          </Button>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - File Tree */}
        <div className="w-64 bg-[#252526] border-r border-[#3c3c3c] flex flex-col">
          <div className="p-2 border-b border-[#3c3c3c] flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Explorer</span>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCreateFile}>
                <FilePlus className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <FolderPlus className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="py-2">
              {fileTree.map((node) => (
                <FileTreeItem
                  key={node.path}
                  node={node}
                  depth={0}
                  selectedPath={selectedFile}
                  onSelect={handleSelectFile}
                  onToggle={handleToggleFolder}
                  onDelete={handleDeleteFile}
                />
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Tabs */}
          <div className="h-9 bg-[#252526] border-b border-[#3c3c3c] flex items-center px-2">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'code' | 'preview')}>
              <TabsList className="bg-transparent h-8">
                <TabsTrigger value="code" className="h-7 text-xs">
                  <Code className="w-3 h-3 mr-1" />
                  Code
                </TabsTrigger>
                <TabsTrigger value="preview" className="h-7 text-xs">
                  <Eye className="w-3 h-3 mr-1" />
                  Preview
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Editor Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'code' ? (
              selectedFile ? (
                <CodeEditor
                  content={fileContent}
                  onChange={setFileContent}
                  language={getLanguage(selectedFile)}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <FileCode className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a file to edit</p>
                  </div>
                </div>
              )
            ) : (
              <div className="h-full bg-white">
                <iframe
                  srcDoc={`
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <style>
                        body { font-family: system-ui, sans-serif; padding: 20px; }
                      </style>
                    </head>
                    <body>
                      <div id="root">
                        <h1>Preview</h1>
                        <p>Live preview coming soon...</p>
                      </div>
                    </body>
                    </html>
                  `}
                  className="w-full h-full border-0"
                  title="Preview"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-[#007acc] flex items-center justify-between px-4 text-xs">
        <div className="flex items-center gap-4">
          <span>{selectedFile || 'No file selected'}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>{getLanguage(selectedFile || '')}</span>
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  );
}

export default DevStudioWorkspace;
