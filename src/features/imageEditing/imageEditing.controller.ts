import { Request, Response } from 'express';


/**
 * Controller function for handling image editing requests
 * Processes the request, calls the Gemini API, and returns the result
 * 
 * @param req - Express request object containing image and prompt
 * @param res - Express response object
 */
export const editImageController = async (req: Request, res: Response) => {
  try {
    // Extract data from request body
    const { image, prompt, featureKey } = req.body;
    
    // Validate required fields
    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }
    
    // Get JWT token from localStorage
    const token = localStorage.getItem('zippify_token');
    
    // Call the backend API endpoint
    const response = await fetch('/api/edit-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify({
        image,
        prompt,
        featureKey
      })
    });
    
    // Parse the JSON response
    const data = await response.json();
    const result = data.result;
    
    // Return successful response
    return res.json({
      success: true,
      result,
      message: "Image edit successful using Gemini API."
    });
  } catch (error) {
    // Log the error
    console.error('Image editing error:', error);
    
    // Return error response
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred during image editing'
    });
  }
};