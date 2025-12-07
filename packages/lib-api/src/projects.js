import { apiClient } from './client';
export const projectsApi = {
    getAll: async () => {
        const data = await apiClient.get('/api/projects');
        return data;
    },
    getById: async (id) => {
        const data = await apiClient.get(`/api/projects/${id}`);
        return data;
    },
    create: async (input) => {
        const data = await apiClient.post('/api/projects', input);
        return data;
    },
    update: async (id, input) => {
        const data = await apiClient.patch('/api/projects', { id, ...input });
        return data;
    },
    delete: async (id) => {
        await apiClient.delete(`/api/projects?id=${id}`);
    },
};
export const tasksApi = {
    create: async (input) => {
        const data = await apiClient.post('/api/tasks', input);
        return data;
    },
    update: async (id, input) => {
        const data = await apiClient.patch(`/api/tasks`, { id, ...input });
        return data;
    },
    delete: async (id) => {
        await apiClient.delete(`/api/tasks?id=${id}`);
    },
    reorder: async (updates) => {
        await apiClient.patch('/api/tasks/reorder', { updates });
    },
};
export const milestonesApi = {
    create: async (input) => {
        const data = await apiClient.post('/api/milestones', input);
        return data;
    },
    update: async (id, input) => {
        const data = await apiClient.patch(`/api/milestones`, { id, ...input });
        return data;
    },
    delete: async (id) => {
        await apiClient.delete(`/api/milestones?id=${id}`);
    },
};
