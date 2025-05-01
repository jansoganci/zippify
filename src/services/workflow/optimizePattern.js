/**
 * Browser-compatible implementation of the optimizePattern service
 * This version uses API calls instead of direct backend imports
 */
import { backendApi } from './apiClient';

/**
 * Optimizes a knitting or crochet pattern for clarity and readability
 * @param {string} pattern - The original pattern text to optimize
 * @param {Object} options - Optional parameters for optimization
 * @returns {Promise<Object>} - Optimized pattern or error object
 */
export async function optimizePattern(pattern, options = {}) {
  try {
    // Create a request ID for tracking
    const requestId = `pattern-${Date.now()}`;
    
    if (typeof window !== 'undefined' && import.meta.env.MODE !== 'production') {
      console.log(`🧶 [optimizePattern] [${requestId}] Preparing API request...`);
    }
    
    // Format the input for the backend API
    const payload = {
      pattern,
      options,
      featureKey: "optimize-pattern"
    };
    
    // Send the request to the backend API
    const response = await backendApi.post('/api/workflow/optimize-pattern', payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId
      },
      timeout: 180000 // 3 minutes
    });
    
    if (response.data?.success) {
      if (typeof window !== 'undefined' && import.meta.env.MODE !== 'production') {
        console.log(`✅ [optimizePattern] [${requestId}] Pattern successfully optimized`);
      }
      return response.data;
    } else {
      throw new Error(response.data?.error || 'Invalid response from API');
    }
  } catch (error) {
    if (typeof window !== 'undefined' && import.meta.env.MODE !== 'production') {
      console.error('❌ [optimizePattern] Error:', error.message);
    }
    
    return {
      success: false,
      optimizedPattern: pattern, // Return original pattern on error
      error: error.message
    };
  }
}
