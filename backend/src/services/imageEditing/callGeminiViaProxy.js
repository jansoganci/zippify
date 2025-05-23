/**
 * Helper function to call the Google Gemini 2.0 Flash API for image editing via Cloudflare Worker proxy
 * This function sends a base64 image and a prompt to the Gemini API through a proxy
 * and receives both text and image responses
 */

// Import prompt modules
import { basePrompt } from './prompts/basePrompt.js';
import { categoryPrompts } from './prompts/categoryPrompts.js';

// Import logger
import log from '../../../utils/logger.js';

// Import prompt enhancement
import { enhanceImagePrompt } from '../promptEnhancement/enhancePrompt.js';

// Import retry logic
import { retryWithBackoff } from '../utils/retryLogic.js';

// Import image caching
import { generateImageHash, getImageCache, setImageCache } from '../utils/imageCache.js';

// Import Sharp for image processing (optional)
let sharp;
try {
  sharp = require('sharp');
  console.log('Sharp image processing library loaded successfully');
} catch (err) {
  console.warn('Sharp image processing library not available:', err.message);
  console.warn('Image processing features will be limited');
  sharp = null;
}

/**
 * Calls the Gemini 2.0 Flash API with an image and prompt via proxy
 * @param {string} base64Data - Base64-encoded image data (without data:image prefix)
 * @param {string} mimeType - MIME type of the image (e.g., 'image/jpeg', 'image/png')
 * @param {string} prompt - Text prompt describing the desired image operation
 * @param {Object} options - Optional parameters for image processing
 * @param {string} options.category - Product category for specialized prompts (e.g., 'jewelry', 'clothing')
 * @param {string} options.platform - Target platform (e.g., 'etsy', 'amazon')
 * @param {Object} options.generationOptions - Optional Gemini API generation parameters
 * @param {number} options.generationOptions.temperature - Controls randomness (0.0-1.0)
 * @param {number} options.generationOptions.topP - Token selection probability (0.0-1.0)
 * @param {number} options.generationOptions.topK - Number of tokens to consider (1-100)
 * @param {number} options.generationOptions.maxOutputTokens - Maximum output length
 * @param {number} options.generationOptions.seed - Optional seed for reproducible results
 * @param {number} options.outputWidth - Width of the output image (default: 1200)
 * @param {number} options.outputHeight - Height of the output image (default: 1200)
 * @param {string} options.outputFormat - Format of the output image (default: 'png')
 * @param {number} options.outputQuality - Quality of the output image (default: 90)
 * @param {boolean} options.useCache - Whether to use image caching (default: true)
 * @returns {Promise<object>} - Object with success status, image data, and response text
 */
