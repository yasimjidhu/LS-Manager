export const API_URL = 'http://localhost:3000';
import axios from 'axios';

const api = axios.create({
    baseURL: API_URL, // Backend URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token interceptor if implemented
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || 'Something went wrong';

        if (error.response?.status === 401) {
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('access_token');
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        } else if (error.response?.status === 403) {
            console.error('Forbidden: You do not have permission to perform this action.');
        } else if (error.response?.status >= 500) {
            console.error(`Server Error: ${message}`);
        }

        return Promise.reject(error);
    }
);

export default api;
