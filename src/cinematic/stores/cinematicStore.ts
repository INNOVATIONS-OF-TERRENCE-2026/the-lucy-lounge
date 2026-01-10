// Cinematic Studio State Management
// Isolated zustand store for cinematic functionality

import { create } from 'zustand';
import type { CinematicJob, CinematicShot, CinematicPlan, UserPlan, PromptMemory } from '../types/cinematic.types';

interface CinematicState {
  // Current project
  currentJob: CinematicJob | null;
  shots: CinematicShot[];
  
  // Queue
  jobQueue: CinematicJob[];
  activeJobs: CinematicJob[];
  
  // User plan
  userPlan: UserPlan | null;
  availablePlans: CinematicPlan[];
  
  // Prompt memory
  promptHistory: PromptMemory[];
  
  // UI state
  selectedShotId: string | null;
  isGenerating: boolean;
  previewUrl: string | null;
  error: string | null;
  
  // Settings
  stylePreset: string;
  aspectRatio: string;
  duration: number;
  includeVoice: boolean;
  includeMusic: boolean;
  
  // Actions
  setCurrentJob: (job: CinematicJob | null) => void;
  setShots: (shots: CinematicShot[]) => void;
  addShot: (shot: CinematicShot) => void;
  updateShot: (id: string, updates: Partial<CinematicShot>) => void;
  removeShot: (id: string) => void;
  reorderShots: (fromIndex: number, toIndex: number) => void;
  
  setJobQueue: (jobs: CinematicJob[]) => void;
  addToQueue: (job: CinematicJob) => void;
  removeFromQueue: (jobId: string) => void;
  setActiveJobs: (jobs: CinematicJob[]) => void;
  
  setUserPlan: (plan: UserPlan | null) => void;
  setAvailablePlans: (plans: CinematicPlan[]) => void;
  
  addPromptToHistory: (memory: PromptMemory) => void;
  setPromptHistory: (history: PromptMemory[]) => void;
  
  setSelectedShotId: (id: string | null) => void;
  setIsGenerating: (generating: boolean) => void;
  setPreviewUrl: (url: string | null) => void;
  setError: (error: string | null) => void;
  
  setStylePreset: (preset: string) => void;
  setAspectRatio: (ratio: string) => void;
  setDuration: (duration: number) => void;
  setIncludeVoice: (include: boolean) => void;
  setIncludeMusic: (include: boolean) => void;
  
  reset: () => void;
}

const initialState = {
  currentJob: null,
  shots: [],
  jobQueue: [],
  activeJobs: [],
  userPlan: null,
  availablePlans: [],
  promptHistory: [],
  selectedShotId: null,
  isGenerating: false,
  previewUrl: null,
  error: null,
  stylePreset: 'cinematic',
  aspectRatio: '16:9',
  duration: 5,
  includeVoice: false,
  includeMusic: true,
};

export const useCinematicStore = create<CinematicState>((set) => ({
  ...initialState,
  
  setCurrentJob: (job) => set({ currentJob: job }),
  
  setShots: (shots) => set({ shots }),
  
  addShot: (shot) => set((state) => ({ 
    shots: [...state.shots, shot] 
  })),
  
  updateShot: (id, updates) => set((state) => ({
    shots: state.shots.map(shot => 
      shot.id === id ? { ...shot, ...updates } : shot
    ),
  })),
  
  removeShot: (id) => set((state) => ({
    shots: state.shots.filter(shot => shot.id !== id),
    selectedShotId: state.selectedShotId === id ? null : state.selectedShotId,
  })),
  
  reorderShots: (fromIndex, toIndex) => set((state) => {
    const newShots = [...state.shots];
    const [removed] = newShots.splice(fromIndex, 1);
    newShots.splice(toIndex, 0, removed);
    return { shots: newShots };
  }),
  
  setJobQueue: (jobs) => set({ jobQueue: jobs }),
  
  addToQueue: (job) => set((state) => ({
    jobQueue: [...state.jobQueue, job],
  })),
  
  removeFromQueue: (jobId) => set((state) => ({
    jobQueue: state.jobQueue.filter(j => j.id !== jobId),
  })),
  
  setActiveJobs: (jobs) => set({ activeJobs: jobs }),
  
  setUserPlan: (plan) => set({ userPlan: plan }),
  
  setAvailablePlans: (plans) => set({ availablePlans: plans }),
  
  addPromptToHistory: (memory) => set((state) => ({
    promptHistory: [memory, ...state.promptHistory].slice(0, 50), // Keep last 50
  })),
  
  setPromptHistory: (history) => set({ promptHistory: history }),
  
  setSelectedShotId: (id) => set({ selectedShotId: id }),
  
  setIsGenerating: (generating) => set({ isGenerating: generating }),
  
  setPreviewUrl: (url) => set({ previewUrl: url }),
  
  setError: (error) => set({ error }),
  
  setStylePreset: (preset) => set({ stylePreset: preset }),
  
  setAspectRatio: (ratio) => set({ aspectRatio: ratio }),
  
  setDuration: (duration) => set({ duration: Math.max(1, Math.min(120, duration)) }),
  
  setIncludeVoice: (include) => set({ includeVoice: include }),
  
  setIncludeMusic: (include) => set({ includeMusic: include }),
  
  reset: () => set(initialState),
}));
