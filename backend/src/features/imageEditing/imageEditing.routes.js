import express from 'express';
import { callGeminiApi } from '../../services/imageEditing/callGeminiApi.js';
import { callGeminiViaProxy } from '../../services/imageEditing/callGeminiViaProxy.js';
import { verifyToken } from '../../../middleware/auth.js';
import checkQuota from '../../../middleware/checkQuota.js';
import incrementQuota from '../../../utils/incrementQuota.js';

const router = express.Router();

/**
 * @route   GET /api/image-editing/test-image-editing
 * @desc    Test route for image editing
 * @access  Public
 */
router.get('/test-image-editing', (req, res) => {
  res.json({ message: "Image editing route works" });
});

/**
 * @route   POST /api/edit-image
 * @desc    Edit an image using Gemini API
 * @access  Private
 */
router.post('/edit-image', verifyToken, checkQuota("edit-image"), async (req, res) => {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Image editing request received`);
  const { image, prompt, category, platform, featureKey, generationOptions, outputOptions } = req.body;
  
  console.log(`Request details: prompt length=${prompt?.length || 0}, hasImage=${!!image}, category=${category || 'none'}, platform=${platform || 'none'}`);
  try {
    // Extract base64 data and mime type from the data URL
    let base64Data, mimeType;
    if (image.startsWith('data:')) {
      const matches = image.match(/^data:([^;]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        base64Data = matches[2];
      } else {
        throw new Error('Invalid data URL format');
      }
    } else {
      // Assume it's already base64 without the data URL prefix
      base64Data = image;
      mimeType = 'image/jpeg'; // Default to JPEG if not specified
    }

    console.log(`Calling Gemini API via proxy with image type: ${mimeType}`);
    
    let apiResponse;
    let usedFallback = false;
    
    try {
      // Try proxy first
      console.log('🔄 Attempting proxy API...');
      apiResponse = await callGeminiViaProxy(base64Data, mimeType, prompt);
      
      // Check if proxy response was successful
      if (!apiResponse || !apiResponse.success) {
        throw new Error(`Proxy API failed: ${apiResponse?.message || 'No successful response'}`);
      }
      
      console.log('✅ Proxy API successful');
    } catch (proxyError) {
      console.warn(`❌ Proxy failed: ${proxyError.message}`);
      console.log('🔄 Attempting fallback to direct Gemini API...');
      
      try {
        // Fallback to direct API
        usedFallback = true;
        apiResponse = await callGeminiApi(base64Data, mimeType, prompt);
        console.log('✅ Fallback to direct API successful');
      } catch (fallbackError) {
        console.error(`❌ Both proxy and direct API failed. Proxy: ${proxyError.message}, Direct: ${fallbackError.message}`);
        throw new Error(`Image processing service unavailable. Please try again later.`);
      }
    }
    
    // Process the response to maintain compatibility with existing code
    const result = processGeminiResponse(apiResponse, prompt);
    
    // Add fallback info to result
    if (usedFallback) {
      result.fallback = true;
      result.method = 'direct';
    } else {
      result.fallback = false;
      result.method = 'proxy';
    }
    
    // Başarılı işlemden sonra kotayı artır
    await incrementQuota(req.user.id, "edit-image");
    console.log(`[quota] Incremented usage for user ${req.user.id} — Feature: edit-image`);
    
    const processingTime = Date.now() - startTime;
    console.log(`Processing completed in ${processingTime}ms`);
    
    // Detaylı başarılı yanıt
    res.json({ 
      success: result.success, 
      result: {
        ...result,
        processingTime,
        imageSize: result.image ? Math.round(result.image.length / 1024) : 0,
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    // Log detailed error information
    console.error("Image editing error:", {
      message: err.message || "Unknown error",
      code: err.code || "UNKNOWN_ERROR",
      stack: err.stack,
      timestamp: new Date().toISOString(),
      requestData: {
        hasImage: !!image,
        imageSize: image ? Math.round(image.length / 1024) : 0,
        promptLength: prompt ? prompt.length : 0,
        category: category || 'not specified',
        platform: platform || 'not specified'
      }
    });
    
    // Daha detaylı hata mesajı oluştur
    const errorMessage = err.message || "Unknown error occurred";
    const errorCode = err.code || "UNKNOWN_ERROR";
    
    // Kullanıcı dostu hata mesajı
    let userFriendlyMessage = "Image editing failed";
    
    // Hata türüne göre özelleştirilmiş mesajlar
    if (errorMessage.includes("ENOTFOUND") || errorMessage.includes("fetch failed")) {
      userFriendlyMessage = "Connection error: Unable to reach image processing service. Please try again later.";
    } else if (errorMessage.includes("timeout") || errorMessage.includes("ERR_CANCELED")) {
      userFriendlyMessage = "Request timed out. Please try with a simpler prompt or try again later.";
    } else if (errorMessage.includes("Low quality")) {
      userFriendlyMessage = "Image quality issue: Please try a different image or a simpler edit request.";
    } else if (errorMessage.includes("API key")) {
      userFriendlyMessage = "Service configuration error. Please contact support.";
    } else if (errorMessage.includes("did not return an image") || errorMessage.includes("hasImage: false")) {
      userFriendlyMessage = "The AI was unable to generate an image. Please try a different prompt or image.";
    } else if (errorMessage.includes("safety") || errorMessage.includes("content policy")) {
      userFriendlyMessage = "Your request was flagged by content safety filters. Please try a different prompt or image.";
    }
    
    // Always include detailed error information in production for debugging
    res.status(500).json({ 
      success: false, 
      error: userFriendlyMessage,
      details: errorMessage, // Always include details for better debugging
      code: errorCode,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Process the raw Gemini API response into a format compatible with the existing code
 * Handles both proxy and direct API response formats
 * @param {Object} apiResponse - Raw response from the Gemini API (proxy or direct)
 * @param {string} originalPrompt - The original prompt sent to the API
 * @returns {Object} - Processed response in the format expected by the client
 */
function processGeminiResponse(apiResponse, originalPrompt) {
  console.log("Processing Gemini API response");
  
  // Initialize variables for response processing
  let responseText = "";
  let generatedImage = null;
  
  try {
    // Check if this is a direct API response (has success field)
    if (apiResponse.hasOwnProperty('success')) {
      console.log("Processing direct API response format");
      return {
        success: apiResponse.success,
        image: apiResponse.image,
        responseText: apiResponse.responseText || "Direct API response",
        message: apiResponse.message || (apiResponse.success 
          ? "Image edited successfully using direct Gemini API."
          : "Failed to generate image from direct Gemini API."),
        originalPrompt
      };
    }
    
    // Otherwise, process as proxy response format
    console.log("Processing proxy API response format");
    
    // Check if the response contains candidates
    if (apiResponse.candidates && apiResponse.candidates.length > 0) {
      const candidate = apiResponse.candidates[0];
      
      // Extract text and image from the response
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          // Extract text content
          if (part.text) {
            responseText += part.text;
          }
          
          // Extract image content
          if (part.inlineData) {
            generatedImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
      }
      
      // Check if we have an image
      if (!generatedImage) {
        console.warn("Proxy API response did not contain an image");
      }
    } else {
      console.warn("Proxy API response did not contain any candidates");
    }
    
    // Return the processed response
    return {
      success: !!generatedImage,
      image: generatedImage,
      responseText: responseText || "No text response provided",
      message: generatedImage 
        ? "Image edited successfully using Gemini API proxy."
        : "Failed to generate image from Gemini API proxy.",
      originalPrompt
    };
  } catch (error) {
    console.error("Error processing Gemini API response:", error);
    throw new Error(`Error processing Gemini API response: ${error.message}`);
  }
}

export default router;

