
import api from './api';

export interface Invoice {
    id: string;
    itemOrder?: number;
    clientName?: string;
    eventName?: string;
    issuedDate?: string;
    dueDate: string;
    totalAmount: number;
    paidAmount?: number;
    subtotal?: number;
    taxAmount?: number;
    discount?: number;
    status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'SENT' | 'PAID' | 'PARTIALLY_PAID' | 'OVERDUE' | 'CANCELLED';
    job?: any;
    items?: any[];
    createdAt?: string;
}

export const invoiceApi = {
    getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
        const { data } = await api.get<{ data: Invoice[]; meta: any }>('/invoices', { params });
        return data;
    },
    getOne: async (id: string) => {
        const { data } = await api.get<Invoice>(`/invoices/${id}`);
        return data;
    },
    create: async (data: any) => {
        const { data: response } = await api.post<Invoice>('/invoices', data);
        return response;
    },
    getStats: async () => {
        const { data } = await api.get('/invoices/stats');
        return data;
    },
    update: async (id: string, data: any) => {
        const { data: response } = await api.patch<Invoice>(`/invoices/${id}`, data);
        return response;
    }
};
