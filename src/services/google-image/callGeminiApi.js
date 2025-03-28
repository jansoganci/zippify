/**
 * Helper function to call the Google Gemini 2.0 Flash API for image editing
 * This function sends a base64 image and a prompt to the Gemini API
 * and receives both text and image responses
 * Uses the official @google/generative-ai SDK
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

/**
 * Calls the Gemini 2.0 Flash API with an image and prompt
 * @param {string} imageBase64 - Base64-encoded image string (with or without data:image prefix)
 * @param {string} prompt - Text prompt describing the desired image operation
 * @returns {Promise<object>} - Object containing success status, generated image, text response, and message
 */
export async function callGeminiApi(imageBase64, prompt) {
  try {
    // Check if API key is available
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
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
    
    // Get the model - using the experimental flash model that supports image generation
    // For image editing tasks, we need to use the standard flash model with responseModalities
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.2,         // Lower temperature for more predictable results
        topP: 0.7,                // Higher topP for more creative outputs
        topK: 64,                 // Higher topK for more diverse options
        maxOutputTokens: 4096,    // Higher token limit for complex image generation
        responseModalities: ["Text", "Image"] // Explicitly request both text and image responses
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
    const enhancedPrompt = `
    You are an expert image editor, specialized in e-commerce content creation, with these capabilities:
    - Background removal and replacement
    - Object isolation
    - Color correction and enhancement
    - Image cleanup and restoration
    
    IMPORTANT RULE:
    Never alter or modify the main subject (person or object) in the image **under any circumstances**, unless explicitly instructed. 
    Do NOT change the subject’s face, shape, size, color, expression, or position. Preserve it exactly as it is.
    
    When given an image and editing instructions, you will:
    1. Analyze the image carefully
    2. Apply the requested edits with precision
    3. Return ONLY the edited image as output
    4. Maintain image quality and resolution
    5. Strictly follow the instruction not to modify the subject unless clearly asked
    
    Do not explain your process or add text to the image. Focus solely on producing high-quality edited images.
    
    Edit this image by: ${prompt}
    `;

    // Create the content parts array with image FIRST, then text
    // For image editing tasks, presenting the image first often works better
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    };
    
    const textPart = {
      text: enhancedPrompt
    };
    
    // Generate content using the SDK - note the order: text first, then image (to match HTTP structure)
    console.log("Calling Gemini API with SDK...");
    console.log(`Prompt used: "${enhancedPrompt}"`); 
    
    // Try with text first, then image (to match the structure used in direct HTTP requests)
    const result = await model.generateContent([textPart, imagePart]);
    const response = result.response;
    
    // Log the raw response for debugging
    console.log("🔍 Gemini raw response:", JSON.stringify(response, null, 2));
    
    // Extract responses from the Gemini API
    let responseText = '';
    let generatedImage = null;
    
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
        const fallbackPrompt = `Generate a new version of this image with ${prompt}. The output MUST be an image.`;
        console.log(`Fallback prompt: "${fallbackPrompt}"`);
        
        // Keep the same ordering (text first, then image) for consistency
        const fallbackResult = await model.generateContent([
          { text: fallbackPrompt },
          imagePart
        ]);
        
        const fallbackResponse = fallbackResult.response;
        console.log("Fallback response received:", JSON.stringify(fallbackResponse, null, 2));
        
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
        return {
          success: !!responseText.trim(),
          image: null,
          responseText: responseText,
          message: responseText.trim() 
            ? "Gemini API returned a text response but no image."
            : "Gemini API could not generate an edited image. This may be due to limitations with the experimental model or the specific editing request. Try a simpler edit or different wording."
        };
      }
    }
    
    // Return the successful response with image and any text
    return {
      success: true,
      image: generatedImage,
      responseText: responseText,
      message: "Image edited successfully using Gemini API."
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
