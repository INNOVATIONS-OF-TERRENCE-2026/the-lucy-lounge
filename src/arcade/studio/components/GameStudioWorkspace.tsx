/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY GAME STUDIO — MAIN WORKSPACE                                          │
 * │                                                                             │
 * │ Full IDE-like workspace for game creation                                  │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Settings,
  Code,
  Box,
  Image,
  Music,
  Brain,
  Upload,
  Save,
  Undo,
  Redo,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Folder,
  File,
  Plus,
  Trash2,
  Eye,
  Rocket,
  Layers,
  Cpu,
  Gamepad2,
  Sun,
  Moon,
  Grid3X3,
  Move,
  RotateCcw,
  Scale,
  Target,
  Users,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import GameStudioService from '../GameStudioService';
import type { 
  GameProject, 
  ProjectAsset, 
  ProjectScript, 
  GameScene,
  SceneObject,
} from '../types';

// ============================================================================
// TYPES
// ============================================================================

interface GameStudioWorkspaceProps {
  projectId: string;
  onClose: () => void;
}

type ToolMode = 'select' | 'move' | 'rotate' | 'scale';
type ViewMode = '3d' | 'top' | 'front' | 'side';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const GameStudioWorkspace: React.FC<GameStudioWorkspaceProps> = ({
  projectId,
  onClose,
}) => {
  const [project, setProject] = useState<GameProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // UI State
  const [activeTab, setActiveTab] = useState<'scene' | 'assets' | 'scripts' | 'ai' | 'settings'>('scene');
  const [selectedScene, setSelectedScene] = useState<GameScene | null>(null);
  const [selectedObject, setSelectedObject] = useState<SceneObject | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<ProjectAsset | null>(null);
  const [selectedScript, setSelectedScript] = useState<ProjectScript | null>(null);
  
  // Editor State
  const [toolMode, setToolMode] = useState<ToolMode>('select');
  const [viewMode, setViewMode] = useState<ViewMode>('3d');
  const [showGrid, setShowGrid] = useState(true);
  const [showGizmos, setShowGizmos] = useState(true);
  
  // Panels
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [bottomPanelCollapsed, setBottomPanelCollapsed] = useState(true);
  
  const studioService = GameStudioService.getInstance();
  
  // ============================================================================
  // DATA LOADING
  // ============================================================================
  
  useEffect(() => {
    loadProject();
  }, [projectId]);
  
  const loadProject = async () => {
    setIsLoading(true);
    try {
      const loadedProject = await studioService.getProject(projectId);
      if (loadedProject) {
        setProject(loadedProject);
        if (loadedProject.scenes.length > 0) {
          setSelectedScene(loadedProject.scenes[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load project:', error);
    }
    setIsLoading(false);
  };
  
  // ============================================================================
  // ACTIONS
  // ============================================================================
  
  const handleSave = async () => {
    if (!project) return;
    
    setIsSaving(true);
    try {
      await studioService.updateProject(projectId, project);
    } catch (error) {
      console.error('Failed to save:', error);
    }
    setIsSaving(false);
  };
  
  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };
  
  const handleAddScene = async () => {
    if (!project) return;
    
    const sceneName = `Scene ${project.scenes.length + 1}`;
    const newScene = await studioService.createScene(projectId, sceneName);
    
    setProject({
      ...project,
      scenes: [...project.scenes, newScene],
    });
    setSelectedScene(newScene);
  };
  
  const handleAddObject = (type: SceneObject['type']) => {
    if (!selectedScene) return;
    
    const newObject: SceneObject = {
      id: crypto.randomUUID(),
      name: `New ${type}`,
      type,
      position: [0, 0, 0],
      rotation: [0, 0, 0, 1],
      scale: [1, 1, 1],
      components: [],
      children: [],
      isActive: true,
      isStatic: false,
      layer: 0,
      tags: [],
    };
    
    const updatedScene: GameScene = {
      ...selectedScene,
      rootObjects: [...selectedScene.rootObjects, newObject],
    };
    
    setSelectedScene(updatedScene);
    setSelectedObject(newObject);
    
    // Update project
    if (project) {
      setProject({
        ...project,
        scenes: project.scenes.map(s => 
          s.id === selectedScene.id ? updatedScene : s
        ),
      });
    }
  };
  
  const handleUploadAsset = async (files: FileList) => {
    if (!project) return;
    
    for (const file of Array.from(files)) {
      const type = getAssetTypeFromFile(file);
      const asset = await studioService.uploadAsset(projectId, file, type);
      
      setProject(prev => prev ? {
        ...prev,
        assets: [...prev.assets, asset],
      } : null);
    }
  };
  
  const handleCreateScript = async () => {
    if (!project) return;
    
    const script = await studioService.createScript(
      projectId,
      `Script ${project.scripts.length + 1}`,
      'game_logic'
    );
    
    setProject({
      ...project,
      scripts: [...project.scripts, script],
    });
    setSelectedScript(script);
  };
  
  const handlePublish = async () => {
    // Would open publish dialog
  };
  
  // ============================================================================
  // HELPERS
  // ============================================================================
  
  const getAssetTypeFromFile = (file: File): ProjectAsset['type'] => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    
    if (['glb', 'gltf', 'fbx', 'obj'].includes(ext || '')) return 'model_3d';
    if (['png', 'jpg', 'jpeg', 'webp'].includes(ext || '')) return 'texture_diffuse';
    if (['mp3', 'wav', 'ogg'].includes(ext || '')) return 'audio_sfx';
    
    return 'data_json';
  };
  
  // ============================================================================
  // RENDER
  // ============================================================================
  
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading project...</p>
        </div>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
        <div className="text-center">
          <p className="text-red-400 mb-4">Project not found</p>
          <Button onClick={onClose}>Go Back</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-[#1a1a2e] flex flex-col z-50">
      {/* Top Toolbar */}
      <div className="h-12 bg-[#0f0f1a] border-b border-white/10 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white/60 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          
          <div className="h-6 w-px bg-white/10" />
          
          <div className="flex items-center gap-2">
            <span className="text-white font-medium">{project.name}</span>
            <Badge variant="outline" className="text-xs">
              {project.version}
            </Badge>
            <Badge 
              variant={project.status === 'published' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {project.status}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Tool Buttons */}
          <div className="flex items-center bg-white/5 rounded-lg p-1">
            <Button
              variant={toolMode === 'select' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setToolMode('select')}
              className="h-7 w-7 p-0"
            >
              <Target className="w-4 h-4" />
            </Button>
            <Button
              variant={toolMode === 'move' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setToolMode('move')}
              className="h-7 w-7 p-0"
            >
              <Move className="w-4 h-4" />
            </Button>
            <Button
              variant={toolMode === 'rotate' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setToolMode('rotate')}
              className="h-7 w-7 p-0"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant={toolMode === 'scale' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setToolMode('scale')}
              className="h-7 w-7 p-0"
            >
              <Scale className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="h-6 w-px bg-white/10" />
          
          {/* View Toggles */}
          <Button
            variant={showGrid ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
            className="h-7 w-7 p-0"
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          
          <div className="h-6 w-px bg-white/10" />
          
          {/* Save / Play */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-1" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          
          <Button
            variant={isPlaying ? 'destructive' : 'default'}
            size="sm"
            onClick={handlePlay}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 mr-1" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1" />
                Play
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handlePublish}
          >
            <Rocket className="w-4 h-4 mr-1" />
            Publish
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Panel - Project Explorer */}
          <ResizablePanel
            defaultSize={leftPanelCollapsed ? 0 : 20}
            minSize={0}
            maxSize={30}
            collapsible
            onCollapse={() => setLeftPanelCollapsed(true)}
            onExpand={() => setLeftPanelCollapsed(false)}
          >
            <div className="h-full bg-[#0f0f1a] border-r border-white/10">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                <TabsList className="w-full justify-start rounded-none border-b border-white/10 bg-transparent h-10 p-0">
                  <TabsTrigger
                    value="scene"
                    className="rounded-none data-[state=active]:bg-white/10 h-full"
                  >
                    <Layers className="w-4 h-4" />
                  </TabsTrigger>
                  <TabsTrigger
                    value="assets"
                    className="rounded-none data-[state=active]:bg-white/10 h-full"
                  >
                    <Box className="w-4 h-4" />
                  </TabsTrigger>
                  <TabsTrigger
                    value="scripts"
                    className="rounded-none data-[state=active]:bg-white/10 h-full"
                  >
                    <Code className="w-4 h-4" />
                  </TabsTrigger>
                  <TabsTrigger
                    value="ai"
                    className="rounded-none data-[state=active]:bg-white/10 h-full"
                  >
                    <Brain className="w-4 h-4" />
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    className="rounded-none data-[state=active]:bg-white/10 h-full"
                  >
                    <Settings className="w-4 h-4" />
                  </TabsTrigger>
                </TabsList>
                
                <ScrollArea className="h-[calc(100%-40px)]">
                  {/* Scene Tab */}
                  <TabsContent value="scene" className="m-0 p-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-white/40 uppercase">Scenes</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={handleAddScene}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    {project.scenes.map(scene => (
                      <div
                        key={scene.id}
                        className={cn(
                          'p-2 rounded cursor-pointer flex items-center gap-2 mb-1',
                          selectedScene?.id === scene.id
                            ? 'bg-violet-600/20 text-violet-400'
                            : 'hover:bg-white/5 text-white/60'
                        )}
                        onClick={() => setSelectedScene(scene)}
                      >
                        <Layers className="w-4 h-4" />
                        <span className="text-sm truncate">{scene.name}</span>
                        {project.mainScene === scene.id && (
                          <Badge variant="secondary" className="text-[10px] h-4">
                            Main
                          </Badge>
                        )}
                      </div>
                    ))}
                    
                    {selectedScene && (
                      <>
                        <div className="h-px bg-white/10 my-3" />
                        
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-white/40 uppercase">Hierarchy</span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleAddObject('empty')}>
                                Empty Object
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAddObject('mesh')}>
                                Mesh
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAddObject('light')}>
                                Light
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAddObject('camera')}>
                                Camera
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleAddObject('spawner')}>
                                Spawn Point
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAddObject('trigger')}>
                                Trigger Zone
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        {selectedScene.rootObjects.map(obj => (
                          <SceneObjectItem
                            key={obj.id}
                            object={obj}
                            selected={selectedObject?.id === obj.id}
                            onSelect={() => setSelectedObject(obj)}
                            depth={0}
                          />
                        ))}
                      </>
                    )}
                  </TabsContent>
                  
                  {/* Assets Tab */}
                  <TabsContent value="assets" className="m-0 p-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-white/40 uppercase">Assets</span>
                      <label>
                        <input
                          type="file"
                          multiple
                          className="hidden"
                          onChange={(e) => e.target.files && handleUploadAsset(e.target.files)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 cursor-pointer"
                          asChild
                        >
                          <span>
                            <Upload className="w-3 h-3" />
                          </span>
                        </Button>
                      </label>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-1">
                      {project.assets.map(asset => (
                        <div
                          key={asset.id}
                          className={cn(
                            'aspect-square rounded overflow-hidden cursor-pointer border-2',
                            selectedAsset?.id === asset.id
                              ? 'border-violet-500'
                              : 'border-transparent hover:border-white/20'
                          )}
                          onClick={() => setSelectedAsset(asset)}
                        >
                          {asset.type.startsWith('texture') ? (
                            <img
                              src={asset.url}
                              alt={asset.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-white/5 flex items-center justify-center">
                              <AssetIcon type={asset.type} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {project.assets.length === 0 && (
                      <div className="text-center py-8 text-white/40 text-sm">
                        <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No assets yet</p>
                        <p className="text-xs">Drop files here or click to upload</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  {/* Scripts Tab */}
                  <TabsContent value="scripts" className="m-0 p-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-white/40 uppercase">Scripts</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={handleCreateScript}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    {project.scripts.map(script => (
                      <div
                        key={script.id}
                        className={cn(
                          'p-2 rounded cursor-pointer flex items-center gap-2 mb-1',
                          selectedScript?.id === script.id
                            ? 'bg-violet-600/20 text-violet-400'
                            : 'hover:bg-white/5 text-white/60'
                        )}
                        onClick={() => setSelectedScript(script)}
                      >
                        <Code className="w-4 h-4" />
                        <span className="text-sm truncate">{script.name}</span>
                        {script.compileErrors && script.compileErrors.length > 0 && (
                          <Badge variant="destructive" className="text-[10px] h-4">
                            {script.compileErrors.length}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </TabsContent>
                  
                  {/* AI Tab */}
                  <TabsContent value="ai" className="m-0 p-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-white/40 uppercase">AI Behaviors</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    {project.aiConfigs.map(config => (
                      <div
                        key={config.id}
                        className="p-2 rounded cursor-pointer flex items-center gap-2 mb-1 hover:bg-white/5 text-white/60"
                      >
                        <Brain className="w-4 h-4" />
                        <span className="text-sm truncate">{config.name}</span>
                      </div>
                    ))}
                    
                    {project.aiConfigs.length === 0 && (
                      <div className="text-center py-8 text-white/40 text-sm">
                        <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No AI behaviors</p>
                        <p className="text-xs">Add AI to make opponents</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  {/* Settings Tab */}
                  <TabsContent value="settings" className="m-0 p-2">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-xs text-white/40">Project Name</Label>
                        <Input
                          value={project.name}
                          onChange={(e) => setProject({ ...project, name: e.target.value })}
                          className="mt-1 bg-white/5 border-white/10"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs text-white/40">Description</Label>
                        <Textarea
                          value={project.description}
                          onChange={(e) => setProject({ ...project, description: e.target.value })}
                          className="mt-1 bg-white/5 border-white/10 min-h-[80px]"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs text-white/40">Target Graphics Tier</Label>
                        <Select
                          value={project.settings.targetGraphicsTier}
                          onValueChange={(v) => setProject({
                            ...project,
                            settings: { ...project.settings, targetGraphicsTier: v as any }
                          })}
                        >
                          <SelectTrigger className="mt-1 bg-white/5 border-white/10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="S">Tier S (Console)</SelectItem>
                            <SelectItem value="A">Tier A (Desktop)</SelectItem>
                            <SelectItem value="B">Tier B (Tablet)</SelectItem>
                            <SelectItem value="C">Tier C (Mobile)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-xs text-white/40">Target FPS</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Slider
                            value={[project.settings.targetFPS]}
                            onValueChange={([v]) => setProject({
                              ...project,
                              settings: { ...project.settings, targetFPS: v }
                            })}
                            min={30}
                            max={120}
                            step={15}
                            className="flex-1"
                          />
                          <span className="text-sm text-white/60 w-12">
                            {project.settings.targetFPS}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-white/40">Allow Forking</Label>
                        <Switch
                          checked={project.settings.allowForking}
                          onCheckedChange={(v) => setProject({
                            ...project,
                            settings: { ...project.settings, allowForking: v }
                          })}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </div>
          </ResizablePanel>
          
          <ResizableHandle className="w-1 bg-white/5" />
          
          {/* Center - Viewport */}
          <ResizablePanel defaultSize={60}>
            <div className="h-full bg-[#16213e] relative">
              {/* Viewport would render Three.js scene */}
              <div className="absolute inset-0 flex items-center justify-center">
                {isPlaying ? (
                  <div className="text-white/40 text-center">
                    <Gamepad2 className="w-16 h-16 mx-auto mb-4 animate-pulse" />
                    <p>Game Preview Running</p>
                    <p className="text-sm">Click Stop to return to editor</p>
                  </div>
                ) : (
                  <div className="text-white/40 text-center">
                    <Box className="w-16 h-16 mx-auto mb-4" />
                    <p>Scene Viewport</p>
                    <p className="text-sm">Select objects to edit</p>
                  </div>
                )}
              </div>
              
              {/* View Mode Selector */}
              <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/40 rounded-lg p-1">
                {(['3d', 'top', 'front', 'side'] as ViewMode[]).map(mode => (
                  <Button
                    key={mode}
                    variant={viewMode === mode ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setViewMode(mode)}
                  >
                    {mode.toUpperCase()}
                  </Button>
                ))}
              </div>
              
              {/* Object Info */}
              {selectedObject && (
                <div className="absolute bottom-4 left-4 bg-black/60 rounded-lg p-3 text-xs text-white/60">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white">{selectedObject.name}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {selectedObject.type}
                    </Badge>
                  </div>
                  <div>
                    Position: {selectedObject.position.map(p => p.toFixed(2)).join(', ')}
                  </div>
                </div>
              )}
            </div>
          </ResizablePanel>
          
          <ResizableHandle className="w-1 bg-white/5" />
          
          {/* Right Panel - Inspector */}
          <ResizablePanel
            defaultSize={rightPanelCollapsed ? 0 : 20}
            minSize={0}
            maxSize={30}
            collapsible
            onCollapse={() => setRightPanelCollapsed(true)}
            onExpand={() => setRightPanelCollapsed(false)}
          >
            <div className="h-full bg-[#0f0f1a] border-l border-white/10">
              <div className="h-10 border-b border-white/10 flex items-center px-3">
                <span className="text-sm text-white/60">Inspector</span>
              </div>
              
              <ScrollArea className="h-[calc(100%-40px)]">
                {selectedObject ? (
                  <ObjectInspector
                    object={selectedObject}
                    onUpdate={(updated) => {
                      setSelectedObject(updated);
                      // Update in scene
                    }}
                  />
                ) : selectedAsset ? (
                  <AssetInspector asset={selectedAsset} />
                ) : selectedScript ? (
                  <ScriptEditor
                    script={selectedScript}
                    onUpdate={async (code) => {
                      const result = await studioService.updateScript(selectedScript.id, code);
                      setSelectedScript({
                        ...selectedScript,
                        code,
                        compileErrors: result.errors,
                        compileWarnings: result.warnings,
                      });
                    }}
                  />
                ) : (
                  <div className="p-4 text-center text-white/40 text-sm">
                    <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Select an object to inspect</p>
                  </div>
                )}
              </ScrollArea>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      
      {/* Bottom Panel - Console/Output */}
      <AnimatePresence>
        {!bottomPanelCollapsed && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 200 }}
            exit={{ height: 0 }}
            className="bg-[#0f0f1a] border-t border-white/10 overflow-hidden"
          >
            <div className="h-8 border-b border-white/10 flex items-center justify-between px-3">
              <div className="flex items-center gap-4">
                <span className="text-xs text-white/60">Console</span>
                <span className="text-xs text-white/60">Build</span>
                <span className="text-xs text-white/60">Analytics</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setBottomPanelCollapsed(true)}
              >
                <Minimize2 className="w-3 h-3" />
              </Button>
            </div>
            <ScrollArea className="h-[calc(100%-32px)] p-2">
              <div className="text-xs text-white/40 font-mono">
                [System] Lucy Game Studio initialized
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
      
      {bottomPanelCollapsed && (
        <div className="h-8 bg-[#0f0f1a] border-t border-white/10 flex items-center px-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={() => setBottomPanelCollapsed(false)}
          >
            <Maximize2 className="w-3 h-3 mr-1" />
            Console
          </Button>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const SceneObjectItem: React.FC<{
  object: SceneObject;
  selected: boolean;
  onSelect: () => void;
  depth: number;
}> = ({ object, selected, onSelect, depth }) => (
  <div style={{ paddingLeft: depth * 16 }}>
    <div
      className={cn(
        'p-1.5 rounded cursor-pointer flex items-center gap-2',
        selected
          ? 'bg-violet-600/20 text-violet-400'
          : 'hover:bg-white/5 text-white/60'
      )}
      onClick={onSelect}
    >
      <ObjectTypeIcon type={object.type} />
      <span className="text-xs truncate">{object.name}</span>
    </div>
    {object.children.map(child => (
      <SceneObjectItem
        key={child.id}
        object={child}
        selected={false}
        onSelect={() => {}}
        depth={depth + 1}
      />
    ))}
  </div>
);

const ObjectTypeIcon: React.FC<{ type: SceneObject['type'] }> = ({ type }) => {
  switch (type) {
    case 'mesh': return <Box className="w-3 h-3" />;
    case 'light': return <Sun className="w-3 h-3" />;
    case 'camera': return <Eye className="w-3 h-3" />;
    case 'audio_source': return <Music className="w-3 h-3" />;
    case 'spawner': return <Target className="w-3 h-3" />;
    default: return <Folder className="w-3 h-3" />;
  }
};

const AssetIcon: React.FC<{ type: ProjectAsset['type'] }> = ({ type }) => {
  switch (type) {
    case 'model_3d': return <Box className="w-6 h-6 text-blue-400" />;
    case 'audio_sfx':
    case 'audio_music':
    case 'audio_ambient': return <Music className="w-6 h-6 text-green-400" />;
    case 'animation': return <Cpu className="w-6 h-6 text-purple-400" />;
    default: return <File className="w-6 h-6 text-white/40" />;
  }
};

const ObjectInspector: React.FC<{
  object: SceneObject;
  onUpdate: (obj: SceneObject) => void;
}> = ({ object, onUpdate }) => (
  <div className="p-3 space-y-4">
    <div>
      <Label className="text-xs text-white/40">Name</Label>
      <Input
        value={object.name}
        onChange={(e) => onUpdate({ ...object, name: e.target.value })}
        className="mt-1 bg-white/5 border-white/10 text-sm"
      />
    </div>
    
    <div>
      <Label className="text-xs text-white/40">Position</Label>
      <div className="grid grid-cols-3 gap-1 mt-1">
        {['X', 'Y', 'Z'].map((axis, i) => (
          <div key={axis}>
            <Label className="text-[10px] text-white/30">{axis}</Label>
            <Input
              type="number"
              value={object.position[i]}
              onChange={(e) => {
                const newPos = [...object.position] as [number, number, number];
                newPos[i] = parseFloat(e.target.value) || 0;
                onUpdate({ ...object, position: newPos });
              }}
              className="bg-white/5 border-white/10 text-xs h-7"
            />
          </div>
        ))}
      </div>
    </div>
    
    <div>
      <Label className="text-xs text-white/40">Scale</Label>
      <div className="grid grid-cols-3 gap-1 mt-1">
        {['X', 'Y', 'Z'].map((axis, i) => (
          <div key={axis}>
            <Label className="text-[10px] text-white/30">{axis}</Label>
            <Input
              type="number"
              value={object.scale[i]}
              onChange={(e) => {
                const newScale = [...object.scale] as [number, number, number];
                newScale[i] = parseFloat(e.target.value) || 1;
                onUpdate({ ...object, scale: newScale });
              }}
              className="bg-white/5 border-white/10 text-xs h-7"
            />
          </div>
        ))}
      </div>
    </div>
    
    <div className="flex items-center justify-between">
      <Label className="text-xs text-white/40">Active</Label>
      <Switch
        checked={object.isActive}
        onCheckedChange={(v) => onUpdate({ ...object, isActive: v })}
      />
    </div>
    
    <div className="flex items-center justify-between">
      <Label className="text-xs text-white/40">Static</Label>
      <Switch
        checked={object.isStatic}
        onCheckedChange={(v) => onUpdate({ ...object, isStatic: v })}
      />
    </div>
    
    <div className="h-px bg-white/10" />
    
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label className="text-xs text-white/40">Components</Label>
        <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
          <Plus className="w-3 h-3" />
        </Button>
      </div>
      
      {object.components.map((comp, i) => (
        <div key={i} className="bg-white/5 rounded p-2 mb-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60">{comp.type}</span>
            <Switch checked={comp.enabled} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AssetInspector: React.FC<{ asset: ProjectAsset }> = ({ asset }) => (
  <div className="p-3 space-y-4">
    <div>
      <Label className="text-xs text-white/40">Name</Label>
      <p className="text-sm text-white">{asset.name}</p>
    </div>
    
    <div>
      <Label className="text-xs text-white/40">Type</Label>
      <Badge variant="secondary" className="mt-1">{asset.type}</Badge>
    </div>
    
    <div>
      <Label className="text-xs text-white/40">Size</Label>
      <p className="text-sm text-white">{(asset.sizeBytes / 1024).toFixed(1)} KB</p>
    </div>
    
    <div>
      <Label className="text-xs text-white/40">Status</Label>
      <div className="flex items-center gap-2 mt-1">
        {asset.isProcessed ? (
          <Badge variant="default" className="bg-green-600">Processed</Badge>
        ) : (
          <Badge variant="secondary">{asset.processingStatus}</Badge>
        )}
      </div>
    </div>
    
    {asset.metadata && Object.keys(asset.metadata).length > 0 && (
      <div>
        <Label className="text-xs text-white/40">Metadata</Label>
        <div className="mt-1 text-xs text-white/60 space-y-1">
          {asset.metadata.triangleCount && (
            <div>Triangles: {asset.metadata.triangleCount.toLocaleString()}</div>
          )}
          {asset.metadata.width && (
            <div>Size: {asset.metadata.width}x{asset.metadata.height}</div>
          )}
          {asset.metadata.duration && (
            <div>Duration: {asset.metadata.duration.toFixed(2)}s</div>
          )}
        </div>
      </div>
    )}
  </div>
);

const ScriptEditor: React.FC<{
  script: ProjectScript;
  onUpdate: (code: string) => void;
}> = ({ script, onUpdate }) => {
  const [code, setCode] = useState(script.code);
  
  useEffect(() => {
    setCode(script.code);
  }, [script.id]);
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-2 border-b border-white/10 flex items-center justify-between">
        <span className="text-xs text-white/60">{script.name}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6"
          onClick={() => onUpdate(code)}
        >
          <Save className="w-3 h-3 mr-1" />
          Save
        </Button>
      </div>
      
      {script.compileErrors && script.compileErrors.length > 0 && (
        <div className="p-2 bg-red-900/20 border-b border-red-500/20">
          {script.compileErrors.map((err, i) => (
            <div key={i} className="text-xs text-red-400">
              Line {err.line}: {err.message}
            </div>
          ))}
        </div>
      )}
      
      <Textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="flex-1 bg-transparent border-none font-mono text-xs resize-none focus:ring-0"
        placeholder="// Write your game code here..."
      />
    </div>
  );
};

export default GameStudioWorkspace;
