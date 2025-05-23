/**
 * Browser-compatible implementation of the generateEtsyListing service
 * This version uses API calls instead of direct backend imports
 */
import { backendApi } from './apiClient';

/**
 * Generates an Etsy listing based on pattern content
 * @param {Object} input - Pattern content and other inputs
 * @param {Object} options - Optional parameters
 * @returns {Promise<Object>} - Generated Etsy listing or error object
 */
export async function generateEtsyListing(input, options = {}) {
  try {
    // Create a request ID for tracking
    const requestId = `etsy-${Date.now()}`;
    
    if (typeof window !== 'undefined' && import.meta.env.MODE !== 'production') {
      console.log(`🧶 [generateEtsyListing] [${requestId}] Preparing API request...`);
    }
    
    // Format the input for the backend API
    const payload = {
      input,
      options,
      featureKey: "create-listing"
    };
    
    // Send the request to the backend API
    const response = await backendApi.post('workflow/etsy-listing', payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId
      },
      timeout: 180000 // 3 minutes
    });
    
    if (response.data?.success) {
      if (typeof window !== 'undefined' && import.meta.env.MODE !== 'production') {
        console.log(`✅ [generateEtsyListing] [${requestId}] Listing successfully received`);
      }
      return response.data;
    } else {
      throw new Error(response.data?.error || 'Invalid response from API');
    }
  } catch (error) {
    if (typeof window !== 'undefined' && import.meta.env.MODE !== 'production') {
      console.error('❌ [generateEtsyListing] Error:', error.message);
    }
    
    return {
      success: false,
      title: options?.title || 'Error',
      description: 'An error occurred while generating the listing.',
      tags: [],
      altTexts: [],
      error: error.message
    };
  }
}
