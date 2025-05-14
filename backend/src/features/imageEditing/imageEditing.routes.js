import express from 'express';
import { callGeminiApi } from '../../services/imageEditing/callGeminiApi.js';
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
  const { image, prompt, category, platform, featureKey, generationOptions, outputOptions } = req.body;
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
    
    res.json({ success: result.success, result });
  } catch (err) {
    console.error("Image editing error:", err);
    
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
    }
    
    res.status(500).json({ 
      success: false, 
      error: userFriendlyMessage,
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      code: errorCode
    });
  }
});

export default router;
