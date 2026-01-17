// Hook for managing workflow registry with Supabase

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RegisteredWorkflow, WorkflowBlueprint, TriggerType } from '../types/automation.types';
import { useAutomationStore } from '../stores/automationStore';
import { useToast } from '@/hooks/use-toast';
import { importedWorkflows } from '../data/importedWorkflows';

export function useWorkflowRegistry() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { workflows, setWorkflows, addWorkflow, removeWorkflow, updateWorkflow } = useAutomationStore();

  // Fetch user's registered workflows
  const fetchWorkflows = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('lucy_workflow_registry')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const registeredWorkflows = (data || []).map(w => ({
        ...w,
        workflow_json: w.workflow_json as unknown as WorkflowBlueprint,
        trigger_type: w.trigger_type as TriggerType,
      })) as RegisteredWorkflow[];

      setWorkflows(registeredWorkflows);
    } catch (error) {
      console.error('Error fetching workflows:', error);
    } finally {
      setLoading(false);
    }
  }, [setWorkflows]);

  // Register a new workflow
  const registerWorkflow = useCallback(async (params: {
    name: string;
    description?: string;
    triggerType: TriggerType;
    requiredSecrets: string[];
    nodeCount: number;
    workflowJson: WorkflowBlueprint;
    tags?: string[];
    externalId?: string;
  }): Promise<RegisteredWorkflow | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to register workflows',
          variant: 'destructive',
        });
        return null;
      }

      const { data, error } = await supabase
        .from('lucy_workflow_registry')
        .insert([{
          user_id: user.id,
          external_id: params.externalId,
          name: params.name,
          description: params.description,
          trigger_type: params.triggerType,
          required_secrets: params.requiredSecrets,
          node_count: params.nodeCount,
          workflow_json: JSON.parse(JSON.stringify(params.workflowJson)),
          tags: params.tags || [],
          is_active: true,
        } as any])
        .select()
        .single();

      if (error) throw error;

      const workflow = {
        ...data,
        workflow_json: data.workflow_json as unknown as WorkflowBlueprint,
        trigger_type: data.trigger_type as TriggerType,
      } as RegisteredWorkflow;

      addWorkflow(workflow);
      
      toast({
        title: 'Workflow registered',
        description: `"${params.name}" has been added to your automation library`,
      });

      return workflow;
    } catch (error) {
      console.error('Error registering workflow:', error);
      toast({
        title: 'Error',
        description: 'Failed to register workflow',
        variant: 'destructive',
      });
      return null;
    }
  }, [addWorkflow, toast]);

  // Import pre-defined workflow
  const importPredefinedWorkflow = useCallback(async (externalId: string) => {
    const preset = importedWorkflows.find(w => w.externalId === externalId);
    if (!preset) {
      toast({
        title: 'Error',
        description: 'Workflow template not found',
        variant: 'destructive',
      });
      return null;
    }

    return registerWorkflow({
      name: preset.name,
      description: preset.description,
      triggerType: preset.triggerType,
      requiredSecrets: preset.requiredSecrets,
      nodeCount: preset.nodeCount,
      workflowJson: preset.blueprint,
      tags: preset.tags,
      externalId: preset.externalId,
    });
  }, [registerWorkflow, toast]);

  // Delete workflow
  const deleteWorkflow = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('lucy_workflow_registry')
        .delete()
        .eq('id', id);

      if (error) throw error;

      removeWorkflow(id);
      toast({
        title: 'Workflow removed',
        description: 'The workflow has been deleted',
      });
    } catch (error) {
      console.error('Error deleting workflow:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete workflow',
        variant: 'destructive',
      });
    }
  }, [removeWorkflow, toast]);

  // Toggle workflow active state
  const toggleWorkflowActive = useCallback(async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('lucy_workflow_registry')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;

      updateWorkflow(id, { is_active: isActive });
    } catch (error) {
      console.error('Error updating workflow:', error);
    }
  }, [updateWorkflow]);

  // Get available templates (not yet registered by user)
  const getAvailableTemplates = useCallback(() => {
    const registeredExternalIds = workflows.map(w => w.external_id);
    return importedWorkflows.filter(w => !registeredExternalIds.includes(w.externalId));
  }, [workflows]);

  // Initialize
  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  return {
    loading,
    workflows,
    fetchWorkflows,
    registerWorkflow,
    importPredefinedWorkflow,
    deleteWorkflow,
    toggleWorkflowActive,
    getAvailableTemplates,
    availableTemplates: importedWorkflows,
  };
}
