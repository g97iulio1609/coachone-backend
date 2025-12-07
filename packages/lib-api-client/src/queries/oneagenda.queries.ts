/**
 * OneAgenda Query Keys and Functions
 *
 * Standardized query keys and query functions for tasks and goals queries
 */

import type { Task, TaskStatus, TaskPriority, Goal, GoalStatus } from '../types/oneagenda.types';

/**
 * Base query key for oneagenda
 */
const oneagendaBaseKey = ['oneagenda'] as const;

/**
 * Query keys for oneagenda queries
 */
export const oneagendaKeys = {
  all: oneagendaBaseKey,
  tasks: {
    all: [...oneagendaBaseKey, 'tasks'] as const,
    lists: () => [...oneagendaBaseKey, 'tasks', 'list'] as const,
    list: (filters?: TasksFilters) => [...oneagendaBaseKey, 'tasks', 'list', filters] as const,
    details: () => [...oneagendaBaseKey, 'tasks', 'detail'] as const,
    detail: (id: string) => [...oneagendaBaseKey, 'tasks', 'detail', id] as const,
  },
  goals: {
    all: [...oneagendaBaseKey, 'goals'] as const,
    lists: () => [...oneagendaBaseKey, 'goals', 'list'] as const,
    list: (filters?: GoalsFilters) => [...oneagendaBaseKey, 'goals', 'list', filters] as const,
    details: () => [...oneagendaBaseKey, 'goals', 'detail'] as const,
    detail: (id: string) => [...oneagendaBaseKey, 'goals', 'detail', id] as const,
  },
  habits: {
    all: [...oneagendaBaseKey, 'habits'] as const,
    lists: () => [...oneagendaBaseKey, 'habits', 'list'] as const,
    list: () => [...oneagendaBaseKey, 'habits', 'list'] as const,
    details: () => [...oneagendaBaseKey, 'habits', 'detail'] as const,
    detail: (id: string) => [...oneagendaBaseKey, 'habits', 'detail', id] as const,
  },
} as const;

/**
 * Filters for tasks list
 */
export interface TasksFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  tags?: string[];
  goalId?: string;
}

/**
 * Filters for goals list
 */
export interface GoalsFilters {
  status?: GoalStatus;
}

/**
 * Query functions for tasks
 */
export const tasksQueries = {
  /**
   * Get tasks list
   */
  list: async (filters?: TasksFilters): Promise<Task[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.tags && filters.tags.length > 0) {
      params.append('tags', filters.tags.join(','));
    }
    if (filters?.goalId) params.append('goalId', filters.goalId);

    const url = `/api/oneagenda/tasks${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      credentials: 'include',
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error('UNAUTHENTICATED');
    }

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      const message =
        (payload && typeof payload === 'object' && 'error' in payload
          ? (payload as { error?: string }).error
          : null) || 'Failed to fetch tasks';
      throw new Error(message);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },

  /**
   * Create task
   */
  create: async (input: Partial<Task>): Promise<Task> => {
    const response = await fetch('/api/oneagenda/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
      credentials: 'include',
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      const message =
        (payload && typeof payload === 'object' && 'error' in payload
          ? (payload as { error?: string }).error
          : null) || 'Failed to create task';
      throw new Error(message);
    }

    return await response.json();
  },

  /**
   * Update task status
   */
  updateStatus: async (id: string, status: TaskStatus): Promise<Task> => {
    const response = await fetch(`/api/oneagenda/tasks/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
      credentials: 'include',
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      const message =
        (payload && typeof payload === 'object' && 'error' in payload
          ? (payload as { error?: string }).error
          : null) || 'Failed to update task';
      throw new Error(message);
    }

    return await response.json();
  },

  /**
   * Delete task
   */
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`/api/oneagenda/tasks/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      const message =
        (payload && typeof payload === 'object' && 'error' in payload
          ? (payload as { error?: string }).error
          : null) || 'Failed to delete task';
      throw new Error(message);
    }
  },
};

/**
 * Query functions for goals
 */
export const goalsQueries = {
  /**
   * Get goals list
   */
  list: async (filters?: GoalsFilters): Promise<Goal[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);

    const url = `/api/oneagenda/goals${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      credentials: 'include',
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error('UNAUTHENTICATED');
    }

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      const message =
        (payload && typeof payload === 'object' && 'error' in payload
          ? (payload as { error?: string }).error
          : null) || 'Failed to fetch goals';
      throw new Error(message);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },

  /**
   * Create goal
   */
  create: async (input: Partial<Goal>): Promise<Goal> => {
    const response = await fetch('/api/oneagenda/goals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
      credentials: 'include',
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      const message =
        (payload && typeof payload === 'object' && 'error' in payload
          ? (payload as { error?: string }).error
          : null) || 'Failed to create goal';
      throw new Error(message);
    }

    return await response.json();
  },

  /**
   * Delete goal
   */
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`/api/oneagenda/goals/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      const message =
        (payload && typeof payload === 'object' && 'error' in payload
          ? (payload as { error?: string }).error
          : null) || 'Failed to delete goal';
      throw new Error(message);
    }
  },
};

/**
 * Query functions for habits
 */
export const habitsQueries = {
  /**
   * Get habits list
   */
  list: async (): Promise<unknown[]> => {
    const response = await fetch('/api/habits', {
      credentials: 'include',
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error('UNAUTHENTICATED');
    }

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      const message =
        (payload && typeof payload === 'object' && 'error' in payload
          ? (payload as { error?: string }).error
          : null) || 'Failed to fetch habits';
      throw new Error(message);
    }

    const data = await response.json();
    return data.habits || [];
  },

  /**
   * Toggle habit completion
   */
  toggle: async (id: string): Promise<unknown> => {
    const response = await fetch(`/api/habits/${id}/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
      credentials: 'include',
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      const message =
        (payload && typeof payload === 'object' && 'error' in payload
          ? (payload as { error?: string }).error
          : null) || 'Failed to toggle habit';
      throw new Error(message);
    }

    return await response.json();
  },
};
