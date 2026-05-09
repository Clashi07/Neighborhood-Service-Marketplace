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

// ── New: Get a single public provider profile by ID ──────────────────────────

export const getProviderById = async (providerId) => {
  const response = await api.get(`/providers/public/${providerId}`);
  return response.data;
};

// ── New: Provider service category methods (FR-5) ────────────────────────────

export const setMyServices = async (services) => {
  const response = await api.post('/provider-services/my-services', { services });
  return response.data;
};

export const getMyServices = async () => {
  const response = await api.get('/provider-services/my-services');
  return response.data;
};

export const updateMyService = async (id, updates) => {
  const response = await api.put(`/provider-services/${id}`, updates);
  return response.data;
};

export const removeMyService = async (id) => {
  const response = await api.delete(`/provider-services/${id}`);
  return response.data;
};

// ── New: Customer-facing method ──────────────────────────────────────────────

export const getAllActiveServices = async (categoryId = null) => {
  const params = categoryId ? { category: categoryId } : {};
  const response = await api.get('/provider-services', { params });
  return response.data;
};