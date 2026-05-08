import api from './api';

class ServiceRequestService {
  // Create service request
  async createServiceRequest(formData) {
    const response = await api.post('/service-requests', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  // Get my service requests
  async getMyRequests(filters = {}) {
    const queryString = new URLSearchParams(filters).toString();
    const response = await api.get(`/service-requests/my-requests?${queryString}`);
    return response.data;
  }

  // Get all service requests (for providers)
  async getAllRequests(filters = {}) {
    const queryString = new URLSearchParams(filters).toString();
    const response = await api.get(`/service-requests?${queryString}`);
    return response.data;
  }

  // Get single service request
  async getServiceRequest(id) {
    const response = await api.get(`/service-requests/${id}`);
    return response.data;
  }

  // Update service request
  async updateServiceRequest(id, data) {
    const response = await api.put(`/service-requests/${id}`, data);
    return response.data;
  }

  // Delete service request
  async deleteServiceRequest(id) {
    const response = await api.delete(`/service-requests/${id}`);
    return response.data;
  }
}

export default new ServiceRequestService();