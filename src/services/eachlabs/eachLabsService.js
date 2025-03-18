import { Each } from '@eachlabs/aiflow';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Each client
const each = new Each({
  auth: process.env.EACHLABS_API_KEY,
});

// Flow IDs for PDF and ZIP generation
const PDF_FLOW_ID = process.env.EACHLABS_PDF_FLOW_ID;
const ZIP_FLOW_ID = process.env.EACHLABS_ZIP_FLOW_ID;

/**
 * Validates the API key
 * @returns {Object|null} Error object if validation fails, null if successful
 */
const validateApiKey = () => {
  if (!process.env.EACHLABS_API_KEY) {
    return { error: "API key not configured" };
  }
  return null;
};

/**
 * Generates a PDF document from listing data
 * 
 * @param {Object} data - The listing data
 * @param {string} data.title - Listing title
 * @param {string} data.description - Listing description
 * @param {Array<string>} [data.images] - Array of image URLs
 * @returns {Promise<Object>} - Object containing PDF URL or error
 */
export const generatePDF = async (data) => {
  // Check API key first
  const validationError = validateApiKey();
  if (validationError) {
    return validationError;
  }

  try {
    // Validate required data
    if (!data.title || !data.description) {
      return { error: "Missing required fields" };
    }

    // Prepare the parameters
    const parameters = {
      title: data.title,
      description: data.description,
      images: data.images || [],
      timestamp: new Date().toISOString()
    };

    // Trigger the PDF generation flow
    const triggerId = await each.flow.trigger(PDF_FLOW_ID, {
      parameters,
      webhook_url: "",
    });

    return { pdfUrl: `https://eachlabs.com/generated-pdf/${triggerId}.pdf` };

  } catch (error) {
    console.error('PDF Generation Error:', error.message);
    return { error: "Failed to generate PDF" };
  }
};

/**
 * Generates a ZIP file containing listing data and images
 * 
 * @param {Object} data - The listing data
 * @param {string} data.title - Listing title
 * @param {string} data.description - Listing description
 * @param {Array<string>} data.images - Array of image URLs
 * @returns {Promise<Object>} - Object containing ZIP URL or error
 */
export const generateZIP = async (data) => {
  // Check API key first
  const validationError = validateApiKey();
  if (validationError) {
    return validationError;
  }

  try {
    // Validate required data
    if (!data.title || !data.description) {
      return { error: "Missing required fields" };
    }

    // Trigger the ZIP generation flow
    const triggerId = await each.flow.trigger(ZIP_FLOW_ID, {
      parameters: {
        title: data.title,
        description: data.description,
        images: data.images || []
      },
      webhook_url: "",
    });

    return { zipUrl: `https://eachlabs.com/generated-zip/${triggerId}.zip` };

  } catch (error) {
    console.error('ZIP Generation Error:', error.message);
    return { error: "Failed to generate ZIP" };
  }
};

/**
 * Checks the status of a generation task
 * 
 * @param {string} triggerId - The ID of the triggered flow
 * @returns {Promise<Object>} - Status object
 */
export const checkStatus = async (triggerId) => {
  try {
    const status = await each.flow.status(triggerId);
    return {
      success: true,
      status: status.state,
      progress: status.progress,
      result: status.result
    };
  } catch (error) {
    console.error('Status Check Error:', error.message);
    return {
      success: false,
      error: 'Failed to check status',
      details: error.message
    };
  }
};
