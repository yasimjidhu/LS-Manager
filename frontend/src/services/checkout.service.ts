import api from './api';

export interface CheckoutPayload {
    jobId: string;
    items: { itemId: string; quantity: number }[];
    assignedToId?: string;
}

export const checkoutApi = {
    checkout: async (payload: CheckoutPayload) => {
        const { data } = await api.post('/checkout', payload);
        return data;
    },

    getHistory: async () => {
        const { data } = await api.get('/checkout/history');
        return data;
    }
};
