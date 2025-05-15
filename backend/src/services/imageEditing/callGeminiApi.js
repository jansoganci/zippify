/**
 * Helper function to call the Google Gemini 2.0 Flash API for image editing
 * This function sends a base64 image and a prompt to the Gemini API
 * and receives both text and image responses
 * Uses the official @google/generative-ai SDK
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Import Sharp for image processing
import sharp from 'sharp';

// Import prompt modules
import { basePrompt } from './prompts/basePrompt.js';
import { categoryPrompts } from './prompts/categoryPrompts.js';

// Import utility functions
import { retryWithBackoff } from '../utils/retryLogic.js';
import { generateImageHash, getImageCache, setImageCache } from '../utils/imageCache.js';

// Import prompt enhancement
import { enhanceImagePrompt } from '../promptEnhancement/enhancePrompt.js';

/**
 * Calls the Gemini 2.0 Flash API with an image and prompt
 * @param {string} imageBase64 - Base64-encoded image string (with or without data:image prefix)
 * @param {string} prompt - Text prompt describing the desired image operation
 * @param {Object} options - Optional parameters for image processing
 * @param {number} options.outputWidth - Width of the output image (default: 1200)
 * @param {number} options.outputHeight - Height of the output image (default: 1200)
 * @param {string} options.outputFormat - Format of the output image: 'png', 'jpeg', 'webp' (default: 'png')
 * @param {number} options.outputQuality - Quality of the output image, 1-100 (default: 90)
 * @param {string} options.category - Product category for specialized prompts (e.g., 'jewelry', 'clothing')
 * @param {Object} options.generationOptions - Optional Gemini API generation parameters
 * @param {number} options.generationOptions.temperature - Controls randomness (0.0-1.0)
 * @param {number} options.generationOptions.topP - Token selection probability (0.0-1.0)
 * @param {number} options.generationOptions.topK - Number of tokens to consider (1-100)
 * @param {number} options.generationOptions.maxOutputTokens - Maximum output length
 * @param {number} options.generationOptions.seed - Optional seed for reproducible results
 * @returns {Promise<object>} - Object containing success status, generated image, text response, and message
 */
