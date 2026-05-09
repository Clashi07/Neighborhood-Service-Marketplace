import api from './api';

class BookingService {
  async getCustomerBookings() {
    const response = await api.get('/bookings/my-bookings');
    return response.data;
  }
  async getProviderBookings() {
    const response = await api.get('/bookings/my-jobs');
    return response.data;
  }
  async completeBooking(bookingId) {
    const response = await api.put(`/bookings/${bookingId}/complete`);
    return response.data;
  }
  async cancelBooking(bookingId, reason) {
    const response = await api.put(`/bookings/${bookingId}/cancel`, { reason });
    return response.data;
  }
  async requestReschedule(bookingId, newDate, reason) {
    const response = await api.put(`/bookings/${bookingId}/reschedule`, { newDate, reason });
    return response.data;
  }
  async respondReschedule(bookingId, action) {
    const response = await api.put(`/bookings/${bookingId}/reschedule-response`, { action });
    return response.data;
  }
  async getBooking(bookingId) {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  }
}

export default new BookingService();