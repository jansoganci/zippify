import { api } from '../api/apiClient';

const USER_DATA_KEY = 'zippify_user';

/**
 * Stores user data in localStorage
 * @param {Object} userData - User data to store
 */
const storeUserData = (userData) => {
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
};

/**
 * Clears all auth-related data from localStorage
 */
const clearAuthData = () => {
  localStorage.removeItem(USER_DATA_KEY);
  localStorage.removeItem('zippify_token');
};

/**
 * Handles API errors and returns a user-friendly error message
 * @param {Error} error - Error object from API call
 * @returns {string} User-friendly error message
 */
const handleAuthError = (error) => {
  if (error.response) {
    // Server responded with error
    return error.response.data.message || 'Authentication failed. Please try again.';
  } else if (error.request) {
    // Request made but no response
    return 'Unable to connect to server. Please check your internet connection.';
  }
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Login user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Object} User data including token
 * @throws {Error} Authentication error
 */
export const login = async (email, password) => {
  try {
    const data = await api.login(email, password);
    const userData = {
      id: data.id,
      email: data.email,
      username: data.username,
      token: data.token
    };
    storeUserData(userData);
    return userData;
  } catch (error) {
    throw new Error(handleAuthError(error));
  }
};

/**
 * Register new user
 * @param {string} username - User's username
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Object} User data including token
 * @throws {Error} Registration error
 */
export const register = async (username, email, password) => {
  try {
    const data = await api.register(username, email, password);
    const userData = {
      id: data.id,
      email: data.email,
      username: data.username,
      token: data.token
    };
    storeUserData(userData);
    return userData;
  } catch (error) {
    throw new Error(handleAuthError(error));
  }
};

/**
 * Logout user and clear stored data
 */
export const logout = () => {
  clearAuthData();
};

/**
 * Request password reset for email
 * @param {string} email - User's email
 * @throws {Error} Password reset request error
 */
export const forgotPassword = async (email) => {
  try {
    await api.forgotPassword(email);
  } catch (error) {
    throw new Error(handleAuthError(error));
  }
};

/**
 * Reset password with token
 * @param {string} newPassword - New password
 * @param {string} token - Reset password token
 * @throws {Error} Password reset error
 */
export const resetPassword = async (newPassword, token) => {
  try {
    await api.resetPassword(newPassword, token);
  } catch (error) {
    throw new Error(handleAuthError(error));
  }
};

/**
 * Verify email with token
 * @param {string} token - Email verification token
 * @throws {Error} Email verification error
 */
export const verifyEmail = async (token) => {
  try {
    await api.verifyEmail(token);
  } catch (error) {
    throw new Error(handleAuthError(error));
  }
};

/**
 * Get current user data from localStorage
 * @returns {Object|null} User data or null if not logged in
 */
export const getCurrentUser = () => {
  const userDataStr = localStorage.getItem(USER_DATA_KEY);
  return userDataStr ? JSON.parse(userDataStr) : null;
};
