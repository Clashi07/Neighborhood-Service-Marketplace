import api from './api';

class DirectBookingService {
  async createBooking(data) {
    const response = await api.post('/direct-bookings', data);
    return response.data;
  }
  async getMyBookings() {
    const response = await api.get('/direct-bookings/my-bookings');
    return response.data;
  }
  async getProviderRequests() {
    const response = await api.get('/direct-bookings/my-requests');
    return response.data;
  }
  async acceptBooking(id, agreedPrice) {
    const response = await api.put(`/direct-bookings/${id}/accept`, { agreedPrice });
    return response.data;
  }
  async rejectBooking(id, reason) {
    const response = await api.put(`/direct-bookings/${id}/reject`, { reason });
    return response.data;
  }
}
export default new DirectBookingService();