export async function callGeminiViaProxy(base64Data, mimeType, prompt, options = {}) {
  try {
    // Extract options with defaults
    const { 
      category = 'general', 
      platform = 'ecommerce',
      generationOptions = {},
      useCache = true
    } = options;
    
    // Generate a unique hash for this image+prompt combination for caching
    const imageDataUrl = `data:${mimeType};base64,${base64Data}`;
    const cacheHash = generateImageHash(imageDataUrl, prompt);
    
    // Check if we have a cached result for this image+prompt
    if (useCache) {
      log.info(`Checking cache for image+prompt hash: ${cacheHash.substring(0, 8)}...`);
      const cachedImage = await getImageCache(cacheHash);
      if (cachedImage) {
        log.info(`✅ Cache hit! Using cached image result`);
        return {
          success: true,
          image: cachedImage,
          responseText: "Image retrieved from cache",
          cached: true
        };
      }
      log.info(`❌ Cache miss. Proceeding with API call`);
    }
    
    // Enhance the prompt using DeepSeek AI
    log.info(`Enhancing prompt: "${prompt.substring(0, 30)}${prompt.length > 30 ? '...' : ''}"`);
    const enhancementResult = await enhanceImagePrompt(prompt, {
      requestId: `gemini-${Date.now()}`,
      category,
      platform
    });
    
    // Use the enhanced prompt if available, otherwise use the original
    const finalPrompt = enhancementResult.enhanced ? enhancementResult.prompt : prompt;
    log.info(`${enhancementResult.enhanced ? '✅ Enhanced' : '⚠️ Original'} prompt: "${finalPrompt.substring(0, 50)}${finalPrompt.length > 50 ? '...' : ''}"`);
    
    // Get the category-specific prompt or use the base prompt
    const categoryPrompt = categoryPrompts[category] || basePrompt;
    
    // Define the fallback prompt for when the primary attempt fails
    const fallbackPrompt = `Enhance this product image with professional lighting and clean background. Maintain the product's original details and colors while improving overall image quality.\n\nEdit this image by: ${finalPrompt}`;
    
    // Combine the category prompt with the enhanced user prompt
    const systemPrompt = `${categoryPrompt}\n\nEdit this image by: ${finalPrompt}`;
    
    // Log which category is being used (if any)
    if (category && categoryPrompts[category]) {
      log.info(`Using category-specific prompt for: ${category}`);
    } else if (category) {
      log.info(`Category '${category}' not found in categoryPrompts, using base prompt only`);
    }
    
    // Get generation parameters with fallbacks: parameter → env variable → hardcoded default (same as in callGeminiApi.js)
    const temperature = generationOptions.temperature !== undefined ? 
      generationOptions.temperature : 
      (process.env.GEMINI_TEMP !== undefined ? parseFloat(process.env.GEMINI_TEMP) : 0.2);
      
    const topP = generationOptions.topP !== undefined ? 
      generationOptions.topP : 
      (process.env.GEMINI_TOP_P !== undefined ? parseFloat(process.env.GEMINI_TOP_P) : 0.9);
      
    const topK = generationOptions.topK !== undefined ? 
      generationOptions.topK : 
      (process.env.GEMINI_TOP_K !== undefined ? parseInt(process.env.GEMINI_TOP_K) : 64);
      
    const maxOutputTokens = generationOptions.maxOutputTokens !== undefined ? 
      generationOptions.maxOutputTokens : 
      (process.env.GEMINI_MAX_TOKENS !== undefined ? parseInt(process.env.GEMINI_MAX_TOKENS) : 4096);
    
    // Check for seed parameter (for reproducible results)
    let seed = undefined;
    if (generationOptions.seed !== undefined) {
      seed = parseInt(generationOptions.seed);
      console.log(`Using seed=${seed} for reproducible results`);
    }
    
    // Log the generation parameters being used
    log.info(`Gemini generation parameters: temperature=${temperature}, topP=${topP}, topK=${topK}, maxOutputTokens=${maxOutputTokens}${seed !== undefined ? `, seed=${seed}` : ''}`);
    
    // Log request details before making the API call
    log.info("\n=== Gemini Proxy Request ===\n" +
      `User Prompt: "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"\n` +
      `Category: ${category}\n` +
      `System Prompt: "${systemPrompt.substring(0, 100)}${systemPrompt.length > 100 ? '...' : ''}"\n` +
      `Image Size: ${base64Data.length.toLocaleString()} bytes\n` +
      `MIME Type: ${mimeType}\n` +
      `Parameters: temperature=${temperature}, topP=${topP}, topK=${topK}, maxOutputTokens=${maxOutputTokens}${seed !== undefined ? `, seed=${seed}` : ''}\n` +
      `Timestamp: ${new Date().toISOString()}\n`);
    
    // Prepare the request body according to Gemini API format
    const requestBody = {
      contents: [
        {
          parts: [
            { text: systemPrompt },
            {
              inline_data: {
                data: base64Data,
                mime_type: mimeType
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature,
        topP,
        topK,
        maxOutputTokens,
        responseModalities: ["text", "image"],
        ...(seed !== undefined ? { seed } : {})
      }
    };

    log.info(`Sending request to Gemini API proxy at ${new Date().toISOString()}...`);

    // Use the model name from environment variable or default
    // Standardize model name to match the one in callGeminiApi.js
    const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash-exp-image-generation";
    const proxyUrl = `https://proxy.listify.digital/v1beta/models/${modelName}:generateContent`;
    
    log.info(`Using Gemini model: ${modelName}`);
    log.info(`Proxy URL: ${proxyUrl}`);

    // Define the API call function for retry logic
    let jsonResponse = null;
    let generatedImage = null;
    
    try {
      // Wrap the API call in retryWithBackoff
      jsonResponse = await retryWithBackoff(async () => {
        log.info(`Executing Gemini API call via proxy at ${new Date().toISOString()}...`);
        
        const response = await fetch(proxyUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requestBody)
        });
        
        log.info(`Received response from Gemini API proxy at ${new Date().toISOString()}`);
        
        // Check if the response is OK
        if (!response.ok) {
          const errorText = await response.text();
          log.error("\n=== Gemini Proxy Error ===\n" +
            `Status: ${response.status} ${response.statusText}\n` +
            `Message: ${errorText}\n` +
            `Timestamp: ${new Date().toISOString()}\n`);
          
          // Throw specific error types for retry logic
          if (response.status === 429) {
            throw new Error(`Rate limit exceeded (429): ${errorText}`);
          } else if (response.status === 500) {
            throw new Error(`Server error (500): ${errorText}`);
          } else if (response.status === 403) {
            throw new Error(`Permission denied (403): ${errorText}`);
          } else {
            throw new Error(`Proxy request failed with status ${response.status}: ${errorText}`);
          }
        }
        
        // Parse the JSON response
        const jsonResponse = await response.json();
        
        // Log the successful response
        log.info("\n=== Gemini Proxy Response ===\n" +
          `Status: Success (${response.status})\n` +
          `Has Candidates: ${jsonResponse.candidates ? jsonResponse.candidates.length : 0}\n` +
          `Response Size: ${JSON.stringify(jsonResponse).length.toLocaleString()} bytes\n` +
          `Used System Prompt: ${systemPrompt.substring(0, 50)}...\n` +
          `Used Parameters: temperature=${temperature}, topP=${topP}, topK=${topK}\n` +
          `Timestamp: ${new Date().toISOString()}\n`);
        
        return jsonResponse;
      }, 2, 1000); // 2 retries, 1 second initial delay
    } catch (retryError) {
      log.error("All retry attempts failed:", retryError.message);
      log.info("Attempting fallback approach with simplified prompt...");
      
      try {
        // Create a fallback request with simplified prompt
        const fallbackRequestBody = {
          contents: [
            {
              parts: [
                { text: fallbackPrompt },
                {
                  inline_data: {
                    data: base64Data,
                    mime_type: mimeType
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2, // Lower temperature for more predictable results
            topP: 0.95,
            topK: 64,
            maxOutputTokens: 4096,
            responseModalities: ["text", "image"]
          }
        };
        
        log.info("Executing fallback Gemini API call via proxy...");
        log.info(`Fallback prompt used: "${fallbackPrompt.substring(0, 100)}${fallbackPrompt.length > 100 ? '...' : ''}"`);
        
        
        const fallbackResponse = await fetch(proxyUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(fallbackRequestBody)
        });
        
        if (!fallbackResponse.ok) {
          throw new Error(`Fallback request failed with status ${fallbackResponse.status}`);
        }
        
        jsonResponse = await fallbackResponse.json();
        log.info("🔍 Gemini fallback response completed");
      } catch (fallbackError) {
        log.error("Fallback attempt also failed:", fallbackError.message);
        throw new Error(`All attempts failed: ${retryError.message} and fallback: ${fallbackError.message}`);
      }
    }

    // Artık bu noktada jsonResponse değişkeni dolu olmalı
    // Eğer jsonResponse hala null ise, bir hata oluştu demektir
    if (!jsonResponse) {
      throw new Error('Failed to get a valid response from Gemini API');
    }
    
    // Log the successful response
    log.info("\n=== Gemini Proxy Response ===\n" +
      `Status: Success\n` +
      `Has Candidates: ${jsonResponse.candidates ? jsonResponse.candidates.length : 0}\n` +
      `Response Size: ${JSON.stringify(jsonResponse).length.toLocaleString()} bytes\n` +
      `Used System Prompt: ${systemPrompt.substring(0, 50)}...\n` +
      `Used Parameters: temperature=${temperature}, topP=${topP}, topK=${topK}\n` +
      `Timestamp: ${new Date().toISOString()}\n`);
    
    // Log the full response structure (but not the full base64 data)
    const logSafeResponse = JSON.parse(JSON.stringify(jsonResponse));
    if (logSafeResponse.candidates && logSafeResponse.candidates.length > 0) {
      logSafeResponse.candidates.forEach(candidate => {
        if (candidate.content && candidate.content.parts) {
          candidate.content.parts.forEach(part => {
            if (part.inlineData && part.inlineData.data) {
              part.inlineData.data = `[BASE64_DATA_LENGTH: ${part.inlineData.data.length} chars]`;
            }
          });
        }
      });
    }
    log.info("Response Structure:");
    log.info(JSON.stringify(logSafeResponse, null, 2));

    // Extract the generated image from the response
    if (jsonResponse.candidates && jsonResponse.candidates.length > 0) {
      const candidate = jsonResponse.candidates[0];
      if (candidate.content && candidate.content.parts) {
        // Find any part that has image data
        for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.data && part.inlineData.mimeType) {
            log.info(`Found image data in response with MIME type: ${part.inlineData.mimeType}`);
            // Create a complete data URL
            generatedImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            break;
          }
        }
      }
    }
    
    // Extract text response if any
    let responseText = "";
    if (jsonResponse.candidates && jsonResponse.candidates.length > 0) {
      const candidate = jsonResponse.candidates[0];
      if (candidate.content && candidate.content.parts) {
        // Find any part that has text
        for (const part of candidate.content.parts) {
          if (part.text) {
            responseText += part.text;
          }
        }
      }
    }
    
    // Check if we got an image
    if (!generatedImage) {
      log.warn("No image found in the Gemini API response");
      return {
        success: false,
        image: null,
        responseText: responseText || "No image generated",
        message: "Failed to generate image. Please try again with a different prompt."
      };
    }
    
    log.info(`Successfully extracted image from response (${generatedImage.length} bytes)`);
    
    // Process the generated image with Sharp if available
    if (generatedImage) {
      let processedImage = generatedImage;
      try {
        // Extract default values from options or use defaults
        const {
          outputWidth = 1200,
          outputHeight = 1200,
          outputFormat = 'png',
          outputQuality = 90
        } = options;
        
        // Only process with Sharp if the library is available
        if (sharp) {
          log.info(`Processing image with Sharp: ${outputWidth}x${outputHeight}, format: ${outputFormat}, quality: ${outputQuality}`);
          
          // Extract base64 data and mime type from the data URL
          const imageMatches = generatedImage.match(/^data:([^;]+);base64,(.+)$/);
          if (imageMatches && imageMatches.length === 3) {
            const imageMimeType = imageMatches[1];
            const imageData = imageMatches[2];
            
            // Create a buffer from the base64 data
            const buffer = Buffer.from(imageData, 'base64');
            
            // Process the image with Sharp
            let sharpImage = sharp(buffer);
            
            // Check image metadata for quality validation
            const metadata = await sharpImage.metadata();
            log.info(`Image metadata: width=${metadata.width}, height=${metadata.height}, format=${metadata.format}`);
            
            // Validate image quality - width must be at least 500px
            if (metadata.width < 500) {
              log.warn(`Very low quality image detected: width=${metadata.width}, format=${metadata.format}`);
              throw new Error("Very low quality output, retrying...");
            }
            
            // Resize the image if needed
            if (outputWidth || outputHeight) {
              sharpImage = sharpImage.resize({
                width: outputWidth,
                height: outputHeight,
                fit: 'inside',
                withoutEnlargement: true
              });
            }
            
            // Set the output format and quality
            if (outputFormat === 'jpeg' || outputFormat === 'jpg') {
              sharpImage = sharpImage.jpeg({ quality: outputQuality });
            } else if (outputFormat === 'webp') {
              sharpImage = sharpImage.webp({ quality: outputQuality });
            } else {
              // Default to PNG
              sharpImage = sharpImage.png({ quality: Math.min(9, Math.floor(outputQuality / 10)) });
            }
            
            // Convert to buffer and then to base64
            const processedBuffer = await sharpImage.toBuffer();
            const processedBase64 = processedBuffer.toString('base64');
            
            // Create a new data URL with the processed image
            const outputMimeType = outputFormat === 'jpg' ? 'image/jpeg' : `image/${outputFormat}`;
            processedImage = `data:${outputMimeType};base64,${processedBase64}`;
            
            log.info(`Image successfully processed with Sharp: ${processedImage.length} bytes`);
          } else {
            log.warn("Could not extract image data from data URL, using original image");
          }
        } else {
          log.info("Sharp library not available, using original image");
        }
        
        // Cache the processed image for future use if caching is enabled
        if (useCache) {
          log.info(`Caching processed image with hash: ${cacheHash.substring(0, 8)}...`);
          await setImageCache(cacheHash, processedImage);
        }
        
        // Return the successful result
        return {
          success: true,
          image: processedImage,
          responseText: responseText || "Image processed successfully",
          cached: false
        };
      } catch (processingError) {
        log.error("Error processing image with Sharp:", processingError.message);
        
        // If Sharp processing fails, return the original image
        if (useCache) {
          log.info(`Caching original image with hash: ${cacheHash.substring(0, 8)}...`);
          await setImageCache(cacheHash, generatedImage);
        }
        
        return {
          success: true,
          image: generatedImage,
          responseText: responseText || "Image generated (processing failed)",
          processingError: processingError.message,
          cached: false
        };
      }
    }
  } catch (error) {
    log.error("Error calling Gemini API via proxy:", error.message);
    log.error(error.stack);
    
    // Return a standardized error response
    return {
      success: false,
      image: null,
      responseText: null,
      message: `Image editing service error: ${error.message}`,
      error: error.message
    };
  }
}
