import { makeCompletion, backendApi, getEnv } from './apiClient.js';
import { jsPDF } from 'jspdf';
import { marked } from 'marked';

const SYSTEM_PROMPT = `
You are a document formatting expert specialized in knitting instructions.

Your task is to format the given knitting pattern into a clean, well-structured, and PDF-compatible markdown layout that will later be converted into a downloadable knitting guide.

Tone: Friendly, instructional, and suitable for beginners and intermediate users.

Output Format: Use **markdown syntax** only. Use \`##\` for section headings, bullet points for lists, and bold formatting where appropriate. Do NOT include HTML or plain text.

Required Sections (in order):

1. ## Title and Pattern Overview
   - Introduce the pattern name and a brief summary of what the knitter will make.

2. ## Materials and Tools Needed
   - List all required yarns, needles, hooks, stitch markers, etc.

3. ## Skill Level and Time Estimate
   - Specify difficulty (e.g., Beginner, Intermediate) and estimated time to complete.

4. ## Abbreviations Used
   - Provide a bullet list of all abbreviations used in the instructions.

5. ## Pattern Instructions
   - Present clear, numbered steps for the knitting process. Break down into rows or sections.

6. ## Notes and Tips
   - Add any helpful suggestions for success or common mistakes to avoid.

7. ## Copyright & Usage
   - Include a default copyright note:  
     "This pattern is for personal use only. Redistribution or resale is not permitted."

Return the entire result as **markdown** only. Ensure formatting is clean and well spaced.
`;

/**
 * Step 2: Converts optimized pattern into PDF-compatible format
 * 
 * @param {Object} input - Input from previous step
 * @param {string} input.optimizedPattern - The optimized pattern text
 * @returns {Promise<Object>} - PDF-formatted content or error
 */
export const generatePDF = async (input) => {
  try {
    const pattern = input?.optimizedPattern;
    if (!pattern) {
      throw new Error('Optimized pattern is required');
    }

    const userPrompt = `Please format this knitting pattern for PDF generation, ensuring all required sections are included:\n\n${pattern}`;
    
    let markdownContent;
    try {
      // DeepSeek API isteği için gerekli verileri hazırla
      const requestId = `pdf-${Date.now()}`;
      const data = {
        model: getEnv('DEEPSEEK_MODEL', 'deepseek-chat'),
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: parseInt(getEnv('DEEPSEEK_MAX_TOKENS', '4096'), 10)
      };
      
      // Backend proxy'ye istek yap
      // JWT token'ı localStorage'dan al
      const token = localStorage.getItem('zippify_token');
      
      const backendResponse = await backendApi.post('/api/deepseek', data, {
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
          'Authorization': token ? `Bearer ${token}` : ''
        },
        timeout: 180000 // 3 dakika timeout
      });
      
      if (backendResponse.data?.choices?.[0]?.message?.content) {
        markdownContent = backendResponse.data.choices[0].message.content;
        console.log(`Successfully received PDF content from backend API`);
      } else {
        throw new Error('Invalid response from backend API');
      }
    } catch (backendError) {
      // Backend hata verirse, doğrudan API'yi kullanmayı dene (fallback)
      console.warn(`Backend API error, falling back to direct API call:`, backendError.message);
      markdownContent = await makeCompletion(SYSTEM_PROMPT, userPrompt);
    }

    // Convert markdown to HTML
    const htmlContent = marked(markdownContent);

    // Format content for PDF
    const formattedContent = markdownContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n\n');

    // Create PDF
    const pdf = new jsPDF();
    
    // Add content directly to PDF
    const lines = formattedContent.split('\n');
    let y = 20;
    
    // Add title
    pdf.setFontSize(16);
    pdf.text(lines[0], 20, y);
    y += 10;
    
    // Add content
    pdf.setFontSize(12);
    lines.slice(1).forEach(line => {
      if (y > 280) { // Add new page if near bottom
        pdf.addPage();
        y = 20;
      }
      pdf.text(line, 20, y);
      y += 8;
    });

    // Generate PDF URL
    const pdfUrl = URL.createObjectURL(
      new Blob([pdf.output('blob')], { type: 'application/pdf' })
    );

    return {
      success: true,
      pdfUrl,
      pdfContent: markdownContent,
      metadata: {
        format: 'pdf',
        timestamp: new Date().toISOString(),
        step: 'pdf_generation'
      }
    };

  } catch (error) {
    console.error('PDF Generation Error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};
