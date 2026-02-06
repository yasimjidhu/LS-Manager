
import api from './api';

export interface CompanyProfile {
    id: string;
    companyName: string;
    address: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    website?: string;
    phone: string;
    email: string;
    gstNumber?: string;
    logoUrl?: string;
    invoiceFooterNote?: string;
}

export interface PaymentProfile {
    id: string;
    upiId?: string;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    branch?: string;
    ifscCode?: string;
    gpayQrUrl?: string;
    phonepeQrUrl?: string;
    paymentTerms?: string;
}

export interface WagePolicy {
    id: string;
    type: 'PIECE_RATE' | 'DAILY_WAGE' | 'HOURLY_WAGE' | 'FIXED_JOB_RATE';
    isActive: boolean;
    description?: string;
}

export interface EmployeeWageRate {
    id: string;
    employeeId?: string;
    role?: string;
    wageType: 'PIECE_RATE' | 'DAILY_WAGE' | 'HOURLY_WAGE' | 'FIXED_JOB_RATE';
    itemId?: string;
    rate: number;
}
export interface SystemSettings {
    id: string;
    currency: string;
    timezone: string;
    dateFormat: string;
    workingDayStart: string;
    workingDayEnd: string;
    overtimeEnabled: boolean;
    overtimeThreshold: number;
    attendanceGracePeriod: number;
}

export const settingsApi = {
    // Company Profile
    getCompanyProfile: async () => {
        const { data } = await api.get<CompanyProfile>('/settings/company');
        return data;
    },
    updateCompanyProfile: async (data: Partial<CompanyProfile>) => {
        const { data: response } = await api.patch<CompanyProfile>('/settings/company', data);
        return response;
    },

    // Payment Profile
    getPaymentProfile: async () => {
        const { data } = await api.get<PaymentProfile>('/settings/payment');
        return data;
    },
    updatePaymentProfile: async (data: Partial<PaymentProfile>) => {
        const { data: response } = await api.patch<PaymentProfile>('/settings/payment', data);
        return response;
    },

    // System Rules
    getSystemSettings: async () => {
        const { data } = await api.get<SystemSettings>('/settings/system');
        return data;
    },
    updateSystemSettings: async (data: Partial<SystemSettings>) => {
        const { data: response } = await api.patch<SystemSettings>('/settings/system', data);
        return response;
    },

    // Wage Policy
    getWagePolicies: async () => {
        const { data } = await api.get<WagePolicy[]>('/settings/wages/policies');
        return data;
    },
    updateWagePolicy: async (id: string, data: Partial<WagePolicy>) => {
        const { data: response } = await api.patch<WagePolicy>(`/settings/wages/policies/${id}`, data);
        return response;
    },

    // Employee Wage Rates
    getWageRates: async () => {
        const { data } = await api.get<EmployeeWageRate[]>('/settings/wages/rates');
        return data;
    },
    createWageRate: async (data: Partial<EmployeeWageRate>) => {
        const { data: response } = await api.post<EmployeeWageRate>('/settings/wages/rates', data);
        return response;
    },
    deleteWageRate: async (id: string) => {
        await api.delete(`/settings/wages/rates/${id}`);
    }
};
export interface User {
    id: string;
    email: string;
    role: 'ADMIN' | 'SUPERVISOR' | 'EMPLOYEE';
    isActive: boolean;
    employee?: {
        firstName: string;
        lastName: string;
    };
    createdAt: string;
}

export const usersApi = {
    getAll: async () => {
        const { data } = await api.get<User[]>('/users');
        return data;
    },
    update: async (id: string, data: Partial<User>) => {
        const { data: response } = await api.patch<User>(`/users/${id}`, data);
        return response;
    }
};
