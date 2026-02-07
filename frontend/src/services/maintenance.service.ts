import api from './api';

export interface MaintenanceLog {
    id: string;
    itemId: string;
    item?: {
        id: string;
        name: string;
        qrCode: string;
    };
    description: string;
    cost: number;
    status: string;
    reportedBy?: {
        id: string;
        email: string;
        employee?: {
            firstName: string;
            lastName: string;
        };
    };
    reportedById: string;
    resolvedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export const maintenanceApi = {
    getAll: async () => {
        const { data } = await api.get<MaintenanceLog[]>('/maintenance');
        return data;
    },

    getByItem: async (itemId: string) => {
        const { data } = await api.get<MaintenanceLog[]>(`/maintenance/item/${itemId}`);
        return data;
    },

    create: async (payload: { itemId: string; description: string; cost?: number; status: string }) => {
        const { data } = await api.post<MaintenanceLog>('/maintenance', payload);
        return data;
    },

    update: async (id: string, payload: Partial<MaintenanceLog>) => {
        const { data } = await api.patch<MaintenanceLog>(`/maintenance/${id}`, payload);
        return data;
    },

    resolve: async (id: string) => {
        const { data } = await api.patch<MaintenanceLog>(`/maintenance/${id}/resolve`);
        return data;
    },

    delete: async (id: string) => {
        await api.delete(`/maintenance/${id}`);
    }
};
