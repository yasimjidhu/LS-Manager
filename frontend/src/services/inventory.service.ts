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

    create: async (item: Partial<InventoryItem>) => {
        const { data } = await api.post<InventoryItem>('/inventory', item);
        return data;
    },

    update: async (id: string, item: Partial<InventoryItem>) => {
        const { data } = await api.patch<InventoryItem>(`/inventory/${id}`, item);
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
    }
};
