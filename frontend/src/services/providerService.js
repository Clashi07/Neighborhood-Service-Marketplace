import api from './api';

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
  // Converts an object like { search: 'John', page: 1 } into a query string "?search=John&page=1"
  const queryString = new URLSearchParams(params).toString();
  const response = await api.get(`/providers/public?${queryString}`);
  return response.data;
};