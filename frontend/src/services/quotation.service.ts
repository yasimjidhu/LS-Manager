
import api from './api';

export interface QuotationItem {
    id: string;
    itemId: string;
    // description: string; // Removed as it's not on the model, but might be desired for custom descriptions later
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    item?: {
        name: string;
        description?: string;
    };
}

export interface Quotation {
    id: string;
    eventId: string;
    event?: {
        name: string;
        location: string;
        startDate?: string;
        endDate?: string;
        description?: string;
        date?: string; // Legacy support if needed
    };
    clientName: string;
    clientEmail?: string;
    clientPhone?: string;
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    discount: number;
    totalAmount: number;
    status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED';
    validUntil?: string;
    createdAt: string;
    items?: QuotationItem[];
    paymentTerms?: string; // If returned
    // Fallback fields if event object is missing or flattened
    eventName?: string;
    eventDate?: string;
    eventLocation?: string;
    eventDescription?: string;
}

export interface CreateQuotationDto {
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    eventName: string;
    eventDate: string;
    eventLocation: string;
    eventDescription?: string;
    items: {
        itemId?: string;
        description: string;
        quantity: number;
        unitPrice: number;
    }[];
    taxRate: number;
    paymentTerms: string;
    validUntil: string;
}

export const quotationApi = {
    getAll: async () => {
        const { data } = await api.get<Quotation[]>('/quotations');
        return data;
    },
    getOne: async (id: string) => {
        const { data } = await api.get<Quotation>(`/quotations/${id}`);
        return data;
    },
    create: async (payload: CreateQuotationDto) => {
        const { data } = await api.post<Quotation>('/quotations', payload);
        return data;
    },
    updateStatus: async (id: string, status: string) => {
        const { data } = await api.patch<Quotation>(`/quotations/${id}/status`, { status });
        return data;
    },
    getStats: async () => {
        const { data } = await api.get('/quotations/stats'); // Mock or implement in backend
        return data;
    }
};
