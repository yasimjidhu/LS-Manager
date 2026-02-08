import api from './api';

export type Employee = {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string;
    skills: string[];
    wageModel: 'FIXED' | 'PIECE_RATE' | 'PERCENTAGE';
    baseWage: number;
    userId?: string;
    user?: {
        id: string;
        email: string;
        role: 'ADMIN' | 'SUPERVISOR' | 'EMPLOYEE';
        isActive: boolean;
    };
    createdAt?: string;
    updatedAt?: string;
}

export const employeeApi = {
    getAll: async (params?: { page?: number; limit?: number; search?: string; role?: string; status?: string }) => {
        const { data } = await api.get<{ data: Employee[]; meta: any }>('/employees', { params });
        return data;
    },
    getOne: async (id: string) => {
        const { data } = await api.get<Employee>(`/employees/${id}`);
        return data;
    },
    create: async (data: any) => {
        const { data: response } = await api.post<Employee>('/employees', data);
        return response;
    },
    update: async (id: string, data: any) => {
        const { data: response } = await api.patch<Employee>(`/employees/${id}`, data);
        return response;
    },
    delete: async (id: string) => {
        await api.delete(`/employees/${id}`);
    },
    getStats: async () => {
        const { data } = await api.get<{ total: number; active: number; supervisors: number; blocked: number }>('/employees/stats');
        return data;
    }
};
