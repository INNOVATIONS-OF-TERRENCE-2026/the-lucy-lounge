/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — DEV STUDIO                                               │
 * │                                                                             │
 * │ AI-powered development workspace for building websites and apps            │
 * │ Project management, templates, AI assistance                               │
 * │                                                                             │
 * │ Lucy helps you build.                                                      │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Code, 
  Layers, 
  Zap, 
  Globe, 
  Database, 
  GitBranch, 
  Terminal, 
  Boxes,
  Plus,
  FolderOpen,
  Trash2,
  Clock,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StudiosSEO } from '@/components/seo/StudiosSEO';
import { DevStudioWorkspace } from '@/components/devstudio/DevStudioWorkspace';
import devStudioService, { DevProject, ProjectTemplate } from '@/services/devStudioService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// =============================================================================
// COMPONENT
// =============================================================================

const StudiosDev = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  // State
  const [projects, setProjects] = useState<DevProject[]>([]);
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectTemplate, setNewProjectTemplate] = useState('blank');
  const [creating, setCreating] = useState(false);

  // Load projects and templates
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [projectsData, templatesData] = await Promise.all([
          isAuthenticated ? devStudioService.getProjects() : Promise.resolve([]),
          devStudioService.getTemplates(),
        ]);
        setProjects(projectsData);
        setTemplates(templatesData);
      } catch (err) {
        console.error('[StudiosDev] Load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated]);

  // Create new project
  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast({ title: 'Please enter a project name', variant: 'destructive' });
      return;
    }

    if (!isAuthenticated) {
      toast({ title: 'Please sign in to create projects', variant: 'destructive' });
      return;
    }

    setCreating(true);
    try {
      const projectId = await devStudioService.createProject(
        newProjectName.trim(),
        newProjectTemplate as any
      );

      if (projectId) {
        const updatedProjects = await devStudioService.getProjects();
        setProjects(updatedProjects);
        setShowNewProjectDialog(false);
        setNewProjectName('');
        setNewProjectTemplate('blank');
        setActiveProjectId(projectId);
        toast({ title: 'Project created!' });
      }
    } catch (err) {
      console.error('[StudiosDev] Create project error:', err);
      toast({ title: 'Failed to create project', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  // Delete project
  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this project? This cannot be undone.')) return;

    try {
      await devStudioService.deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      toast({ title: 'Project deleted' });
    } catch (err) {
      console.error('[StudiosDev] Delete project error:', err);
      toast({ title: 'Failed to delete project', variant: 'destructive' });
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // If workspace is active, show it full screen
  if (activeProjectId) {
    return (
      <DevStudioWorkspace 
        projectId={activeProjectId} 
        onClose={() => setActiveProjectId(null)} 
      />
    );
  }

  const features = [
    {
      icon: Code,
      title: 'AI Code Generation',
      description: 'Generate production-ready code from descriptions',
    },
    {
      icon: Globe,
      title: 'Web App Builder',
      description: 'Create full-stack web applications instantly',
    },
    {
      icon: Database,
      title: 'Database Design',
      description: 'Intelligent database schema generation and optimization',
    },
    {
      icon: Layers,
      title: 'Component Library',
      description: 'Reusable UI components and design systems',
    },
    {
      icon: GitBranch,
      title: 'Version Control',
      description: 'Built-in Git integration and collaboration tools',
    },
    {
      icon: Terminal,
      title: 'CLI Tools',
      description: 'Command-line utilities and automation scripts',
    },
  ];

  return (
    <>
      <StudiosSEO studio="dev" />
      <div className="min-h-screen bg-gradient-primary relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-glow" />
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse-glow"
            style={{ animationDelay: '1s' }}
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-black/25 to-black/35 pointer-events-none" />

        <div className="relative z-10 container mx-auto px-6 py-12">
          {/* Back Button */}
          <Button variant="ghost" onClick={() => navigate('/studios')} className="mb-8 text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Studios
          </Button>

          {/* Hero Section */}
          <motion.div 
            className="text-center mb-12 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-glow-violet">
                <Code className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white text-shadow-strong">Dev Studio</h1>
            <p className="text-lg text-white/80 mb-8">
              AI-powered development workspace for building websites, applications, and automation workflows.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
              onClick={() => setShowNewProjectDialog(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              New Project
            </Button>
          </motion.div>

          {/* Projects Section */}
          {isAuthenticated && (
            <motion.div 
              className="max-w-6xl mx-auto mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <FolderOpen className="w-6 h-6" />
                Your Projects
              </h2>
              
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-white/50" />
                </div>
              ) : projects.length === 0 ? (
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="py-12 text-center">
                    <Boxes className="w-12 h-12 mx-auto text-white/30 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No projects yet</h3>
                    <p className="text-white/60 mb-4">Create your first project to get started</p>
                    <Button onClick={() => setShowNewProjectDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Project
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map((project) => (
                    <motion.div
                      key={project.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        className="bg-white/5 border-white/10 hover:border-blue-500/50 cursor-pointer transition-colors"
                        onClick={() => setActiveProjectId(project.id)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-white text-lg">{project.name}</CardTitle>
                              <CardDescription className="text-white/60">
                                {project.projectType}
                              </CardDescription>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-white/50 hover:text-red-400"
                              onClick={(e) => handleDeleteProject(project.id, e)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1 text-white/50">
                              <Clock className="w-3 h-3" />
                              {formatDate(project.updatedAt)}
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {project.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Templates Section */}
          <motion.div 
            className="max-w-6xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              Start from Template
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {templates.map((template) => (
                <Card 
                  key={template.id}
                  className="bg-white/5 border-white/10 hover:border-blue-500/50 cursor-pointer transition-colors"
                  onClick={() => {
                    setNewProjectTemplate(template.id);
                    setShowNewProjectDialog(true);
                  }}
                >
                  <CardContent className="pt-6">
                    <div className="text-3xl mb-3">{template.icon}</div>
                    <h3 className="font-medium text-white mb-1">{template.name}</h3>
                    <p className="text-sm text-white/60">{template.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div 
            className="max-w-6xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Development Capabilities</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="glass-card-enhanced p-6 hover:scale-105 transition-transform">
                  <feature.icon className="w-10 h-10 text-white mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/80 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* New Project Dialog */}
      <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Start a new project from scratch or use a template.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Name</label>
              <Input
                placeholder="My Awesome Project"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Template</label>
              <Select value={newProjectTemplate} onValueChange={setNewProjectTemplate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.icon} {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewProjectDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject} disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StudiosDev;
