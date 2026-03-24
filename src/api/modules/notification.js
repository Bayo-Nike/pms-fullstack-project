import api from '../api';

const notificationApi = {
    getNotifications() {
        return api.get('/notifications');
    },

    markAsRead(notificationId) {
        return api.post(`/notifications/${notificationId}`);
    }
}

export default notificationApi;