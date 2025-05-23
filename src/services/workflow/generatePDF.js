/**
 * Browser-compatible implementation of the generatePDF service
 * This version uses API calls instead of direct backend imports
 */
import { backendApi } from './apiClient';

/**
 * Generates a formatted PDF-ready version of a knitting or crochet pattern
 * @param {string} pattern - The pattern text to format for PDF
 * @param {Object} options - Optional parameters for formatting
 * @returns {Promise<Object>} - Formatted pattern or error object
 */
export async function generatePDF(pattern, options = {}) {
  try {
    // Create a request ID for tracking
    const requestId = `pdf-${Date.now()}`;
    
    if (typeof window !== 'undefined' && import.meta.env.MODE !== 'production') {
      console.log(`🧶 [generatePDF] [${requestId}] Preparing API request...`);
    }
    
    // Format the input for the backend API
    const payload = {
      pattern,
      options,
      featureKey: "generate-pdf"
    };
    
    // Send the request to the backend API
    const response = await backendApi.post('workflow/generate-pdf', payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId
      },
      timeout: 180000 // 3 minutes
    });
    
    if (response.data?.success) {
      if (typeof window !== 'undefined' && import.meta.env.MODE !== 'production') {
        console.log(`✅ [generatePDF] [${requestId}] PDF format successfully generated`);
      }
      return response.data;
    } else {
      throw new Error(response.data?.error || 'Invalid response from API');
    }
  } catch (error) {
    if (typeof window !== 'undefined' && import.meta.env.MODE !== 'production') {
      console.error('❌ [generatePDF] Error:', error.message);
    }
    
    return {
      success: false,
      formattedPattern: pattern, // Return original pattern on error
      error: error.message
    };
  }
}
