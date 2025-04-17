/**
 * Simple caching system for Gemini API image editing results
 * Uses in-memory Map to store image results based on image+prompt hash
 */

import crypto from 'crypto';

// In-memory cache storage
const imageCache = new Map();

// Cache expiration time (24 hours in milliseconds)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

/**
 * Generates a unique SHA256 hash from image and prompt
 * 
 * @param {string} image - Base64 image data
 * @param {string} prompt - Text prompt for image editing
 * @returns {string} - SHA256 hash representing the unique image+prompt combination
 */
export function generateImageHash(image, prompt) {
  // Create a hash of the image content (use only the base64 data part to avoid data URL variations)
  let imageData = image;
  if (image.startsWith('data:')) {
    const matches = image.match(/^data:[^;]+;base64,(.+)$/);
    if (matches && matches.length === 2) {
      imageData = matches[1];
    }
  }
  
  // Combine image data and prompt to create a unique hash
  const combinedData = imageData.substring(0, 1000) + prompt; // Use first 1000 chars of image data to avoid excessive memory usage
  
  // Generate SHA256 hash
  return crypto.createHash('sha256').update(combinedData).digest('hex');
}

/**
 * Retrieves a cached image result if it exists and is not expired
 * 
 * @param {string} hash - The hash key for the cached image
 * @returns {Promise<string|null>} - Cached base64 image or null if not found/expired
 */
export async function getImageCache(hash) {
  if (!imageCache.has(hash)) {
    return null;
  }
  
  const cacheEntry = imageCache.get(hash);
  
  // Check if cache entry has expired
  if (Date.now() - cacheEntry.timestamp > CACHE_EXPIRATION) {
    // Remove expired entry
    imageCache.delete(hash);
    return null;
  }
  
  return cacheEntry.image;
}

/**
 * Stores an image result in the cache
 * 
 * @param {string} hash - The hash key for the image
 * @param {string} imageBase64 - The base64 image data to cache
 * @returns {Promise<void>}
 */
export async function setImageCache(hash, imageBase64) {
  // Store image with timestamp for expiration checking
  imageCache.set(hash, {
    image: imageBase64,
    timestamp: Date.now()
  });
  
  // Limit cache size to prevent memory issues (keep only the most recent 100 entries)
  if (imageCache.size > 100) {
    // Get all entries sorted by timestamp (oldest first)
    const entries = [...imageCache.entries()]
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Remove oldest entries until we're back to 100
    while (entries.length > 100) {
      const oldest = entries.shift();
      if (oldest) {
        imageCache.delete(oldest[0]);
      }
    }
  }
}
