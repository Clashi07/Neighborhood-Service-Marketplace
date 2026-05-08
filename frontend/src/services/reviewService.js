import api from './api';

class ReviewService {
  async createReview(data) {
    const response = await api.post('/reviews', data);
    return response.data;
  }
  async getProviderReviews(providerId) {
    const response = await api.get(`/reviews/provider/${providerId}`);
    return response.data;
  }
  async getMyReview(bookingId) {
    const response = await api.get(`/reviews/my-review/${bookingId}`);
    return response.data;
  }
}
export default new ReviewService();