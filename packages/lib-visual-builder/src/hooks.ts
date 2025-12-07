/**
 * Visual Builder React Hooks
 * Custom hooks for API interactions
 */

'use client';

import { useState, useCallback } from 'react';
import type {
  Skill,
  Workflow,
  SkillFormData,
  WorkflowFormData,
  NodeFormData,
  EdgeFormData,
  CodeGenerationResult,
} from './types';

// Skills Hooks

export function useSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSkills = useCallback(async (includePublic = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/visual-builder/skills?includePublic=${includePublic}`);
      if (!res.ok) throw new Error('Failed to fetch skills');
      const data = await res.json();
      setSkills(data.skills);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const createSkill = useCallback(async (data: SkillFormData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/visual-builder/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create skill');
      const result = await res.json();
      return result.skill as Skill;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSkill = useCallback(async (skillId: string, data: Partial<SkillFormData>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/visual-builder/skills/${skillId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update skill');
      const result = await res.json();
      return result.skill as Skill;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSkill = useCallback(async (skillId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/visual-builder/skills/${skillId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete skill');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deploySkill = useCallback(async (skillId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/visual-builder/skills/${skillId}/deploy`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to deploy skill');
      const result = await res.json();
      return result.skill as Skill;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateCode = useCallback(async (skillId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/visual-builder/skills/${skillId}/generate`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to generate code');
      const result = await res.json();
      return result as CodeGenerationResult;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    skills,
    loading,
    error,
    fetchSkills,
    createSkill,
    updateSkill,
    deleteSkill,
    deploySkill,
    generateCode,
  };
}

// Workflows Hooks

export function useWorkflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkflows = useCallback(async (includePublic = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/visual-builder/workflows?includePublic=${includePublic}`);
      if (!res.ok) throw new Error('Failed to fetch workflows');
      const data = await res.json();
      setWorkflows(data.workflows);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWorkflow = useCallback(async (workflowId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/visual-builder/workflows/${workflowId}`);
      if (!res.ok) throw new Error('Failed to fetch workflow');
      const data = await res.json();
      return data.workflow as Workflow;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createWorkflow = useCallback(async (data: WorkflowFormData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/visual-builder/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create workflow');
      const result = await res.json();
      return result.workflow as Workflow;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateWorkflow = useCallback(
    async (workflowId: string, data: Partial<WorkflowFormData>) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/visual-builder/workflows/${workflowId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update workflow');
        const result = await res.json();
        return result.workflow as Workflow;
      } catch (_err: unknown) {
        setError(_err instanceof Error ? _err.message : 'Unknown error');
        throw _err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteWorkflow = useCallback(async (workflowId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/visual-builder/workflows/${workflowId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete workflow');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deployWorkflow = useCallback(async (workflowId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/visual-builder/workflows/${workflowId}/deploy`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to deploy workflow');
      const result = await res.json();
      return result.workflow as Workflow;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateCode = useCallback(async (workflowId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/visual-builder/workflows/${workflowId}/generate`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to generate code');
      const result = await res.json();
      return result as CodeGenerationResult;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addNode = useCallback(async (workflowId: string, data: NodeFormData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/visual-builder/workflows/${workflowId}/nodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to add node');
      const result = await res.json();
      return result.node;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateNode = useCallback(
    async (workflowId: string, nodeId: string, data: Partial<NodeFormData>) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/visual-builder/workflows/${workflowId}/nodes/${nodeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update node');
        const result = await res.json();
        return result.node;
      } catch (_err: unknown) {
        setError(_err instanceof Error ? _err.message : 'Unknown error');
        throw _err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteNode = useCallback(async (workflowId: string, nodeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/visual-builder/workflows/${workflowId}/nodes/${nodeId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete node');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addEdge = useCallback(async (workflowId: string, data: EdgeFormData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/visual-builder/workflows/${workflowId}/edges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to add edge');
      const result = await res.json();
      return result.edge;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteEdge = useCallback(async (workflowId: string, edgeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/visual-builder/workflows/${workflowId}/edges/${edgeId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete edge');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    workflows,
    loading,
    error,
    fetchWorkflows,
    fetchWorkflow,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    deployWorkflow,
    generateCode,
    addNode,
    updateNode,
    deleteNode,
    addEdge,
    deleteEdge,
  };
}
