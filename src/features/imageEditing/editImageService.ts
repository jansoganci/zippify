import axios from 'axios';
import { BatchImageResult } from './components/BatchResults';

/**
 * Sends an image and prompt to the backend for editing using the Gemini API
 * @param {string} base64Image - The base64-encoded image to edit
 * @param {string} prompt - The text prompt describing the desired edits
 * @param {string} category - The product category (jewelry, clothing, etc.)
 * @param {string} platform - The target platform (etsy, amazon, ebay)
 * @returns {Promise<string>} - The edited image as a base64 string
 * @throws {Error} - If the API request fails or returns an unsuccessful response
 */
export async function editImageWithPrompt(base64Image: string, prompt: string, category: string = 'jewelry', platform: string = 'etsy'): Promise<string> {
  try {
    // Retrieve JWT token from localStorage
    const token = localStorage.getItem("zippify_token");
    
    // Make the API request to the backend
    const response = await axios.post(
      "/api/edit-image", 
      {
        image: base64Image,
        prompt: prompt,
        category: category,
        platform: platform,
        featureKey: "edit-image"
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        }
      }
    );
    
    // Check if the request was successful and contains image data
    if (!response.data.success) {
      throw new Error(response.data.message || "Image editing failed");
    }
    
    // Verify that the result and image data exist
    if (!response.data.result || !response.data.result.image) {
      console.error("API response missing image data:", response.data);
      throw new Error("Image data missing from successful response");
    }
    
    // Return the edited image
    return response.data.result.image;
  } catch (error) {
    // Handle axios errors
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw new Error(`Image editing failed: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error("No response received from server. Please check your connection.");
      } else {
        // Something happened in setting up the request
        throw new Error(`Error setting up request: ${error.message}`);
      }
    }
    
    // For non-axios errors
    throw new Error(`Image editing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Process a single image edit with error handling
 * @param {string} image - The base64-encoded image to edit
 * @param {string} prompt - The text prompt describing the desired edits
 * @param {string} category - The product category (jewelry, clothing, etc.)
 * @param {string} platform - The target platform (etsy, amazon, ebay)
 * @returns {Promise<{image: string, error: string | null}>} - The edited image or error
 */
export async function processSingleImageEdit(
  image: string, 
  prompt: string, 
  category: string = 'jewelry', 
  platform: string = 'etsy'
): Promise<{image: string | null, error: string | null}> {
  try {
    console.log("Sending request to backend API...");
    const requestStartTime = Date.now();
    
    const editedImage = await editImageWithPrompt(image, prompt, category, platform);
    
    const requestDuration = Date.now() - requestStartTime;
    console.log(`Received response from backend after ${requestDuration}ms`);
    
    if (editedImage) {
      return { image: editedImage, error: null };
    } else {
      return { image: null, error: "No image data received from the server" };
    }
  } catch (error) {
    console.error("Error editing image:", error);
    return { 
      image: null, 
      error: error instanceof Error ? error.message : "Failed to edit image. Please try again." 
    };
  }
}

/**
 * Process multiple images with the same prompt and handle progress updates
 * @param {File[]} files - Array of image files to process
 * @param {string} prompt - The text prompt describing the desired edits
 * @param {Function} onProgress - Callback for progress updates
 * @param {string} category - The product category (jewelry, clothing, etc.)
 * @param {string} platform - The target platform (etsy, amazon, ebay)
 * @returns {Promise<BatchImageResult[]>} - Array of results with original and edited images
 */
export async function processBatchImageEdits(
  files: File[],
  prompt: string,
  onProgress: (index: number, status: BatchImageResult['status'], result?: string, error?: string) => void,
  category: string = 'jewelry',
  platform: string = 'etsy'
): Promise<BatchImageResult[]> {
  return await editMultipleImages(files, prompt, { onProgress }, category, platform);
}

/**
 * Processes multiple images with the same prompt
 * @param {File[]} images - Array of image files to process
 * @param {string} prompt - The text prompt describing the desired edits
 * @param {Object} options - Optional parameters for processing
 * @param {string} category - The product category (jewelry, clothing, etc.)
 * @param {string} platform - The target platform (etsy, amazon, ebay)
 * @returns {Promise<BatchImageResult[]>} - Array of results with original and edited images
 */
export async function editMultipleImages(
  images: File[], 
  prompt: string, 
  options: { onProgress?: (index: number, status: BatchImageResult['status'], result?: string, error?: string) => void } = {},
  category: string = 'jewelry',
  platform: string = 'etsy'
): Promise<BatchImageResult[]> {
  const results: BatchImageResult[] = [];
  
  // Initialize results array with pending status
  for (const image of images) {
    results.push({
      originalImage: URL.createObjectURL(image),
      editedImage: null,
      status: 'pending',
      fileName: image.name
    });
  }
  
  // Process each image sequentially
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    
    try {
      // Update status to processing
      results[i].status = 'processing';
      if (options.onProgress) {
        options.onProgress(i, 'processing');
      }
      
      // Convert image to base64
      const base64Image = await fileToBase64(image);
      
      // Process the image
      console.log(`Processing image ${i + 1}/${images.length}: ${image.name}`);
      const editedImage = await editImageWithPrompt(base64Image, prompt, category, platform);
      
      // Update result
      results[i].editedImage = editedImage;
      results[i].status = 'completed';
      if (options.onProgress) {
        options.onProgress(i, 'completed', editedImage);
      }
      
      // Add delay between requests to avoid rate limits
      if (i < images.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      // Handle errors
      console.error(`Error processing image ${i + 1}/${images.length}:`, error);
      results[i].status = 'error';
      results[i].error = error instanceof Error ? error.message : String(error);
      if (options.onProgress) {
        options.onProgress(i, 'error', undefined, results[i].error);
      }
    }
  }
  
  return results;
}

/**
 * Converts a File object to a base64 string
 * @param {File} file - The file to convert
 * @returns {Promise<string>} - The base64 representation of the file
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsDataURL(file);
  });
}