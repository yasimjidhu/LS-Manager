import api from './api';

export interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string;
}

export const employeesApi = {
    getAll: async () => {
        const { data } = await api.get<Employee[]>('/employees');
        return data;
    }
};
