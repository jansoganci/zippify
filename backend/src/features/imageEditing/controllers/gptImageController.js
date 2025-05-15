import axios from 'axios';
import FormData from 'form-data';
import { Buffer } from 'buffer';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import os from 'os';
import log from '../../../../utils/logger.js';
import { enhanceImagePrompt } from '../../../services/promptEnhancement/enhancePrompt.js';

// List of potentially problematic terms for OpenAI's content filter
const SENSITIVE_TERMS = [
  'nude', 'naked', 'explicit', 'pornographic', 'sexual', 'offensive',
  'violent', 'graphic', 'gore', 'blood', 'weapon', 'gun', 'knife',
  'illegal', 'drugs', 'suicide', 'self-harm', 'terrorist', 'extremist',
  'hate speech', 'discriminatory', 'racist', 'sexist', 'harassment'
];

// Sleep utility for retry delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Sanitizes a prompt to make it safer for OpenAI's content filter
 * @param {string} prompt - The original prompt
 * @returns {string} - Sanitized prompt
 */
const sanitizePromptForOpenAI = (prompt) => {
  if (!prompt) return '';
  
  let sanitized = prompt;
  
  // Convert to lowercase for case-insensitive matching
  const lowerPrompt = prompt.toLowerCase();
  
  // Check for sensitive terms
  const hasSensitiveTerms = SENSITIVE_TERMS.some(term => 
    lowerPrompt.includes(term.toLowerCase())
  );
  
  if (hasSensitiveTerms) {
    // For e-commerce product photography, we can safely replace with a generic prompt
    sanitized = 'Create a professional product photo with a clean white background';
  }
  
  // Ensure the prompt is about image editing, not generation
  if (!lowerPrompt.includes('background') && !lowerPrompt.includes('edit') && !lowerPrompt.includes('modify')) {
    sanitized = `Edit the image: ${sanitized}`;
  }
  
  // Ensure the prompt is focused on product photography
  if (!lowerPrompt.includes('product') && !lowerPrompt.includes('item') && !lowerPrompt.includes('object')) {
    sanitized = `${sanitized} for product photography`;
  }
  
  // Limit prompt length
  if (sanitized.length > 500) {
    sanitized = sanitized.substring(0, 497) + '...';
  }
  
  return sanitized;
};

/**
 * Controller function to handle image editing with OpenAI GPT-Image-1 API
 * 
 * @param {object} req - Express request object containing image and prompt
 * @param {object} res - Express response object
 */
