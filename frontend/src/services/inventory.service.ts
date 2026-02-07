import api from './api';

export interface InventoryItem {
    id: string;
    name: string;
    description?: string;
    qrCode: string;
    quantity: number;
    price: number;
    status: string;
    categoryId: string;
    category?: { id: string; name: string };
    checkedOutQuantity?: number;
    imageUrl?: string;
    model?: string; // Add this if you add model to backend
}

export interface InventoryCategory {
    id: string;
    name: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const inventoryApi = {
    getAll: async (params?: { search?: string; categoryId?: string; status?: string; page?: number; limit?: number }) => {
        const { data } = await api.get<PaginatedResponse<InventoryItem>>('/inventory', { params });
        return data;
    },

    getOne: async (id: string) => {
        const { data } = await api.get<InventoryItem>(`/inventory/${id}`);
        return data;
    },

    create: async (item: Partial<InventoryItem> | FormData) => {
        const headers = item instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
        const { data } = await api.post<InventoryItem>('/inventory', item, { headers });
        return data;
    },

    update: async (id: string, item: Partial<InventoryItem> | FormData) => {
        const headers = item instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
        const { data } = await api.patch<InventoryItem>(`/inventory/${id}`, item, { headers });
        return data;
    },

    delete: async (id: string) => {
        await api.delete(`/inventory/${id}`);
    },

    getCategories: async () => {
        const { data } = await api.get<InventoryCategory[]>('/inventory/categories');
        return data;
    },

    createCategory: async (category: { name: string; description?: string }) => {
        const { data } = await api.post<InventoryCategory>('/inventory/categories', category);
        return data;
    },

    getMaintenanceHistory: async (itemId: string) => {
        const { data } = await api.get<any[]>(`/maintenance/item/${itemId}`);
        return data;
    },

    getConflicts: async () => {
        const { data } = await api.get<any[]>('/inventory/conflicts');
        return data;
    },

    checkout: async (payload: { itemId: string; jobId: string; quantity: number, assignedToId?: string }) => {
        const { data } = await api.post('/inventory/checkout', payload);
        return data;
    },

    checkIn: async (payload: { itemId: string; jobId: string; quantity: number, assignedToId?: string, qrCode?: string }) => {
        const { data } = await api.post('/inventory/checkin', payload);
        return data;
    }
};
