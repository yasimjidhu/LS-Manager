import api from './api';

export const JobsService = {
    getAll: async (params?: { page?: number; limit?: number; search?: string; date?: string; viewMode?: string }) => {
        const response = await api.get('/jobs', { params });
        return response.data;
    },
    getOne: async (id: string) => {
        const response = await api.get(`/jobs/${id}`);
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/jobs', data);
        return response.data;
    },
    update: async (id: string, data: any) => {
        const response = await api.patch(`/jobs/${id}`, data);
        return response.data;
    },
    delete: async (id: string) => {
        const response = await api.delete(`/jobs/${id}`);
        return response.data;
    },
    clone: async (id: string) => {
        const response = await api.post(`/jobs/${id}/clone`);
        return response.data;
    },
    getStats: async () => {
        const response = await api.get('/jobs/stats');
        return response.data;
    }
};
