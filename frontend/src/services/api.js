import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Resources
export const resourceAPI = {
    getAll: () => api.get('/resources'),
    getById: (id) => api.get(`/resources/${id}`),
    create: (data) => api.post('/resources', data),
    update: (id, data) => api.put(`/resources/${id}`, data),
    delete: (id) => api.delete(`/resources/${id}`),
};

export const bookingAPI = {
    getAll: () => api.get('/bookings'),
    getById: (id) => api.get(`/bookings/${id}`),
    getUserBookings: (userId) =>
        api.get(`/bookings/my/${userId}`),
    create: (data) => api.post('/bookings', data),
    approve: (id, note) =>
        api.put(`/bookings/${id}/approve`, { note }),
    reject: (id, reason) =>
        api.put(`/bookings/${id}/reject`, { reason }),
    cancel: (id) => api.put(`/bookings/${id}/cancel`),
    delete: (id) => api.delete(`/bookings/${id}`),
};

export const ticketAPI = {
    getAll: () => api.get('/tickets'),
    getById: (id) => api.get(`/tickets/${id}`),
    getUserTickets: (userId) =>
        api.get(`/tickets/my/${userId}`),
    create: (data) => api.post('/tickets', data),
    update: (id, data) => api.put(`/tickets/${id}`, data),
    updateStatus: (id, status, note) =>
        api.put(`/tickets/${id}/status`, { status, note }),
    assign: (ticketId, techId) =>
        api.put(`/tickets/${ticketId}/assign/${techId}`),
    getComments: (id) =>
        api.get(`/tickets/${id}/comments`),
    addComment: (id, data) =>
        api.post(`/tickets/${id}/comments`, data),
    deleteComment: (commentId) =>
        api.delete(`/tickets/comments/${commentId}`),
    delete: (id) => api.delete(`/tickets/${id}`),
};

// Notifications
export const notificationAPI = {
    getUserNotifications: (userId) =>
        api.get(`/notifications/user/${userId}`),
    getUnreadCount: (userId) =>
        api.get(`/notifications/user/${userId}/unread-count`),
    markAsRead: (id) =>
        api.put(`/notifications/${id}/read`),
    markAllAsRead: (userId) =>
        api.put(`/notifications/user/${userId}/read-all`),
    deleteNotification: (id) =>
        api.delete(`/notifications/${id}`),
    deleteAll: (userId) =>
        api.delete(`/notifications/user/${userId}/all`),
};

// Users
export const userAPI = {
    getAll: () => api.get('/users'),
    getById: (id) => api.get(`/users/${id}`),
    create: (data) => api.post('/users', data),
    updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
};

export default api;