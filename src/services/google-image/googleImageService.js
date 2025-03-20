import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// API Configuration
const API_KEY = import.meta.env.GEMINI_API_KEY;

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(API_KEY);

// Get the Gemini Vision Pro model for image processing
const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

/**
 * Enhances an image using Google's Gemini Vision AI.
 * 
 * @param {File|Blob} imageFile - The image file to enhance
 * @param {Object} options - Enhancement options
 * @returns {Promise<Blob>} - Enhanced image blob
 */
export const enhanceImage = async (imageFile, options = {}) => {
  try {
    if (!API_KEY) {
      throw new Error('Gemini API key is not configured');
    }

    // Convert image to proper format for Gemini API
    const imageData = await fileToGenerativePart(imageFile);
    
    // Process image with Gemini Vision
    const result = await model.generateContent([
      imageData,
      { text: 'Enhance this image: improve lighting, color, and sharpness' }
    ]);

    const response = await result.response;
    return response.image();

  } catch (error) {
    console.error('Gemini Vision API Error:', error.message);
    throw error;
  }
};

/**
 * Removes the background from an image.
 * 
 * @param {File|Blob} imageFile - The image file to process
 * @returns {Promise<Blob>} - Image with background removed
 */
export const removeBackground = async (imageFile) => {
  try {
    const imageData = await fileToGenerativePart(imageFile);
    
    const result = await model.generateContent([
      imageData,
      { text: 'Remove the background from this image, keeping only the main subject' }
    ]);

    return result.response.image();
  } catch (error) {
    console.error('Background removal error:', error.message);
    throw error;
  }
};

/**
 * Resizes an image while maintaining quality.
 * 
 * @param {File|Blob} imageFile - The image to resize
 * @param {Object} dimensions - Target dimensions { width, height }
 * @returns {Promise<Blob>} - Resized image
 */
export const resizeImage = async (imageFile, dimensions) => {
  try {
    const imageData = await fileToGenerativePart(imageFile);
    
    const result = await model.generateContent([
      imageData,
      { text: `Resize this image to ${dimensions.width}x${dimensions.height} while maintaining quality` }
    ]);

    return result.response.image();
  } catch (error) {
    console.error('Image resize error:', error.message);
    throw error;
  }
};

/**
 * Applies a specific style to an image.
 * 
 * @param {File|Blob} imageFile - The image to style
 * @param {string} style - Style to apply (e.g., 'vintage', 'modern')
 * @returns {Promise<Blob>} - Styled image
 */
export const applyStyle = async (imageFile, style) => {
  try {
    const imageData = await fileToGenerativePart(imageFile);
    
    const result = await model.generateContent([
      imageData,
      { text: `Apply a ${style} style to this image` }
    ]);

    return result.response.image();
  } catch (error) {
    console.error('Style application error:', error.message);
    throw error;
  }
};

/**
 * Improves the overall quality of an image.
 * 
 * @param {File|Blob} imageFile - The image to improve
 * @returns {Promise<Blob>} - Improved image
 */
export const improveQuality = async (imageFile) => {
  try {
    const imageData = await fileToGenerativePart(imageFile);
    
    const result = await model.generateContent([
      imageData,
      { text: 'Improve the overall quality of this image: enhance resolution, reduce noise, and optimize colors' }
    ]);

    return result.response.image();
  } catch (error) {
    console.error('Quality improvement error:', error.message);
    throw error;
  }
};

/**
 * Helper function to convert File/Blob to Gemini's GenerativePart format
 */
async function fileToGenerativePart(file) {
  const buffer = await file.arrayBuffer();
  return {
    inlineData: {
      data: Buffer.from(buffer).toString('base64'),
      mimeType: file.type
    }
  };
}
