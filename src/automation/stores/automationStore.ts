// Automation Studio State Management
// Isolated zustand store for automation functionality

import { create } from 'zustand';
import type { RegisteredWorkflow, WorkflowRun, HealingEvent, AgentDecision } from '../types/automation.types';

interface AutomationState {
  // Workflows
  workflows: RegisteredWorkflow[];
  selectedWorkflow: RegisteredWorkflow | null;
  
  // Runs
  activeRuns: WorkflowRun[];
  runHistory: WorkflowRun[];
  
  // Healing
  healingEvents: HealingEvent[];
  
  // Agent decisions
  decisions: AgentDecision[];
  
  // UI State
  isLoading: boolean;
  error: string | null;
  showImportModal: boolean;
  
  // Actions
  setWorkflows: (workflows: RegisteredWorkflow[]) => void;
  addWorkflow: (workflow: RegisteredWorkflow) => void;
  removeWorkflow: (id: string) => void;
  setSelectedWorkflow: (workflow: RegisteredWorkflow | null) => void;
  updateWorkflow: (id: string, updates: Partial<RegisteredWorkflow>) => void;
  
  setActiveRuns: (runs: WorkflowRun[]) => void;
  addRun: (run: WorkflowRun) => void;
  updateRun: (id: string, updates: Partial<WorkflowRun>) => void;
  setRunHistory: (runs: WorkflowRun[]) => void;
  
  addHealingEvent: (event: HealingEvent) => void;
  setHealingEvents: (events: HealingEvent[]) => void;
  
  addDecision: (decision: AgentDecision) => void;
  setDecisions: (decisions: AgentDecision[]) => void;
  
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setShowImportModal: (show: boolean) => void;
  
  reset: () => void;
}

const initialState = {
  workflows: [],
  selectedWorkflow: null,
  activeRuns: [],
  runHistory: [],
  healingEvents: [],
  decisions: [],
  isLoading: false,
  error: null,
  showImportModal: false,
};

export const useAutomationStore = create<AutomationState>((set) => ({
  ...initialState,
  
  setWorkflows: (workflows) => set({ workflows }),
  
  addWorkflow: (workflow) => set((state) => ({
    workflows: [...state.workflows, workflow],
  })),
  
  removeWorkflow: (id) => set((state) => ({
    workflows: state.workflows.filter(w => w.id !== id),
    selectedWorkflow: state.selectedWorkflow?.id === id ? null : state.selectedWorkflow,
  })),
  
  setSelectedWorkflow: (workflow) => set({ selectedWorkflow: workflow }),
  
  updateWorkflow: (id, updates) => set((state) => ({
    workflows: state.workflows.map(w => 
      w.id === id ? { ...w, ...updates } : w
    ),
    selectedWorkflow: state.selectedWorkflow?.id === id 
      ? { ...state.selectedWorkflow, ...updates }
      : state.selectedWorkflow,
  })),
  
  setActiveRuns: (runs) => set({ activeRuns: runs }),
  
  addRun: (run) => set((state) => ({
    activeRuns: [...state.activeRuns, run],
  })),
  
  updateRun: (id, updates) => set((state) => ({
    activeRuns: state.activeRuns.map(r => 
      r.id === id ? { ...r, ...updates } : r
    ),
  })),
  
  setRunHistory: (runs) => set({ runHistory: runs }),
  
  addHealingEvent: (event) => set((state) => ({
    healingEvents: [event, ...state.healingEvents],
  })),
  
  setHealingEvents: (events) => set({ healingEvents: events }),
  
  addDecision: (decision) => set((state) => ({
    decisions: [decision, ...state.decisions],
  })),
  
  setDecisions: (decisions) => set({ decisions }),
  
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  setShowImportModal: (show) => set({ showImportModal: show }),
  
  reset: () => set(initialState),
}));
