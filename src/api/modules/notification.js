import api from '../api';

const notificationApi = {
    // getNotifications() {
    //     return api.get('/notifications');
    // },

    getNotifications(page = 0, size = 5) {
        return api.get(`/notifications?page=${page}&size=${size}`);
    },

    markAsRead(notificationId) {
        return api.post(`/notifications/${notificationId}`);
    }
}

export default notificationApi;