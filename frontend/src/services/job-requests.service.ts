import api from './api';

export const JobRequestsService = {
    getAll: async (jobId?: string, employeeId?: string) => {
        const params: any = {};
        if (jobId) params.jobId = jobId;
        if (employeeId) params.employeeId = employeeId;

        const response = await api.get('/job-requests', { params });
        return response.data;
    },

    create: async (jobId: string) => {
        const response = await api.post(`/job-requests/${jobId}`);
        return response.data;
    },

    approve: async (id: string) => {
        const response = await api.patch(`/job-requests/${id}/approve`);
        return response.data;
    },

    reject: async (id: string, reason: string) => {
        const response = await api.patch(`/job-requests/${id}/reject`, { reason });
        return response.data;
    }
};
