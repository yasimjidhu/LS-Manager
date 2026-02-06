import api from './api';

export interface JobMessage {
    id: string;
    content: string;
    imageUrl?: string;
    jobId: string;
    userId: string;
    user: {
        email: string;
        role: string;
    };
    createdAt: string;
}

export const discussionApi = {
    getJobMessages: async (jobId: string) => {
        const { data } = await api.get<JobMessage[]>(`/discussion/job/${jobId}`);
        return data;
    },

    sendMessage: async (message: { jobId: string; content: string; imageUrl?: string }) => {
        const { data } = await api.post<JobMessage>('/discussion', message);
        return data;
    },

    deleteMessage: async (id: string) => {
        await api.delete(`/discussion/${id}`);
    }
};
