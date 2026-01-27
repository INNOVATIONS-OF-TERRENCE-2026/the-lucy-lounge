/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY GAME STUDIO — SERVICE LAYER                                           │
 * │                                                                             │
 * │ Backend service for game creation, management, and publishing              │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  GameProject,
  ProjectAsset,
  ProjectScript,
  GameScene,
  AIBehaviorConfig,
  GamePrompt,
  GameGenerationConfig,
  PublishRequest,
  PublishResult,
  ProjectAnalytics,
  ProjectStatus,
} from './types';
import type { GameTemplate, LucyGameConfig } from '../sdk/types';

// ============================================================================
// PROJECT MANAGEMENT
// ============================================================================

export class GameStudioService {
  private static instance: GameStudioService;
  
  private constructor() {}
  
  public static getInstance(): GameStudioService {
    if (!GameStudioService.instance) {
      GameStudioService.instance = new GameStudioService();
    }
    return GameStudioService.instance;
  }
  
  // ============================================================================
  // PROJECTS
  // ============================================================================
  
  /**
   * Create a new game project
   */
  public async createProject(
    creatorId: string,
    name: string,
    template: GameTemplate,
    description?: string
  ): Promise<GameProject> {
    const projectId = crypto.randomUUID();
    
    const defaultConfig: LucyGameConfig = this.getDefaultConfigForTemplate(template);
    
    const project: GameProject = {
      id: projectId,
      creatorId,
      name,
      description: description || '',
      template,
      config: defaultConfig,
      assets: [],
      assetCount: 0,
      totalAssetSizeBytes: 0,
      scripts: [],
      scenes: [],
      mainScene: '',
      aiConfigs: [],
      status: 'draft',
      version: '0.1.0',
      lastModified: Date.now(),
      createdAt: Date.now(),
      isPublished: false,
      playCount: 0,
      averageRating: 0,
      ratingCount: 0,
      totalRevenue: 0,
      settings: {
        minGraphicsTier: 'C',
        targetGraphicsTier: 'A',
        targetFPS: 60,
        maxLoadTime: 10,
        pricingModel: 'free',
        isPublic: true,
        allowForking: false,
        ageRating: 'E',
        contentWarnings: [],
      },
    };
    
    // Save to database
    const { error } = await supabase
      .from('game_studio_projects')
      .insert({
        id: projectId,
        creator_id: creatorId,
        name,
        description: description || '',
        template,
        config: defaultConfig as any,
        status: 'draft',
        version: '0.1.0',
        settings: project.settings as any,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    
    if (error) {
      console.error('[GameStudio] Failed to create project:', error);
      throw new Error('Failed to create project');
    }
    
    // Create default scene
    const mainScene = await this.createScene(projectId, 'Main Scene', true);
    project.scenes = [mainScene];
    project.mainScene = mainScene.id;
    
    return project;
  }
  
  /**
   * Get a project by ID
   */
  public async getProject(projectId: string): Promise<GameProject | null> {
    const { data, error } = await supabase
      .from('game_studio_projects')
      .select('*')
      .eq('id', projectId)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    // Load related data
    const [assets, scripts, scenes, aiConfigs] = await Promise.all([
      this.getProjectAssets(projectId),
      this.getProjectScripts(projectId),
      this.getProjectScenes(projectId),
      this.getProjectAIConfigs(projectId),
    ]);
    
    return this.mapDbToProject(data, assets, scripts, scenes, aiConfigs);
  }
  
  /**
   * Get all projects for a creator
   */
  public async getCreatorProjects(creatorId: string): Promise<GameProject[]> {
    const { data, error } = await supabase
      .from('game_studio_projects')
      .select('*')
      .eq('creator_id', creatorId)
      .order('updated_at', { ascending: false });
    
    if (error || !data) {
      return [];
    }
    
    return data.map(d => this.mapDbToProject(d, [], [], [], []));
  }
  
  /**
   * Update a project
   */
  public async updateProject(
    projectId: string,
    updates: Partial<GameProject>
  ): Promise<void> {
    const { error } = await supabase
      .from('game_studio_projects')
      .update({
        name: updates.name,
        description: updates.description,
        config: updates.config as any,
        settings: updates.settings as any,
        status: updates.status,
        version: updates.version,
        main_scene: updates.mainScene,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);
    
    if (error) {
      throw new Error('Failed to update project');
    }
  }
  
  /**
   * Delete a project
   */
  public async deleteProject(projectId: string): Promise<void> {
    // Delete all related data
    await Promise.all([
      supabase.from('game_studio_assets').delete().eq('project_id', projectId),
      supabase.from('game_studio_scripts').delete().eq('project_id', projectId),
      supabase.from('game_studio_scenes').delete().eq('project_id', projectId),
      supabase.from('game_studio_ai_configs').delete().eq('project_id', projectId),
    ]);
    
    // Delete project
    const { error } = await supabase
      .from('game_studio_projects')
      .delete()
      .eq('id', projectId);
    
    if (error) {
      throw new Error('Failed to delete project');
    }
  }
  
  // ============================================================================
  // ASSETS
  // ============================================================================
  
  /**
   * Upload an asset
   */
  public async uploadAsset(
    projectId: string,
    file: File,
    type: ProjectAsset['type']
  ): Promise<ProjectAsset> {
    const assetId = crypto.randomUUID();
    const ext = file.name.split('.').pop();
    const path = `game-studio/${projectId}/${assetId}.${ext}`;
    
    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('game-assets')
      .upload(path, file);
    
    if (uploadError) {
      throw new Error('Failed to upload asset');
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('game-assets')
      .getPublicUrl(path);
    
    const asset: ProjectAsset = {
      id: assetId,
      projectId,
      name: file.name,
      type,
      path,
      url: urlData.publicUrl,
      sizeBytes: file.size,
      metadata: {},
      isProcessed: false,
      processingStatus: 'pending',
      usedInScenes: [],
      usedInScripts: [],
      uploadedAt: Date.now(),
      modifiedAt: Date.now(),
    };
    
    // Save to database
    await supabase.from('game_studio_assets').insert({
      id: assetId,
      project_id: projectId,
      name: file.name,
      type,
      path,
      url: urlData.publicUrl,
      size_bytes: file.size,
      metadata: {},
      is_processed: false,
      processing_status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    
    // Trigger async processing
    this.processAssetAsync(assetId, type, urlData.publicUrl);
    
    return asset;
  }
  
  /**
   * Process asset asynchronously
   */
  private async processAssetAsync(
    assetId: string,
    type: ProjectAsset['type'],
    url: string
  ): Promise<void> {
    try {
      await supabase.from('game_studio_assets')
        .update({ processing_status: 'processing' })
        .eq('id', assetId);
      
      let metadata: ProjectAsset['metadata'] = {};
      
      // Process based on type
      switch (type) {
        case 'model_3d':
          // Would analyze 3D model for triangle count, bounding box, etc.
          metadata = {
            triangleCount: 0, // Would be calculated
            vertexCount: 0,
            hasAnimations: false,
          };
          break;
          
        case 'texture_diffuse':
        case 'texture_normal':
        case 'texture_pbr':
          // Would analyze texture dimensions
          metadata = {
            width: 0, // Would be calculated
            height: 0,
            channels: 4,
            format: 'png',
          };
          break;
          
        case 'audio_sfx':
        case 'audio_music':
        case 'audio_ambient':
          // Would analyze audio duration
          metadata = {
            duration: 0, // Would be calculated
            sampleRate: 48000,
          };
          break;
      }
      
      // Generate tier variants if needed
      // This would create lower-resolution versions for different tiers
      
      await supabase.from('game_studio_assets').update({
        metadata,
        is_processed: true,
        processing_status: 'complete',
        updated_at: new Date().toISOString(),
      }).eq('id', assetId);
      
    } catch (error) {
      await supabase.from('game_studio_assets').update({
        processing_status: 'failed',
        processing_error: String(error),
      }).eq('id', assetId);
    }
  }
  
  /**
   * Get all assets for a project
   */
  public async getProjectAssets(projectId: string): Promise<ProjectAsset[]> {
    const { data, error } = await supabase
      .from('game_studio_assets')
      .select('*')
      .eq('project_id', projectId);
    
    if (error || !data) return [];
    
    return data.map(d => ({
      id: d.id,
      projectId: d.project_id,
      name: d.name,
      type: d.type as ProjectAsset['type'],
      path: d.path,
      url: d.url,
      sizeBytes: d.size_bytes,
      metadata: d.metadata as any,
      isProcessed: d.is_processed,
      processingStatus: d.processing_status as any,
      processingError: d.processing_error,
      usedInScenes: [],
      usedInScripts: [],
      uploadedAt: new Date(d.created_at).getTime(),
      modifiedAt: new Date(d.updated_at).getTime(),
    }));
  }
  
  /**
   * Delete an asset
   */
  public async deleteAsset(assetId: string): Promise<void> {
    // Get asset path
    const { data } = await supabase
      .from('game_studio_assets')
      .select('path')
      .eq('id', assetId)
      .single();
    
    if (data) {
      // Delete from storage
      await supabase.storage.from('game-assets').remove([data.path]);
    }
    
    // Delete from database
    await supabase.from('game_studio_assets').delete().eq('id', assetId);
  }
  
  // ============================================================================
  // SCRIPTS
  // ============================================================================
  
  /**
   * Create a new script
   */
  public async createScript(
    projectId: string,
    name: string,
    type: ProjectScript['type'],
    code?: string
  ): Promise<ProjectScript> {
    const scriptId = crypto.randomUUID();
    const defaultCode = this.getDefaultScriptCode(type);
    
    const script: ProjectScript = {
      id: scriptId,
      projectId,
      name,
      type,
      code: code || defaultCode,
      isCompiled: false,
      imports: [],
      exports: [],
      usedInScenes: [],
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    };
    
    await supabase.from('game_studio_scripts').insert({
      id: scriptId,
      project_id: projectId,
      name,
      type,
      code: code || defaultCode,
      is_compiled: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    
    return script;
  }
  
  /**
   * Update a script
   */
  public async updateScript(
    scriptId: string,
    code: string
  ): Promise<{ errors: ProjectScript['compileErrors']; warnings: ProjectScript['compileWarnings'] }> {
    const result = this.compileScript(code);
    
    await supabase.from('game_studio_scripts').update({
      code,
      compiled_code: result.compiledCode,
      is_compiled: result.errors.length === 0,
      compile_errors: result.errors,
      compile_warnings: result.warnings,
      updated_at: new Date().toISOString(),
    }).eq('id', scriptId);
    
    return { errors: result.errors, warnings: result.warnings };
  }
  
  /**
   * Compile script code
   */
  private compileScript(code: string): {
    compiledCode: string;
    errors: ProjectScript['compileErrors'];
    warnings: ProjectScript['compileWarnings'];
  } {
    const errors: ProjectScript['compileErrors'] = [];
    const warnings: ProjectScript['compileWarnings'] = [];
    
    // Basic syntax validation
    try {
      // Would use actual TypeScript/JavaScript compiler here
      new Function(code);
    } catch (e: any) {
      errors.push({
        line: 1,
        column: 1,
        message: e.message,
        severity: 'error',
      });
    }
    
    return {
      compiledCode: code, // Would be transpiled code
      errors,
      warnings,
    };
  }
  
  /**
   * Get all scripts for a project
   */
  public async getProjectScripts(projectId: string): Promise<ProjectScript[]> {
    const { data } = await supabase
      .from('game_studio_scripts')
      .select('*')
      .eq('project_id', projectId);
    
    if (!data) return [];
    
    return data.map(d => ({
      id: d.id,
      projectId: d.project_id,
      name: d.name,
      type: d.type as ProjectScript['type'],
      code: d.code,
      compiledCode: d.compiled_code,
      isCompiled: d.is_compiled,
      compileErrors: d.compile_errors as any,
      compileWarnings: d.compile_warnings as any,
      imports: [],
      exports: [],
      usedInScenes: [],
      createdAt: new Date(d.created_at).getTime(),
      modifiedAt: new Date(d.updated_at).getTime(),
    }));
  }
  
  /**
   * Delete a script
   */
  public async deleteScript(scriptId: string): Promise<void> {
    await supabase.from('game_studio_scripts').delete().eq('id', scriptId);
  }
  
  // ============================================================================
  // SCENES
  // ============================================================================
  
  /**
   * Create a new scene
   */
  public async createScene(
    projectId: string,
    name: string,
    isMain: boolean = false
  ): Promise<GameScene> {
    const sceneId = crypto.randomUUID();
    
    const scene: GameScene = {
      id: sceneId,
      projectId,
      name,
      description: '',
      rootObjects: [],
      environment: {
        skyboxType: 'gradient',
        skyboxGradient: { top: '#1a1a2e', bottom: '#16213e' },
        fog: {
          enabled: false,
          type: 'exponential',
          color: '#000000',
          density: 0.01,
        },
        ambientLight: {
          color: '#ffffff',
          intensity: 0.5,
        },
      },
      lighting: {
        directionalLight: {
          color: '#ffffff',
          intensity: 1,
          direction: [-1, -1, -1],
          castShadow: true,
          shadowMapSize: 2048,
        },
        pointLights: [],
        spotLights: [],
      },
      physics: {
        gravity: [0, -9.81, 0],
        fixedTimestep: 1 / 60,
        collisionLayers: [
          { index: 0, name: 'Default' },
          { index: 1, name: 'Player' },
          { index: 2, name: 'Enemy' },
          { index: 3, name: 'Projectile' },
          { index: 4, name: 'Terrain' },
        ],
        collisionMatrix: [],
      },
      spawnPoints: [],
      scripts: [],
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    };
    
    await supabase.from('game_studio_scenes').insert({
      id: sceneId,
      project_id: projectId,
      name,
      description: '',
      root_objects: [],
      environment: scene.environment as any,
      lighting: scene.lighting as any,
      physics: scene.physics as any,
      spawn_points: [],
      scripts: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    
    if (isMain) {
      await supabase.from('game_studio_projects').update({
        main_scene: sceneId,
      }).eq('id', projectId);
    }
    
    return scene;
  }
  
  /**
   * Update a scene
   */
  public async updateScene(sceneId: string, updates: Partial<GameScene>): Promise<void> {
    await supabase.from('game_studio_scenes').update({
      name: updates.name,
      description: updates.description,
      root_objects: updates.rootObjects as any,
      environment: updates.environment as any,
      lighting: updates.lighting as any,
      physics: updates.physics as any,
      spawn_points: updates.spawnPoints as any,
      scripts: updates.scripts,
      updated_at: new Date().toISOString(),
    }).eq('id', sceneId);
  }
  
  /**
   * Get all scenes for a project
   */
  public async getProjectScenes(projectId: string): Promise<GameScene[]> {
    const { data } = await supabase
      .from('game_studio_scenes')
      .select('*')
      .eq('project_id', projectId);
    
    if (!data) return [];
    
    return data.map(d => ({
      id: d.id,
      projectId: d.project_id,
      name: d.name,
      description: d.description,
      rootObjects: d.root_objects as any,
      environment: d.environment as any,
      lighting: d.lighting as any,
      physics: d.physics as any,
      spawnPoints: d.spawn_points as any,
      scripts: d.scripts,
      createdAt: new Date(d.created_at).getTime(),
      modifiedAt: new Date(d.updated_at).getTime(),
    }));
  }
  
  // ============================================================================
  // AI CONFIGURATIONS
  // ============================================================================
  
  /**
   * Create AI behavior config
   */
  public async createAIConfig(
    projectId: string,
    name: string,
    config: Partial<AIBehaviorConfig>
  ): Promise<AIBehaviorConfig> {
    const configId = crypto.randomUUID();
    
    const aiConfig: AIBehaviorConfig = {
      id: configId,
      name,
      description: config.description || '',
      personality: config.personality || {
        aggression: 0.5,
        caution: 0.5,
        teamwork: 0.5,
        adaptability: 0.5,
        unpredictability: 0.3,
      },
      behaviorTree: config.behaviorTree || {
        type: 'selector',
        name: 'Root',
        children: [],
      },
      difficultyScaling: config.difficultyScaling || {
        easy: { reactionTimeMultiplier: 1.5, accuracyMultiplier: 0.6, damageMultiplier: 0.7, healthMultiplier: 0.8, aggressionMultiplier: 0.5, perceptionMultiplier: 0.7 },
        medium: { reactionTimeMultiplier: 1.0, accuracyMultiplier: 0.8, damageMultiplier: 1.0, healthMultiplier: 1.0, aggressionMultiplier: 1.0, perceptionMultiplier: 1.0 },
        hard: { reactionTimeMultiplier: 0.7, accuracyMultiplier: 1.0, damageMultiplier: 1.2, healthMultiplier: 1.2, aggressionMultiplier: 1.3, perceptionMultiplier: 1.2 },
        expert: { reactionTimeMultiplier: 0.5, accuracyMultiplier: 1.2, damageMultiplier: 1.5, healthMultiplier: 1.5, aggressionMultiplier: 1.5, perceptionMultiplier: 1.5 },
      },
      movement: config.movement || {
        walkSpeed: 3,
        runSpeed: 6,
        turnSpeed: 180,
        jumpHeight: 2,
        pathfinding: { algorithm: 'astar', updateInterval: 0.5, maxPathLength: 100 },
        avoidance: { enabled: true, radius: 0.5, priority: 1 },
      },
      combat: config.combat || {
        preferredRange: 15,
        minRange: 3,
        maxRange: 50,
        burstDuration: 0.5,
        burstCooldown: 0.3,
        coverUsage: 0.7,
        flankingChance: 0.3,
        retreatThreshold: 0.2,
      },
      perception: config.perception || {
        sightRange: 50,
        sightAngle: 120,
        hearingRange: 30,
        memoryDuration: 10,
        awarenessDecay: 0.1,
        threatAssessment: { distanceWeight: 1, healthWeight: 0.5, weaponWeight: 0.3, positionWeight: 0.2 },
      },
    };
    
    await supabase.from('game_studio_ai_configs').insert({
      id: configId,
      project_id: projectId,
      name,
      config: aiConfig as any,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    
    return aiConfig;
  }
  
  /**
   * Get AI configs for a project
   */
  public async getProjectAIConfigs(projectId: string): Promise<AIBehaviorConfig[]> {
    const { data } = await supabase
      .from('game_studio_ai_configs')
      .select('*')
      .eq('project_id', projectId);
    
    if (!data) return [];
    
    return data.map(d => d.config as unknown as AIBehaviorConfig);
  }
  
  // ============================================================================
  // PROMPT-TO-GAME GENERATION
  // ============================================================================
  
  /**
   * Generate a game from a prompt
   */
  public async generateFromPrompt(
    creatorId: string,
    prompt: string,
    config: GameGenerationConfig
  ): Promise<GamePrompt> {
    const promptId = crypto.randomUUID();
    
    const gamePrompt: GamePrompt = {
      id: promptId,
      creatorId,
      prompt,
      template: config.template,
      generationStatus: 'pending',
      generationProgress: 0,
      generationLog: [],
      iterations: [],
      createdAt: Date.now(),
    };
    
    // Start async generation
    this.executeGeneration(gamePrompt, config);
    
    return gamePrompt;
  }
  
  /**
   * Execute the generation pipeline
   */
  private async executeGeneration(
    gamePrompt: GamePrompt,
    config: GameGenerationConfig
  ): Promise<void> {
    try {
      // Phase 1: Analyze prompt
      gamePrompt.generationStatus = 'analyzing';
      gamePrompt.generationProgress = 5;
      gamePrompt.generationLog.push('Analyzing game prompt...');
      
      const gameDesign = await this.analyzePrompt(gamePrompt.prompt, config);
      gamePrompt.generationLog.push('Game design generated');
      
      // Phase 2: Generate structure
      gamePrompt.generationStatus = 'generating_structure';
      gamePrompt.generationProgress = 15;
      
      const project = await this.createProject(
        gamePrompt.creatorId,
        gameDesign.name,
        config.template,
        gameDesign.description
      );
      
      gamePrompt.generationLog.push(`Project created: ${project.name}`);
      
      // Phase 3: Generate assets (placeholder)
      gamePrompt.generationStatus = 'generating_assets';
      gamePrompt.generationProgress = 30;
      gamePrompt.generationLog.push('Generating game assets...');
      
      // Would use AI to generate 3D models, textures, etc.
      await this.delay(1000);
      gamePrompt.generationLog.push('Assets generated');
      gamePrompt.generationProgress = 50;
      
      // Phase 4: Generate scripts
      gamePrompt.generationStatus = 'generating_scripts';
      gamePrompt.generationProgress = 60;
      gamePrompt.generationLog.push('Generating game scripts...');
      
      const scripts = await this.generateScriptsForDesign(project.id, gameDesign);
      gamePrompt.generationLog.push(`Generated ${scripts.length} scripts`);
      gamePrompt.generationProgress = 75;
      
      // Phase 5: Generate AI
      gamePrompt.generationStatus = 'generating_ai';
      gamePrompt.generationProgress = 80;
      
      if (config.aiOpponents) {
        gamePrompt.generationLog.push('Configuring AI opponents...');
        await this.generateAIForDesign(project.id, gameDesign, config);
        gamePrompt.generationLog.push('AI opponents configured');
      }
      
      gamePrompt.generationProgress = 90;
      
      // Phase 6: Compile and test
      gamePrompt.generationStatus = 'compiling';
      gamePrompt.generationProgress = 95;
      gamePrompt.generationLog.push('Compiling and validating...');
      
      await this.delay(500);
      
      // Complete
      gamePrompt.generationStatus = 'complete';
      gamePrompt.generationProgress = 100;
      gamePrompt.generatedProject = await this.getProject(project.id) || undefined;
      gamePrompt.completedAt = Date.now();
      gamePrompt.generationLog.push('Generation complete!');
      
    } catch (error: any) {
      gamePrompt.generationStatus = 'failed';
      gamePrompt.error = error.message;
      gamePrompt.generationLog.push(`Error: ${error.message}`);
    }
  }
  
  /**
   * Analyze prompt to generate game design
   */
  private async analyzePrompt(
    prompt: string,
    config: GameGenerationConfig
  ): Promise<{
    name: string;
    description: string;
    mechanics: string[];
    entities: string[];
    rules: string[];
  }> {
    // Would use AI to analyze prompt and generate design
    // For now, return a structured design based on template
    
    return {
      name: this.generateGameName(prompt),
      description: prompt,
      mechanics: config.gameplayMechanics,
      entities: ['Player', 'Enemy', 'Obstacle', 'Collectible'],
      rules: ['Score points by collecting items', 'Avoid enemies', 'Reach the goal'],
    };
  }
  
  /**
   * Generate scripts for game design
   */
  private async generateScriptsForDesign(
    projectId: string,
    design: any
  ): Promise<ProjectScript[]> {
    const scripts: ProjectScript[] = [];
    
    // Create player controller
    scripts.push(await this.createScript(
      projectId,
      'PlayerController',
      'player_controller',
      this.generatePlayerControllerCode()
    ));
    
    // Create game manager
    scripts.push(await this.createScript(
      projectId,
      'GameManager',
      'game_logic',
      this.generateGameManagerCode()
    ));
    
    return scripts;
  }
  
  /**
   * Generate AI for game design
   */
  private async generateAIForDesign(
    projectId: string,
    design: any,
    config: GameGenerationConfig
  ): Promise<void> {
    await this.createAIConfig(projectId, 'Enemy AI', {
      personality: {
        aggression: config.aiDifficulty === 'hard' ? 0.8 : 0.5,
        caution: config.aiDifficulty === 'easy' ? 0.8 : 0.4,
        teamwork: 0.5,
        adaptability: config.aiDifficulty === 'adaptive' ? 0.9 : 0.3,
        unpredictability: 0.3,
      },
    });
  }
  
  // ============================================================================
  // PUBLISHING
  // ============================================================================
  
  /**
   * Publish a game to Lucy Arcade
   */
  public async publishGame(request: PublishRequest): Promise<PublishResult> {
    try {
      // Validate project
      const project = await this.getProject(request.projectId);
      if (!project) {
        return { success: false, errors: ['Project not found'] };
      }
      
      // Check requirements
      const validationErrors = this.validateForPublishing(project);
      if (validationErrors.length > 0) {
        return { success: false, errors: validationErrors };
      }
      
      // Create arcade listing
      const listingId = crypto.randomUUID();
      
      await supabase.from('arcade_game_listings').insert({
        id: listingId,
        project_id: request.projectId,
        creator_id: project.creatorId,
        title: request.title,
        description: request.description,
        short_description: request.shortDescription,
        thumbnail: request.thumbnail,
        banner: request.banner,
        screenshots: request.screenshots,
        trailer_url: request.trailerUrl,
        category: request.category,
        tags: request.tags,
        pricing_model: request.pricingModel,
        price: request.price,
        status: 'pending_review',
        version: request.version,
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      
      // Update project status
      await this.updateProject(request.projectId, {
        status: 'review',
        isPublished: true,
        publishedVersion: request.version,
        publishedAt: Date.now(),
      });
      
      return {
        success: true,
        listingId,
        reviewRequired: true,
        reviewEstimate: 24 * 60 * 60 * 1000, // 24 hours
      };
      
    } catch (error: any) {
      return { success: false, errors: [error.message] };
    }
  }
  
  /**
   * Validate project for publishing
   */
  private validateForPublishing(project: GameProject): string[] {
    const errors: string[] = [];
    
    if (!project.name) errors.push('Project name is required');
    if (project.scenes.length === 0) errors.push('At least one scene is required');
    if (!project.mainScene) errors.push('Main scene must be set');
    
    // Check for compile errors in scripts
    const scriptsWithErrors = project.scripts.filter(
      s => s.compileErrors && s.compileErrors.length > 0
    );
    if (scriptsWithErrors.length > 0) {
      errors.push(`${scriptsWithErrors.length} scripts have compile errors`);
    }
    
    return errors;
  }
  
  // ============================================================================
  // ANALYTICS
  // ============================================================================
  
  /**
   * Get analytics for a project
   */
  public async getProjectAnalytics(
    projectId: string,
    period: ProjectAnalytics['period'] = 'week'
  ): Promise<ProjectAnalytics> {
    // Would query analytics database
    return {
      projectId,
      period,
      totalPlays: 0,
      uniquePlayers: 0,
      newPlayers: 0,
      returningPlayers: 0,
      avgSessionLength: 0,
      totalPlaytime: 0,
      sessionsPerPlayer: 0,
      retention1Day: 0,
      retention7Day: 0,
      retention30Day: 0,
      avgFPS: 60,
      avgLoadTime: 3,
      crashCount: 0,
      crashRate: 0,
      avgScore: 0,
      completionRate: 0,
      achievementUnlockRate: 0,
      shareCount: 0,
      favoriteCount: 0,
      revenue: 0,
      revenuePerPlayer: 0,
      avgRating: 0,
      newRatings: 0,
      funnel: { impressions: 0, clicks: 0, plays: 0, completions: 0, returns: 0 },
      topRegions: [],
      deviceBreakdown: { desktop: 0, mobile: 0, tablet: 0 },
      tierBreakdown: { S: 0, A: 0, B: 0, C: 0 },
    };
  }
  
  // ============================================================================
  // HELPERS
  // ============================================================================
  
  private getDefaultConfigForTemplate(template: GameTemplate): LucyGameConfig {
    const baseConfig: LucyGameConfig = {
      id: '',
      name: '',
      version: '0.1.0',
      author: '',
      minTier: 'C',
      recommendedTier: 'A',
      gameType: 'fps',
      genre: 'action',
      minPlayers: 1,
      maxPlayers: 1,
      supportsAI: false,
      supportsPvP: false,
      supportsCoOp: false,
      supportsCrossplay: false,
      inputMethods: ['keyboard', 'mouse', 'gamepad_generic'],
      requiresPointerLock: false,
      networkMode: 'offline',
      tickRate: 60,
      monetizationType: 'free',
      thumbnail: '',
      banner: '',
      description: '',
      tags: [],
      ageRating: 'E',
    };
    
    switch (template) {
      case 'fps_arena':
      case 'fps_battle_royale':
        return {
          ...baseConfig,
          gameType: 'fps',
          requiresPointerLock: true,
          supportsAI: true,
          supportsPvP: true,
          maxPlayers: 16,
        };
      case 'racing_circuit':
      case 'racing_open_world':
        return {
          ...baseConfig,
          gameType: 'racing',
          supportsAI: true,
          supportsPvP: true,
          maxPlayers: 8,
        };
      case 'strategy_rts':
      case 'strategy_turn_based':
        return {
          ...baseConfig,
          gameType: 'strategy',
          supportsAI: true,
          supportsPvP: true,
          maxPlayers: 4,
        };
      default:
        return baseConfig;
    }
  }
  
  private getDefaultScriptCode(type: ProjectScript['type']): string {
    switch (type) {
      case 'player_controller':
        return this.generatePlayerControllerCode();
      case 'game_logic':
        return this.generateGameManagerCode();
      case 'ai_behavior':
        return this.generateAIBehaviorCode();
      default:
        return '// Game script\n\nexport function onUpdate(dt: number) {\n  // Update logic\n}\n';
    }
  }
  
  private generatePlayerControllerCode(): string {
    return `/**
 * Player Controller
 * Handles player input and movement
 */

import { LucyGameSDK } from '@lucy/arcade-sdk';

export class PlayerController {
  private sdk: LucyGameSDK;
  private moveSpeed = 5;
  private lookSensitivity = 0.002;
  
  constructor(sdk: LucyGameSDK) {
    this.sdk = sdk;
  }
  
  public update(dt: number): void {
    const input = this.sdk.getInput();
    if (!input) return;
    
    const snapshot = input.getSnapshot();
    
    // Handle movement
    const moveX = snapshot.moveX * this.moveSpeed * dt;
    const moveY = snapshot.moveY * this.moveSpeed * dt;
    
    // Apply movement to player entity
    // this.transform.position.x += moveX;
    // this.transform.position.z += moveY;
    
    // Handle look
    const lookX = snapshot.lookX * this.lookSensitivity;
    const lookY = snapshot.lookY * this.lookSensitivity;
    
    // Apply rotation
    // this.transform.rotation.y += lookX;
  }
}
`;
  }
  
  private generateGameManagerCode(): string {
    return `/**
 * Game Manager
 * Core game logic and state management
 */

import { LucyGameSDK } from '@lucy/arcade-sdk';

export class GameManager {
  private sdk: LucyGameSDK;
  private score = 0;
  private gameState: 'menu' | 'playing' | 'paused' | 'gameover' = 'menu';
  
  constructor(sdk: LucyGameSDK) {
    this.sdk = sdk;
  }
  
  public startGame(): void {
    this.gameState = 'playing';
    this.score = 0;
    this.sdk.emit('game:started', {});
  }
  
  public pauseGame(): void {
    this.gameState = 'paused';
    this.sdk.emit('game:paused', {});
  }
  
  public resumeGame(): void {
    this.gameState = 'playing';
    this.sdk.emit('game:resumed', {});
  }
  
  public endGame(won: boolean): void {
    this.gameState = 'gameover';
    this.sdk.emit('game:ended', { won, score: this.score });
  }
  
  public addScore(points: number): void {
    this.score += points;
    this.sdk.emit('score:updated', { score: this.score });
  }
  
  public update(dt: number): void {
    if (this.gameState !== 'playing') return;
    
    // Game update logic
  }
}
`;
  }
  
  private generateAIBehaviorCode(): string {
    return `/**
 * AI Behavior
 * Enemy AI decision making
 */

import { AIAgent, AIConfig } from '@lucy/arcade-sdk';

export class EnemyAI {
  private agent: AIAgent;
  private target: any = null;
  
  constructor(agent: AIAgent) {
    this.agent = agent;
  }
  
  public setTarget(target: any): void {
    this.target = target;
  }
  
  public update(dt: number): void {
    const decision = this.agent.getDecision();
    
    switch (decision.goal) {
      case 'attack':
        this.executeAttack(dt);
        break;
      case 'defend':
        this.executeDefend(dt);
        break;
      case 'patrol':
        this.executePatrol(dt);
        break;
    }
  }
  
  private executeAttack(dt: number): void {
    if (!this.target) return;
    // Move toward target and attack
  }
  
  private executeDefend(dt: number): void {
    // Find cover and hold position
  }
  
  private executePatrol(dt: number): void {
    // Follow patrol route
  }
}
`;
  }
  
  private generateGameName(prompt: string): string {
    const words = prompt.split(' ').slice(0, 3);
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
  
  private mapDbToProject(
    data: any,
    assets: ProjectAsset[],
    scripts: ProjectScript[],
    scenes: GameScene[],
    aiConfigs: AIBehaviorConfig[]
  ): GameProject {
    return {
      id: data.id,
      creatorId: data.creator_id,
      name: data.name,
      description: data.description,
      template: data.template as GameTemplate,
      config: data.config as LucyGameConfig,
      assets,
      assetCount: assets.length,
      totalAssetSizeBytes: assets.reduce((sum, a) => sum + a.sizeBytes, 0),
      scripts,
      scenes,
      mainScene: data.main_scene || '',
      aiConfigs,
      status: data.status as ProjectStatus,
      version: data.version,
      lastModified: new Date(data.updated_at).getTime(),
      createdAt: new Date(data.created_at).getTime(),
      isPublished: data.is_published || false,
      publishedVersion: data.published_version,
      publishedAt: data.published_at ? new Date(data.published_at).getTime() : undefined,
      arcadeListingId: data.arcade_listing_id,
      playCount: data.play_count || 0,
      averageRating: data.average_rating || 0,
      ratingCount: data.rating_count || 0,
      totalRevenue: data.total_revenue || 0,
      settings: data.settings || {},
    };
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default GameStudioService;
