import api from './api';

class UserService {
  async getProfile() {
    const response = await api.get('/users/profile');
    return response.data;
  }

  async updateProfile(data) {
    const response = await api.put('/users/profile', data);
    return response.data;
  }

  async changePassword(currentPassword, newPassword) {
    const response = await api.put('/users/password', { currentPassword, newPassword });
    return response.data;
  }

  async updateNotificationSettings(settings) {
    const response = await api.put('/users/notifications', settings);
    return response.data;
  }

  async deactivateAccount(password) {
    const response = await api.put('/users/deactivate', { password });
    return response.data;
  }
}

export default new UserService();