export async function callGeminiApi(imageBase64, prompt, options = {}) {
  try {
    // Generate a unique hash for this image+prompt combination
    const cacheHash = generateImageHash(imageBase64, prompt);
    
    // Check if we have a cached result for this hash
    const cachedImage = await getImageCache(cacheHash);
    if (cachedImage) {
      console.log("✅ Cache hit: Returning image from cache");
      return {
        success: true,
        image: cachedImage,
        responseText: "Image retrieved from cache",
        message: "Image edit retrieved from cache.",
        cached: true
      };
    }
    
    console.log("🆕 Cache miss: Calling Gemini API");
    // Check if API key is available
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }
    
    // Extract category and platform from options for prompt enhancement
    const { category = 'general', platform = 'ecommerce' } = options;
    
    // Initialize variables for prompt enhancement
    let enhancedPrompt = null;
    let enhanced = false;
    let finalPrompt = prompt;
    
    // Try to enhance the prompt, but don't fail if enhancement fails
    try {
      // Enhance the prompt using DeepSeek AI
      console.log(`Enhancing prompt: "${prompt.substring(0, 30)}${prompt.length > 30 ? '...' : ''}"`);  
      const enhancementResult = await enhanceImagePrompt(prompt, {
        requestId: `gemini-${Date.now()}`,
        category,
        platform
      });
      
      // Extract results
      enhancedPrompt = enhancementResult.prompt;
      enhanced = enhancementResult.enhanced;
      
      // Use the enhanced prompt if available, otherwise use the original
      if (enhanced) {
        finalPrompt = enhancedPrompt;
        console.log("Using enhanced prompt for Gemini API");
        console.log("Original prompt: " + prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''));
        console.log("Enhanced prompt: " + enhancedPrompt.substring(0, 100) + (enhancedPrompt.length > 100 ? '...' : ''));
      } else {
        console.log("Enhancement did not modify the prompt or was skipped, using original prompt");
      }
    } catch (enhancementError) {
      // Log error but continue with original prompt
      console.error('Error enhancing prompt:', enhancementError);
      console.log("Using original prompt due to enhancement error");
      
      // Development-only logging of the full error stack
      if (process.env.NODE_ENV !== 'production') {
        console.error(`Prompt enhancement error details:`, {
          message: enhancementError.message,
          stack: enhancementError.stack,
          code: enhancementError.code || 'UNKNOWN_ERROR'
        });
      }
      enhancedPrompt = null;
    }

    // Extract the base64 data and determine MIME type
    let base64Data = imageBase64;
    let mimeType = 'image/jpeg'; // Default MIME type
    
    // If the image is a data URL, extract the base64 part and detect MIME type
    if (imageBase64.startsWith('data:')) {
      const matches = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        base64Data = matches[2];
      } else {
        throw new Error('Invalid data URL format');
      }
    }

    // Initialize the Google Generative AI client with the API key
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Get the model from environment variable or use default
    // For image editing tasks, we need to use a flash model that supports image generation
    const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    console.log(`Using Gemini model: ${modelName}`);
    
    // Extract generation options from options parameter or use environment variables or defaults
    const { generationOptions = {} } = options;
    
    // Get generation parameters with fallbacks: parameter → env variable → hardcoded default
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
    console.log(`Gemini generation parameters: temperature=${temperature}, topP=${topP}, topK=${topK}, maxOutputTokens=${maxOutputTokens}${seed !== undefined ? `, seed=${seed}` : ''}`);
    
    
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.0,    // Set to 0.0 to fully disable creative variation
        topP,                // Configurable topP for creative outputs
        topK,                // Configurable topK for diverse options
        maxOutputTokens,     // Configurable token limit for output length
        ...(seed !== undefined ? { seed } : {})  // Add seed if provided (for reproducible results)
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        }
      ]
    });

    // Create a more specific prompt optimized for image editing tasks
    // The specific wording here is important for getting the model to return an image
    // Get the category-specific prompt or use the base prompt
    const categoryPrompt = categoryPrompts[category] || basePrompt;
    
    // Define the fallback prompt for when the primary attempt fails
    const fallbackPrompt = `Enhance this product image with professional lighting and clean background. Maintain the product's original details and colors while improving overall image quality.\n\nEdit this image by: ${finalPrompt}`;
    
    // Combine the category prompt with the enhanced user prompt
    const systemPrompt = `${categoryPrompt}\n\nEdit this image by: ${finalPrompt}`;
    
    // Log which category is being used (if any)
    if (category && categoryPrompts[category]) {
      console.log(`Using category-specific prompt for: ${category}`);
    } else if (category) {
      console.log(`Category '${category}' not found in categoryPrompts, using base prompt only`);
    }

    // Create the content parts array with image FIRST, then text
    // For image editing tasks, presenting the image first often works better
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    };
    
    const textPart = {
      text: systemPrompt
    };
    
    // Generate content using the SDK with retry logic
    console.log("Calling Gemini API with SDK and retry logic...");
    console.log(`Fallback prompt used: "Enhance this product image with professional lighting and clean background. Maintain the product's original details and colors while improving overall image quality.

Edit this image by: ${finalPrompt}"`);
    
    // Extract responses from the Gemini API
    let responseText = '';
    let generatedImage = null;
    let response;
    
    try {
      // Wrap the API call in retryWithBackoff
      response = await retryWithBackoff(async () => {
        console.log("Executing Gemini API call...");
        const result = await model.generateContent({
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
            responseModalities: ["text", "image"]
          }
        });
        const response = result.response;
        
        // Log only essential information from the response, not the full base64 data
        console.log("🔍 Gemini API call completed", {
          status: response?.status || "OK",
          hasImage: !!response?.candidates?.[0]?.content?.parts?.some(part => part.inlineData),
          finishReason: response?.candidates?.[0]?.finishReason || "UNKNOWN"
        });
        
        // Process the response to check if it contains an image
        let hasImage = false;
        
        // Check if there's an image in the response
        if (response.candidates && response.candidates[0] && response.candidates[0].content) {
          const parts = response.candidates[0].content.parts || [];
          for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
              hasImage = true;
              break;
            }
          }
        }
        
        // If no image was found, throw an error to trigger retry
        if (!hasImage) {
          throw new Error("Gemini API response did not contain an image");
        }
        
        return response;
      }, 3, 1000);
    } catch (retryError) {
      // All retries failed, try with fallback prompt
      console.warn("All retry attempts failed. Trying fallback prompt...");
      
      try {
        // Create a new text part with the fallback prompt
        const fallbackTextPart = {
          text: fallbackPrompt
        };
        
        console.log("Executing fallback Gemini API call...");
        console.log(`Fallback prompt used: "${fallbackPrompt}"`);
        
        // Make one final attempt with the fallback prompt
        const fallbackResult = await model.generateContent({
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
          ]
        });
        response = fallbackResult.response;
        
        console.log("🔍 Gemini fallback response completed", {
          status: response?.status || "OK",
          hasImage: !!response?.candidates?.[0]?.content?.parts?.some(part => part.inlineData),
          finishReason: response?.candidates?.[0]?.finishReason || "UNKNOWN"
        });
      } catch (fallbackError) {
        console.error("Fallback attempt also failed:", fallbackError.message);
        throw new Error(`All attempts failed: ${retryError.message} and fallback: ${fallbackError.message}`);
      }
    }
    
    // Check for finish reasons that indicate errors or limitations
    if (response.promptFeedback && response.promptFeedback.blockReason) {
      console.warn("Gemini API blocked the request:", response.promptFeedback.blockReason);
      return {
        success: false,
        image: null,
        responseText: null,
        message: `The AI couldn't process this request due to content policy restrictions (${response.promptFeedback.blockReason}). Try a different prompt or image.`
      };
    }
    
    // Process the response parts
    if (response.candidates && response.candidates.length > 0) {
      console.log("Processing response from candidates...");
      const candidate = response.candidates[0];
      
      // Check for error finish reasons
      if (candidate.finishReason && candidate.finishReason !== "STOP") {
        console.warn("Gemini API returned non-STOP finish reason:", candidate.finishReason);
        return {
          success: false,
          image: null,
          responseText: null,
          message: `The AI couldn't complete this request (Reason: ${candidate.finishReason}). Try a different prompt or image.`
        };
      }
      
      // Process the parts in the candidate
      if (candidate.content && candidate.content.parts) {
        console.log("Found parts in candidate content:", candidate.content.parts.length);
        
        for (const part of candidate.content.parts) {
          // Handle text parts
          if (part.text) {
            responseText += part.text;
            console.log("Found text in candidate:", part.text.substring(0, 50) + (part.text.length > 50 ? '...' : ''));
          }
          
          // Handle image parts
          if (part.inlineData && part.inlineData.data) {
            generatedImage = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            console.log("Found image in candidate with MIME type:", part.inlineData.mimeType || 'image/png');
          }
        }
      }
    }
    
    // Check if we have a generated image
    if (!generatedImage) {
      console.warn("Gemini API did not return an image - attempting fallback approach");
      
      // Fallback: Try with a different prompt structure and text first, then image
      try {
        console.log("Attempting fallback approach with alternative prompt...");
        
        // Alternative prompt that's more direct about image generation
        const fallbackPrompt = `Enhance this product image with professional lighting and clean background. Maintain the product's original details and colors while improving overall image quality. The output MUST be an image.`;
        console.log(`Fallback prompt: "${fallbackPrompt}"`);
        
        // Keep the same ordering (text first, then image) for consistency
        const fallbackResult = await model.generateContent({
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
          ]
        });
        
        const fallbackResponse = fallbackResult.response;
        console.log("Fallback response received:", {
          status: fallbackResponse?.status || "OK",
          hasImage: !!fallbackResponse?.candidates?.[0]?.content?.parts?.some(part => part.inlineData),
          finishReason: fallbackResponse?.candidates?.[0]?.finishReason || "UNKNOWN"
        });
        
        // Check for image in fallback response
        if (fallbackResponse.candidates && 
            fallbackResponse.candidates[0] && 
            fallbackResponse.candidates[0].content && 
            fallbackResponse.candidates[0].content.parts) {
              
          for (const part of fallbackResponse.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
              generatedImage = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
              console.log("Found image in fallback response!");
              break;
            }
          }
        }
      } catch (fallbackError) {
        console.error("Fallback approach failed:", fallbackError);
      }
      
      // If still no image after fallback, return error
      if (!generatedImage) {
        console.warn("Gemini API failed to generate an image, returning error");
        return {
          success: false,
          image: null,
          responseText: "Failed to generate image",
          message: "Image editing service is currently unavailable. Please try again later."
        };
      }
    }
    
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
        
        console.log(`Processing image with Sharp: ${outputWidth}x${outputHeight}, format: ${outputFormat}, quality: ${outputQuality}`);
        
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
          console.log(`Image metadata: width=${metadata.width}, height=${metadata.height}, format=${metadata.format}`);
          
          // Validate image quality - width must be at least 500px (gevşetilmiş kriter)
          if (metadata.width < 500) {
            console.warn(`Very low quality image detected: width=${metadata.width}, format=${metadata.format}`);
            throw new Error("Very low quality output, retrying...");
          }
          // PNG format kontrolünü kaldırdık
          
          // Resize the image if dimensions are provided
          sharpImage = sharpImage.resize({
            width: outputWidth,
            height: outputHeight,
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          });
          
          // Convert to the desired format with quality settings
          if (outputFormat === 'jpeg' || outputFormat === 'jpg') {
            sharpImage = sharpImage.jpeg({ quality: outputQuality });
          } else if (outputFormat === 'webp') {
            sharpImage = sharpImage.webp({ quality: outputQuality });
          } else {
            // Default to PNG
            sharpImage = sharpImage.png({ quality: Math.min(Math.floor(outputQuality / 10), 9) });
          }
          
          // Convert the processed image back to base64
          const processedImageBuffer = await sharpImage.toBuffer();
          const processedBase64 = processedImageBuffer.toString('base64');
          
          // Create the new data URL with the appropriate MIME type
          const outputMimeType = outputFormat === 'jpg' ? 'image/jpeg' : `image/${outputFormat}`;
          generatedImage = `data:${outputMimeType};base64,${processedBase64}`;
          
          console.log('Image successfully processed with Sharp');
          processedImage = generatedImage;
        } else {
          console.warn('Could not extract base64 data from image for Sharp processing');
        }
      } catch (sharpError) {
        console.error('Error processing image with Sharp:', sharpError);
        // Continue with the original image if Sharp processing fails
        console.log('Returning original unprocessed image');
        processedImage = generatedImage;
      }
      
      // Cache the processed image for future use
      await setImageCache(cacheHash, processedImage);
      console.log("💾 Cached image after successful API response");
    }
    
    // Return the successful response with image and any text
    return {
      success: true,
      image: generatedImage,
      responseText: responseText,
      message: "Image edited successfully using Gemini API.",
      promptEnhanced: enhanced,
      enhancedPrompt: enhanced ? enhancedPrompt : null
    };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return {
      success: false,
      image: null,
      responseText: null,
      message: `Error calling Gemini API: ${error.message}`
    };
  }
}

