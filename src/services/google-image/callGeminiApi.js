/**
 * Helper function to call the Google Gemini 2.0 Flash API for image editing
 * This function sends a base64 image and a prompt to the Gemini API
 */

/**
 * Calls the Gemini 2.0 Flash API with an image and prompt
 * @param {string} imageBase64 - Base64-encoded image string (with or without data:image prefix)
 * @param {string} prompt - Text prompt describing the desired image operation
 * @returns {Promise<object>} - Raw response from the Gemini API
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

    // Construct the API endpoint URL with API key
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

    // Construct the request body according to Gemini API specifications
    const requestBody = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            },
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {}
    };

    // Make the API request
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    // Check if the response is successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    // Parse the response as JSON
    const result = await response.json();
    
    // Log the raw response for debugging
    console.log("🔍 Gemini raw response:", JSON.stringify(result, null, 2));
    
    // Return the raw response
    return result;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}
