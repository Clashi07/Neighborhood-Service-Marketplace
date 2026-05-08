import api from './api';

export const getUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await api.put('/users/profile', profileData);
  return response.data;
};

export const changePassword = async (passwordData) => {
  const response = await api.put('/users/password', passwordData);
  return response.data;
};

export const deactivateAccount = async () => {
  const response = await api.put('/users/deactivate');
  return response.data;
};

export const updateNotificationPreferences = async (preferences) => {
  const response = await api.put('/users/notification-preferences', preferences);
  return response.data;
};