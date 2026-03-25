import axios from 'axios';

const API_URL = '/api/v1/service-providers';
const CATEGORY_URL = '/api/categories'; // ✅ Matches your Admin's Category Route

// FR-4.1 & FR-4.4: Create or Update Provider Profile
export const createOrUpdateProfile = async (profileData) => {
    const response = await axios.post(`${API_URL}/profile`, profileData, {
        headers: {
            'Content-Type': 'application/json'
        },
        withCredentials: true
    });
    return response.data;
};

// Get the current logged-in provider's profile
export const getMyProfile = async () => {
    const response = await axios.get(`${API_URL}/profile`, {
        withCredentials: true
    });
    return response.data;
};

// ✅ ADD THIS: Fetches Admin's categories for the Provider to select
export const getAllCategories = async () => {
    const response = await axios.get(CATEGORY_URL, {
        withCredentials: true
    });
    return response.data; // Returns { success: true, data: [...] }
};