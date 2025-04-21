import { api } from '../api/apiClient';

export const profileService = {
  async getProfile(userId) {
    try {
      const profile = await api.getProfile(userId);
      return profile;
    } catch (error) {
      if (error.response?.status === 404) {
        // Return empty profile if not found
        return { first_name: '', last_name: '', store_name: '' };
      }
      throw error;
    }
  },

  async updateProfile(userId, profileData) {
    const { first_name, last_name, store_name } = profileData;
    
    try {
      const updatedProfile = await api.updateProfile(userId, {
        first_name,
        last_name,
        store_name
      });
      return updatedProfile;
    } catch (error) {
      if (import.meta.env.MODE !== 'production') console.error('Failed to update profile:', error);
      throw error;
    }
  }
};
