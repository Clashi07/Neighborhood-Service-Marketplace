import api from './api';

class AdminService {
  async getAllUsers(role = '') {
    const query = role ? `?role=${role}` : '';
    const response = await api.get(`/admin/users${query}`);
    return response.data;
  }

  async getUserById(id) {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  }

  async toggleUserActive(id) {
    const response = await api.put(`/admin/users/${id}/toggle-active`);
    return response.data;
  }

  async changeUserRole(id, role) {
    const response = await api.put(`/admin/users/${id}/change-role`, { role });
    return response.data;
  }

  async deleteUser(id) {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  }

  async getPendingUsers() {
    const response = await api.get('/admin/users/pending');
    return response.data;
  }
}

export default new AdminService();