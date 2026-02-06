import api from './api';

export const AnalyticsService = {
    getAdminAnalytics: (dateRange: string = 'this-month') =>
        api.get(`/analytics/admin?dateRange=${dateRange}`).then(res => res.data),

    getSupervisorAnalytics: (dateRange: string = 'this-month') =>
        api.get(`/analytics/supervisor?dateRange=${dateRange}`).then(res => res.data),

    getEmployeeAnalytics: (dateRange: string = 'this-month') =>
        api.get(`/analytics/employee?dateRange=${dateRange}`).then(res => res.data),

    getDashboardAnalytics: (dateRange: string = 'this-month') =>
        api.get(`/analytics/dashboard?dateRange=${dateRange}`).then(res => res.data),
};
