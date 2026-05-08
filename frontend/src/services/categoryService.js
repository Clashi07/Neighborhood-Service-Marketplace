import api from './api';

class CategoryService {
  // Get all categories
  async getAllCategories() {
    const response = await api.get('/categories');
    return response.data;
  }

  // Get single category
  async getCategory(id) {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  }

  // Create category (Admin only)
  async createCategory(categoryData) {
    const response = await api.post('/categories', categoryData);
    return response.data;
  }

  // Update category (Admin only)
  async updateCategory(id, categoryData) {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  }

  // Delete category (Admin only)
  async deleteCategory(id) {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }
}

const categoryService = new CategoryService();

// Named export so ProviderCategoriesPage can use: import { getAllCategories } from '...'
export const getAllCategories = () => categoryService.getAllCategories();

export default categoryService;