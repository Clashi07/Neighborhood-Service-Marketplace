import api from './api';

// ── Existing provider profile methods (unchanged) ────────────────────────────

export const getProviderProfile = async () => {
  const response = await api.get('/providers/profile');
  return response.data;
};

export const updateProviderProfile = async (profileData) => {
  const response = await api.put('/providers/profile', profileData);
  return response.data;
};

export const deleteProviderProfile = async () => {
  const response = await api.delete('/providers/profile');
  return response.data;
};

export const getPublicProviders = async (params) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await api.get(`/providers/public?${queryString}`);
  return response.data;
};

// ── New: Provider service category methods (FR-5) ────────────────────────────

// Publish (replace) all my services in one call
// services = [{ categoryId, minPrice, maxPrice, description }]
export const setMyServices = async (services) => {
  const response = await api.post('/provider-services/my-services', { services });
  return response.data;
};

// Get my own published services (pre-fills the category page on reload)
export const getMyServices = async () => {
  const response = await api.get('/provider-services/my-services');
  return response.data;
};

// Update a single service entry by its _id
export const updateMyService = async (id, updates) => {
  const response = await api.put(`/provider-services/${id}`, updates);
  return response.data;
};

// Remove a single service entry by its _id
export const removeMyService = async (id) => {
  const response = await api.delete(`/provider-services/${id}`);
  return response.data;
};

// ── New: Customer-facing method ──────────────────────────────────────────────

// Browse all active services; optionally filter by categoryId
export const getAllActiveServices = async (categoryId = null) => {
  const params = categoryId ? { category: categoryId } : {};
  const response = await api.get('/provider-services', { params });
  return response.data;
};