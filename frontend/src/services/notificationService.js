import api from './api';

class NotificationService {
  async getMyNotifications() {
    const response = await api.get('/notifications');
    return response.data;
  }
  async markAllRead() {
    const response = await api.put('/notifications/mark-read');
    return response.data;
  }
}
export default new NotificationService();