export const editImageWithGpt = async (req, res) => {
  const requestId = req.headers['x-request-id'] || `gpt-img-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const startTime = Date.now();
  
  // Log initial request details
  const imageSize = req.body.image ? Math.round(req.body.image.length / 1024) : 0;
  log.info(`[${requestId}] Received GPT image edit request - Size: ${imageSize}KB, Time: ${new Date().toISOString()}`);
  
  try {
    const { image, prompt } = req.body;
    
    // Validate request fields
    if (!image) {
      log.info(`[${requestId}] Validation failed: Image is missing from request`);
      return res.status(400).json({
        success: false,
        message: 'Image is required',
        requestId
      });
    }
    
    if (!prompt) {
      log.info(`[${requestId}] Validation failed: Prompt is missing from request`);
      return res.status(400).json({
        success: false,
        message: 'Prompt is required',
        requestId
      });
    }
    
    log.info(`[${requestId}] Validation successful - Original prompt: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"`);
    
    // Enhance the prompt using DeepSeek
    const enhancementStartTime = Date.now();
    const { prompt: enhancedPrompt, enhanced } = await enhanceImagePrompt(prompt, {
      requestId,
      category: req.body.category || 'general',
      platform: req.body.platform || 'ecommerce'
    });
    
    const enhancementDuration = Date.now() - enhancementStartTime;
    
    if (enhanced) {
      log.info(`[${requestId}] Prompt enhanced in ${enhancementDuration}ms - Enhanced: "${enhancedPrompt.substring(0, 50)}${enhancedPrompt.length > 50 ? '...' : ''}"`);
    } else {
      log.info(`[${requestId}] Using original prompt - Enhancement failed or skipped (${enhancementDuration}ms)`);
    }
    
    // Extract image metadata for logging
    let mimeType = 'unknown';
    if (image.startsWith('data:')) {
      const matches = image.match(/^data:([^;]+);base64,/);
      if (matches && matches.length > 1) {
        mimeType = matches[1];
      }
    }
    log.info(`[${requestId}] Processing image - Type: ${mimeType}, Size: ${imageSize}KB`);
    
    // Call the OpenAI GPT-Image-1 API with the enhanced prompt
    log.info(`[${requestId}] Calling OpenAI GPT-Image-1 API with ${enhanced ? 'enhanced' : 'original'} prompt: "${enhancedPrompt.substring(0, 30)}${enhancedPrompt.length > 30 ? '...' : ''}"`);
    const apiCallStartTime = Date.now();
    
    // Check if API key is available
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      log.error(`[${requestId}] OpenAI API key is not configured`);
      return res.status(500).json({
        success: false,
        message: 'OpenAI API key is not configured',
        requestId
      });
    }
    
    try {
      // Extract the base64 data from the data URL and convert to buffer
      let base64ImageData = image;
      if (image.startsWith('data:')) {
        base64ImageData = image.split(',')[1];
      }
      
      // Convert base64 to buffer
      const originalBuffer = Buffer.from(base64ImageData, 'base64');
      
      // Create temporary files directory if it doesn't exist
      const tempDir = path.join(os.tmpdir(), 'zippify-openai-temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // Create temporary image file
      const tempImagePath = path.join(tempDir, `${requestId}-image.png`);
      
      // Resize and optimize the image before saving to reduce file size
      // Limit to 1024x1024 and optimize for web
      log.info(`[${requestId}] Resizing and converting image to PNG format`);
      await sharp(originalBuffer)
        .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
        .toFormat('png', { compressionLevel: 9, quality: 80 })
        .toFile(tempImagePath);
        
      // Generate a mask where the background is transparent and the subject is opaque
      // For background removal, we'll create a simple mask with a white rectangle in the center
      // This tells OpenAI to only edit the outer areas (background)
      log.info(`[${requestId}] Generating mask for background editing`);
      const tempMaskPath = path.join(tempDir, `${requestId}-mask.png`);
      
      // Create a mask with transparent background (outer area) and white subject (center area)
      // The mask dimensions must match the image dimensions
      const { width, height } = await sharp(tempImagePath).metadata();
      
      // Calculate mask parameters - make the center 70% opaque to preserve the subject
      const centerWidth = Math.round(width * 0.7);
      const centerHeight = Math.round(height * 0.7);
      const centerX = Math.round((width - centerWidth) / 2);
      const centerY = Math.round((height - centerHeight) / 2);
      
      // Create a transparent PNG with a white rectangle in the center
      await sharp({
        create: {
          width: width,
          height: height,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
        }
      })
      .composite([
        {
          input: Buffer.from(
            `<svg><rect x="${centerX}" y="${centerY}" width="${centerWidth}" height="${centerHeight}" fill="white"/></svg>`
          ),
          gravity: 'northwest'
        }
      ])
      .png()
      .toFile(tempMaskPath);
      
      log.info(`[${requestId}] Mask generated successfully`);
        
      // Log the file size after processing
      const fileStats = fs.statSync(tempImagePath);
      const fileSizeKB = Math.round(fileStats.size / 1024);
      log.info(`[${requestId}] Processed image size: ${fileSizeKB}KB`);
      
      // Get model and other parameters from environment variables or use defaults
      const model = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
      const size = process.env.OPENAI_IMAGE_SIZE || '1024x1024';
      // OpenAI images.edit endpoint only accepts 'low', 'medium', 'high', or 'auto' for quality
      let quality = process.env.OPENAI_IMAGE_QUALITY || 'medium';
      // Ensure quality is one of the valid values
      const validQualities = ['low', 'medium', 'high', 'auto'];
      if (!validQualities.includes(quality)) {
        quality = 'medium'; // Default to 'medium' for any invalid value
      }
      
      // Log API request parameters
      log.info(`[${requestId}] API request parameters: model=${model}, size=${size}, quality=${quality}`);
      
      // Create form data for multipart request
      const formData = new FormData();
      
      // Note: 'style' parameter is not supported by OpenAI's images.edit endpoint
      // We're logging the style from env vars for reference only
      const style = process.env.OPENAI_IMAGE_STYLE || 'natural';
      log.info(`[${requestId}] Image style in config: ${style} (not used for images.edit API)`);
      
      // Add model parameter
      formData.append('model', model);
      
      // Add image file
      formData.append('image', fs.createReadStream(tempImagePath));
      
      // Add mask file - this is required for the images.edit endpoint
      formData.append('mask', fs.createReadStream(tempMaskPath));
      
      // Sanitize the prompt for OpenAI's content filter
      const sanitizedPrompt = sanitizePromptForOpenAI(enhancedPrompt);
      
      // Log the sanitized prompt
      if (sanitizedPrompt !== enhancedPrompt) {
        log.info(`[${requestId}] Prompt sanitized for content safety. Original length: ${enhancedPrompt.length}, Sanitized length: ${sanitizedPrompt.length}`);
      }
      
      // Add the sanitized prompt
      formData.append('prompt', sanitizedPrompt);
      
      // Add size if specified
      if (size) {
        formData.append('size', size);
      }
      
      // Add quality if specified
      if (quality) {
        formData.append('quality', quality);
      }
      
      // Log the request details for debugging
      log.info(`[${requestId}] Sending request to OpenAI API with endpoint: images.edit`);
      
      // Retry configuration
      const MAX_RETRIES = 2;
      const RETRY_DELAY = 1000; // 1 second delay between retries
      let retryCount = 0;
      let lastError = null;
      let lastResponse = null;
      
      // Retry loop for handling 5xx errors
      while (retryCount <= MAX_RETRIES) {
        try {
          // Create an AbortController for timeout handling
          const controller = new AbortController();
          let response;
          
          // Set a timeout to abort the request after 60 seconds
          const timeoutId = setTimeout(() => {
            controller.abort();
            log.warn(`[${requestId}] OpenAI API request timed out after 60 seconds`);
          }, 60000); // 60 seconds timeout
          
          try {
            // Make the API request with abort signal
            response = await axios.post('https://api.openai.com/v1/images/edits', formData, {
              headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${apiKey}`
              },
              maxBodyLength: Infinity,
              maxContentLength: Infinity,
              signal: controller.signal
            });
            
            // Clear the timeout since request completed successfully
            clearTimeout(timeoutId);
          } catch (innerError) {
            // Clear the timeout to prevent memory leaks
            clearTimeout(timeoutId);
            
            // Check if this was an abort error
            if (innerError.name === 'AbortError' || innerError.code === 'ECONNABORTED') {
              throw new Error(`OpenAI API request timed out after 60 seconds`);
            }
            
            // Re-throw other errors to be handled by the outer catch
            throw innerError;
          }
          
          // If we get here, the request was successful
          if (retryCount > 0) {
            log.info(`[${requestId}] OpenAI API request succeeded after ${retryCount} ${retryCount === 1 ? 'retry' : 'retries'}`);
          }
          
          // Store the successful response for later use
          lastResponse = response;
          log.info(`[${requestId}] OpenAI GPT-Image-1 API response received with image URL`);
          
          // Log success details
          log.info(`[${requestId}] OpenAI API response status: ${response.status}`);
          log.info(`[${requestId}] OpenAI API response data: ${JSON.stringify(response.data).substring(0, 200)}...`);
          
          // Break out of the retry loop on success
          break;
        } catch (apiError) {
          lastError = apiError;
          
          // Check if this is a 5xx error or 429 Too Many Requests error that we should retry
          const status = apiError.response?.status;
          const is5xxError = status >= 500 && status < 600;
          const is429Error = status === 429; // Rate limit exceeded
          
          if ((is5xxError || is429Error) && retryCount < MAX_RETRIES) {
            retryCount++;
            
            // Handle 429 errors with Retry-After header
            let waitTime = RETRY_DELAY; // Default wait time
            
            if (is429Error) {
              // Check for Retry-After header (in seconds)
              const retryAfter = apiError.response?.headers?.['retry-after'];
              if (retryAfter && !isNaN(parseInt(retryAfter))) {
                // Convert Retry-After from seconds to milliseconds
                waitTime = parseInt(retryAfter) * 1000;
                log.warn(`[${requestId}] OpenAI API rate limited (429), Retry-After header: ${retryAfter}s, waiting ${waitTime}ms before retry ${retryCount}/${MAX_RETRIES}`);
              } else {
                log.warn(`[${requestId}] OpenAI API rate limited (429), no valid Retry-After header, using default delay of ${waitTime}ms before retry ${retryCount}/${MAX_RETRIES}`);
              }
            } else {
              // 5xx error
              log.warn(`[${requestId}] OpenAI API returned ${status} error, retrying (${retryCount}/${MAX_RETRIES}) after ${waitTime}ms...`);
            }
            
            await sleep(waitTime);
          } else {
            // Either not a retryable error or we've exhausted retries
            if (is5xxError || is429Error) {
              log.error(`[${requestId}] OpenAI API returned ${status} error after ${MAX_RETRIES} retries, giving up.`);
            } else {
              log.error(`[${requestId}] OpenAI API error: ${apiError.message} (Status: ${status || 'unknown'})`);
            }
            throw apiError; // Re-throw to be caught by the outer catch block
          }
        }
      }
      
      // If we've exhausted retries and still have an error, throw it
      if (lastError && retryCount > MAX_RETRIES) {
        throw lastError;
      }
      
      // Clean up temporary files
      try {
        fs.unlinkSync(tempImagePath);
        fs.unlinkSync(tempMaskPath);
        log.info(`[${requestId}] Temporary files cleaned up`);
      } catch (cleanupError) {
        log.warn(`[${requestId}] Error cleaning up temporary files: ${cleanupError.message}`);
      }
      
      log.info(`[${requestId}] Image successfully processed by OpenAI API`);
      
      // Get the image data (base64) from the successful response
      const imageData = lastResponse.data.data[0].b64_json;
      
      const apiCallDuration = Date.now() - apiCallStartTime;
      log.info(`[${requestId}] OpenAI API call successful - Duration: ${apiCallDuration}ms`);
      
      const totalDuration = Date.now() - startTime;
      log.info(`[${requestId}] Sending successful response to client - Total processing time: ${totalDuration}ms`);
      
      return res.json({
        success: true,
        message: "Image edit successful using OpenAI GPT-Image-1 API.",
        originalPrompt: prompt,
        enhancedPrompt: enhanced ? enhancedPrompt : null,
        sanitizedPrompt: sanitizedPrompt !== enhancedPrompt ? sanitizedPrompt : null,
        promptEnhanced: enhanced,
        result: {
          image: imageData,
          responseText: "Image edited with OpenAI GPT-Image-1"
        },
        requestId,
        processingTime: totalDuration
      });
    } catch (apiError) {
      // Specific logging for OpenAI API errors
      const apiErrorStatus = apiError.response?.status || 'unknown';
      const apiErrorMessage = apiError.response?.data?.error?.message || apiError.message;
      
      log.error(`[${requestId}] OpenAI API Error - Status: ${apiErrorStatus}`);
      log.error(`[${requestId}] OpenAI API Error Details: ${apiErrorMessage}`);
      
      throw new Error(`OpenAI API Error (${apiErrorStatus}): ${apiErrorMessage}`);
    }
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    log.error(`[${requestId}] Image Edit Error - Duration: ${totalDuration}ms`);
    log.error(`[${requestId}] Error Type: ${error.name}, Message: ${error.message}`);
    
    res.status(500).json({
      success: false,
      message: `Failed to edit image: ${error.message}`,
      requestId,
      processingTime: totalDuration
    });
  }
};

