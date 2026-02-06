import api from './api';

export interface JobExpense {
    id: string;
    jobId: string;
    title: string;
    amount: number;
    category: 'TRANSPORT' | 'FOOD' | 'FUEL' | 'EQUIPMENT_RENTAL' | 'MISC';
    description?: string;
    proofUrl?: string;
    recordedById?: string;
    createdAt: string;
}

export interface CreateJobExpenseDto {
    jobId: string;
    title: string;
    amount: number;
    category: string;
    description?: string;
    proofUrl?: string;
}

export const JobExpensesService = {
    getAllByJob: async (jobId: string) => {
        const response = await api.get<JobExpense[]>(`/job-expenses?jobId=${jobId}`);
        return response.data;
    },
    create: async (data: CreateJobExpenseDto) => {
        const response = await api.post<JobExpense>('/job-expenses', data);
        return response.data;
    },
    delete: async (id: string) => {
        const response = await api.delete(`/job-expenses/${id}`);
        return response.data;
    }
};
