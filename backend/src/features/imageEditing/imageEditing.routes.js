import express from 'express';
import { callGeminiApi } from '../../services/imageEditing/callGeminiApi.js';
import { verifyToken, checkQuota } from '../../../middleware/auth.js';

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
    res.json({ success: result.success, result });
  } catch (err) {
    console.error("Image editing error:", err);
    res.status(500).json({ error: "Image editing failed" });
  }
});

export default router;
