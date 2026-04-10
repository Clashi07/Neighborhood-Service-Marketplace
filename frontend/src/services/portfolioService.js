import api from './api';

// Get all portfolio images for logged-in provider
export const getPortfolio = async () => {
  const response = await api.get('/portfolio');
  return response.data;
};

// Upload a new portfolio image (multipart/form-data)
export const uploadPortfolioImage = async (formData) => {
  const response = await api.post('/portfolio', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// Delete a portfolio image by ID
export const deletePortfolioImage = async (id) => {
  const response = await api.delete(`/portfolio/${id}`);
  return response.data;
};

// Update description of a portfolio image
export const updateImageDescription = async (id, description) => {
  const response = await api.put(`/portfolio/${id}`, { description });
  return response.data;
};

// Reorder portfolio images
export const reorderPortfolioImages = async (reorderedItems) => {
  const response = await api.put('/portfolio/reorder', { reorderedItems });
  return response.data;
};