import express from 'express';
import { editImageWithGpt } from '../controllers/gptImageController.js';

const router = express.Router();

/**
 * @route POST /api/image/edit/gpt
 * @description Edit an image using OpenAI GPT-Image-1 API
 * @access Public (no authentication for now as per requirements)
 */
router.post('/', editImageWithGpt);

export default router;

