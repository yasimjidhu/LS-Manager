import api from './api';

export interface User {
    id: string;
    email: string;
    role: string;
    name: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface CreateUserCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
    user: User;
}

export const AuthService = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        console.log('reqeust reached in auth baekdn',credentials)
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        return response.data;
    },
    register: async (credentials: CreateUserCredentials): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/register', credentials);
        return response.data;
    },
    logout: async () => {
        // Here you might call an endpoint if you had server-side session invalidation
        // For JWT, we mostly just clear client side, but let's keep it extensible
        return Promise.resolve();
    },
};
