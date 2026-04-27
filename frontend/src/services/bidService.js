import api from './api';

class BidService {
  async createBid(bidData) {
    const response = await api.post('/bids', bidData);
    return response.data;
  }

  async getBidsForRequest(requestId, sortBy = 'createdAt') {
    const response = await api.get(`/bids/request/${requestId}?sortBy=${sortBy}`);
    return response.data;
  }

  async acceptBid(bidId) {
    const response = await api.put(`/bids/${bidId}/accept`);
    return response.data;
  }

  async rejectBid(bidId) {
    const response = await api.put(`/bids/${bidId}/reject`);
    return response.data;
  }

  async updateBid(bidId, data) {
    const response = await api.put(`/bids/${bidId}`, data);
    return response.data;
  }

  async withdrawBid(bidId) {
    const response = await api.put(`/bids/${bidId}/withdraw`);
    return response.data;
  }

  async getMyBids() {
    const response = await api.get('/bids/my-bids');
    return response.data;
  }
}

export default new BidService();