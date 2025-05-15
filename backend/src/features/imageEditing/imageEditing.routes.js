import express from 'express';
import multer from 'multer';
import { callGeminiApi } from '../../services/imageEditing/callGeminiApi.js';
import { verifyToken } from '../../../middleware/auth.js';
import checkQuota from '../../../middleware/checkQuota.js';
import incrementQuota from '../../../utils/incrementQuota.js';

// Initialize multer for memory storage (no disk storage)
const upload = multer();

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
router.post('/edit-image', verifyToken, checkQuota("edit-image"), upload.single('image'), async (req, res) => {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Image editing request received`);
  const { image, prompt, category, platform, featureKey, generationOptions, outputOptions } = req.body;
  
  console.log(`Request details: prompt length=${prompt?.length || 0}, hasImage=${!!image}, category=${category || 'none'}, platform=${platform || 'none'}`);
  try {
    const result = await callGeminiApi(image, prompt, {
      category,
      platform,
      featureKey,
      generationOptions,
      outputOptions
    });
    
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

export default router;

