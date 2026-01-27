/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — DEV STUDIO SERVICE                                       │
 * │                                                                             │
 * │ Service for managing dev studio projects, files, and deployments           │
 * │                                                                             │
 * │ Lucy helps you build, deploy, and ship.                                    │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { supabase } from '@/integrations/supabase/client';

// =============================================================================
// TYPES
// =============================================================================

export type ProjectType = 'website' | 'webapp' | 'api' | 'component' | 'template';
export type ProjectStatus = 'draft' | 'building' | 'deployed' | 'archived';

export interface DevProject {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description?: string;
  projectType: ProjectType;
  templateId?: string;
  status: ProjectStatus;
  framework: string;
  buildConfig: Record<string, unknown>;
  deployedUrl?: string;
  customDomain?: string;
  thumbnailUrl?: string;
  tags: string[];
  isPublic: boolean;
  viewsCount: number;
  forksCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DevFile {
  id: string;
  projectId: string;
  path: string;
  name: string;
  fileType: 'file' | 'directory';
  mimeType?: string;
  content?: string;
  sizeBytes?: number;
  isGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DevVersion {
  id: string;
  projectId: string;
  versionNumber: number;
  versionName?: string;
  description?: string;
  versionType: 'manual' | 'auto' | 'deploy';
  createdBy?: string;
  createdAt: Date;
}

export interface ProjectDomain {
  id: string;
  projectId: string;
  domain: string;
  subdomain?: string;
  isVerified: boolean;
  verificationToken: string;
  verificationMethod: 'cname' | 'txt' | 'file';
  verifiedAt?: Date;
  dnsRecords: { type: string; name: string; value: string }[];
  sslStatus: 'pending' | 'provisioning' | 'active' | 'failed';
  sslExpiresAt?: Date;
  status: 'pending' | 'active' | 'suspended' | 'removed';
  createdAt: Date;
}

// =============================================================================
// PROJECT MANAGEMENT
// =============================================================================

export async function createProject(
  name: string,
  projectType: ProjectType = 'website',
  templateId?: string
): Promise<string> {
  const { data, error } = await supabase
    .rpc('create_devstudio_project', {
      p_name: name,
      p_project_type: projectType,
      p_template_id: templateId || null
    });

  if (error) throw new Error(`Failed to create project: ${error.message}`);
  return data as string;
}

export async function getProjects(): Promise<DevProject[]> {
  const { data, error } = await supabase
    .from('devstudio_projects')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapProjectFromDb);
}

export async function getProject(projectId: string): Promise<DevProject | null> {
  const { data, error } = await supabase
    .from('devstudio_projects')
    .select('*')
    .eq('id', projectId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return mapProjectFromDb(data);
}

export async function updateProject(
  projectId: string,
  updates: Partial<Pick<DevProject, 'name' | 'description' | 'tags' | 'isPublic' | 'buildConfig'>>
): Promise<void> {
  const { error } = await supabase
    .from('devstudio_projects')
    .update({
      name: updates.name,
      description: updates.description,
      tags: updates.tags,
      is_public: updates.isPublic,
      build_config: updates.buildConfig,
      updated_at: new Date().toISOString()
    })
    .eq('id', projectId);

  if (error) throw error;
}

export async function deleteProject(projectId: string): Promise<void> {
  const { error } = await supabase
    .from('devstudio_projects')
    .delete()
    .eq('id', projectId);

  if (error) throw error;
}

function mapProjectFromDb(data: Record<string, unknown>): DevProject {
  return {
    id: data.id as string,
    userId: data.user_id as string,
    name: data.name as string,
    slug: data.slug as string,
    description: data.description as string | undefined,
    projectType: data.project_type as ProjectType,
    templateId: data.template_id as string | undefined,
    status: data.status as ProjectStatus,
    framework: data.framework as string,
    buildConfig: (data.build_config as Record<string, unknown>) || {},
    deployedUrl: data.deployed_url as string | undefined,
    customDomain: data.custom_domain as string | undefined,
    thumbnailUrl: data.thumbnail_url as string | undefined,
    tags: (data.tags as string[]) || [],
    isPublic: data.is_public as boolean,
    viewsCount: data.views_count as number,
    forksCount: data.forks_count as number,
    createdAt: new Date(data.created_at as string),
    updatedAt: new Date(data.updated_at as string)
  };
}

// =============================================================================
// FILE MANAGEMENT
// =============================================================================

export async function getFiles(projectId: string): Promise<DevFile[]> {
  const { data, error } = await supabase
    .from('devstudio_files')
    .select('*')
    .eq('project_id', projectId)
    .order('path', { ascending: true });

  if (error) throw error;
  return (data || []).map(mapFileFromDb);
}

export async function getFile(projectId: string, path: string): Promise<DevFile | null> {
  const { data, error } = await supabase
    .from('devstudio_files')
    .select('*')
    .eq('project_id', projectId)
    .eq('path', path)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return mapFileFromDb(data);
}

export async function createFile(
  projectId: string,
  path: string,
  name: string,
  content: string = '',
  fileType: 'file' | 'directory' = 'file'
): Promise<string> {
  const mimeType = fileType === 'file' ? getMimeType(name) : undefined;

  const { data, error } = await supabase
    .from('devstudio_files')
    .insert({
      project_id: projectId,
      path,
      name,
      file_type: fileType,
      mime_type: mimeType,
      content: fileType === 'file' ? content : null,
      size_bytes: fileType === 'file' ? new Blob([content]).size : null
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function updateFile(
  projectId: string,
  path: string,
  content: string
): Promise<void> {
  const { error } = await supabase
    .from('devstudio_files')
    .update({
      content,
      size_bytes: new Blob([content]).size,
      updated_at: new Date().toISOString()
    })
    .eq('project_id', projectId)
    .eq('path', path);

  if (error) throw error;
}

export async function deleteFile(projectId: string, path: string): Promise<void> {
  // Delete file and all children (for directories)
  const { error } = await supabase
    .from('devstudio_files')
    .delete()
    .eq('project_id', projectId)
    .or(`path.eq.${path},path.like.${path}/%`);

  if (error) throw error;
}

export async function renameFile(
  projectId: string,
  oldPath: string,
  newPath: string,
  newName: string
): Promise<void> {
  const { error } = await supabase
    .from('devstudio_files')
    .update({
      path: newPath,
      name: newName,
      updated_at: new Date().toISOString()
    })
    .eq('project_id', projectId)
    .eq('path', oldPath);

  if (error) throw error;
}

function mapFileFromDb(data: Record<string, unknown>): DevFile {
  return {
    id: data.id as string,
    projectId: data.project_id as string,
    path: data.path as string,
    name: data.name as string,
    fileType: data.file_type as 'file' | 'directory',
    mimeType: data.mime_type as string | undefined,
    content: data.content as string | undefined,
    sizeBytes: data.size_bytes as number | undefined,
    isGenerated: data.is_generated as boolean,
    createdAt: new Date(data.created_at as string),
    updatedAt: new Date(data.updated_at as string)
  };
}

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'ts': 'application/typescript',
    'tsx': 'application/typescript',
    'jsx': 'application/javascript',
    'json': 'application/json',
    'md': 'text/markdown',
    'txt': 'text/plain',
    'svg': 'image/svg+xml',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'webp': 'image/webp'
  };
  return mimeTypes[ext || ''] || 'text/plain';
}

// =============================================================================
// VERSION CONTROL
// =============================================================================

export async function getVersions(projectId: string): Promise<DevVersion[]> {
  const { data, error } = await supabase
    .from('devstudio_versions')
    .select('*')
    .eq('project_id', projectId)
    .order('version_number', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapVersionFromDb);
}

export async function createVersion(
  projectId: string,
  versionName?: string,
  description?: string
): Promise<string> {
  // Get current version number
  const { data: versions } = await supabase
    .from('devstudio_versions')
    .select('version_number')
    .eq('project_id', projectId)
    .order('version_number', { ascending: false })
    .limit(1);

  const nextVersion = (versions?.[0]?.version_number || 0) + 1;

  const { data: userData } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('devstudio_versions')
    .insert({
      project_id: projectId,
      version_number: nextVersion,
      version_name: versionName,
      description,
      version_type: 'manual',
      created_by: userData.user?.id
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

function mapVersionFromDb(data: Record<string, unknown>): DevVersion {
  return {
    id: data.id as string,
    projectId: data.project_id as string,
    versionNumber: data.version_number as number,
    versionName: data.version_name as string | undefined,
    description: data.description as string | undefined,
    versionType: data.version_type as 'manual' | 'auto' | 'deploy',
    createdBy: data.created_by as string | undefined,
    createdAt: new Date(data.created_at as string)
  };
}

// =============================================================================
// DOMAIN MANAGEMENT
// =============================================================================

export async function getDomains(projectId: string): Promise<ProjectDomain[]> {
  const { data, error } = await supabase
    .from('project_domains')
    .select('*')
    .eq('project_id', projectId);

  if (error) throw error;
  return (data || []).map(mapDomainFromDb);
}

export async function addDomain(projectId: string, domain: string): Promise<string> {
  const { data, error } = await supabase
    .from('project_domains')
    .insert({
      project_id: projectId,
      domain: domain.toLowerCase(),
      dns_records: [
        { type: 'CNAME', name: domain, value: 'projects.lucylounge.dev' },
        { type: 'TXT', name: `_verify.${domain}`, value: '' } // Token will be set by trigger
      ]
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function verifyDomain(domainId: string): Promise<boolean> {
  // In production, this would check DNS records
  // For now, mark as verified
  const { error } = await supabase
    .from('project_domains')
    .update({
      is_verified: true,
      verified_at: new Date().toISOString(),
      status: 'active',
      ssl_status: 'provisioning'
    })
    .eq('id', domainId);

  if (error) throw error;
  return true;
}

export async function removeDomain(domainId: string): Promise<void> {
  const { error } = await supabase
    .from('project_domains')
    .delete()
    .eq('id', domainId);

  if (error) throw error;
}

function mapDomainFromDb(data: Record<string, unknown>): ProjectDomain {
  return {
    id: data.id as string,
    projectId: data.project_id as string,
    domain: data.domain as string,
    subdomain: data.subdomain as string | undefined,
    isVerified: data.is_verified as boolean,
    verificationToken: data.verification_token as string,
    verificationMethod: data.verification_method as 'cname' | 'txt' | 'file',
    verifiedAt: data.verified_at ? new Date(data.verified_at as string) : undefined,
    dnsRecords: (data.dns_records as { type: string; name: string; value: string }[]) || [],
    sslStatus: data.ssl_status as 'pending' | 'provisioning' | 'active' | 'failed',
    sslExpiresAt: data.ssl_expires_at ? new Date(data.ssl_expires_at as string) : undefined,
    status: data.status as 'pending' | 'active' | 'suspended' | 'removed',
    createdAt: new Date(data.created_at as string)
  };
}

// =============================================================================
// TEMPLATES
// =============================================================================

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  framework: string;
  thumbnail: string;
  files: { path: string; content: string }[];
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'blank-react',
    name: 'Blank React App',
    description: 'A minimal React application with TypeScript',
    category: 'starter',
    framework: 'react',
    thumbnail: '/templates/react.png',
    files: [
      { path: '/src/App.tsx', content: 'export default function App() {\n  return <div>Hello World</div>;\n}' },
      { path: '/src/index.css', content: '* { margin: 0; padding: 0; box-sizing: border-box; }' },
      { path: '/public/index.html', content: '<!DOCTYPE html>\n<html>\n<head><title>My App</title></head>\n<body><div id="root"></div></body>\n</html>' }
    ]
  },
  {
    id: 'landing-page',
    name: 'Landing Page',
    description: 'A modern landing page with hero, features, and CTA',
    category: 'marketing',
    framework: 'react',
    thumbnail: '/templates/landing.png',
    files: [
      { path: '/src/App.tsx', content: `import './index.css';

export default function App() {
  return (
    <div className="min-h-screen-dvh bg-gradient-to-br from-purple-900 to-indigo-900 text-white">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Your Brand</h1>
        <nav className="space-x-4">
          <a href="#features" className="hover:text-purple-300">Features</a>
          <a href="#pricing" className="hover:text-purple-300">Pricing</a>
          <button className="bg-purple-500 px-4 py-2 rounded-lg hover:bg-purple-600">Get Started</button>
        </nav>
      </header>
      
      <main className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6">Build Something Amazing</h2>
        <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
          The fastest way to bring your ideas to life. Start building today.
        </p>
        <button className="bg-white text-purple-900 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-purple-100">
          Start Free Trial
        </button>
      </main>
    </div>
  );
}` },
      { path: '/src/index.css', content: '@tailwind base;\n@tailwind components;\n@tailwind utilities;' }
    ]
  },
  {
    id: 'dashboard',
    name: 'Admin Dashboard',
    description: 'A dashboard template with sidebar and charts',
    category: 'app',
    framework: 'react',
    thumbnail: '/templates/dashboard.png',
    files: []
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'A personal portfolio showcasing your work',
    category: 'personal',
    framework: 'react',
    thumbnail: '/templates/portfolio.png',
    files: []
  },
  {
    id: 'blog',
    name: 'Blog',
    description: 'A blog template with posts and categories',
    category: 'content',
    framework: 'react',
    thumbnail: '/templates/blog.png',
    files: []
  },
  {
    id: 'ecommerce',
    name: 'E-commerce Store',
    description: 'An online store with products and cart',
    category: 'commerce',
    framework: 'react',
    thumbnail: '/templates/ecommerce.png',
    files: []
  }
];

export function getTemplates(category?: string): ProjectTemplate[] {
  if (category) {
    return PROJECT_TEMPLATES.filter(t => t.category === category);
  }
  return PROJECT_TEMPLATES;
}

export function getTemplate(templateId: string): ProjectTemplate | undefined {
  return PROJECT_TEMPLATES.find(t => t.id === templateId);
}

export default {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  getFiles,
  getFile,
  createFile,
  updateFile,
  deleteFile,
  renameFile,
  getVersions,
  createVersion,
  getDomains,
  addDomain,
  verifyDomain,
  removeDomain,
  getTemplates,
  getTemplate
};
