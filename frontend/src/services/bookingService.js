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

  async getBooking(bookingId) {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  }
}

export default new BookingService();