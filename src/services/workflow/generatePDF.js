import { makeCompletion } from './apiClient.js';
import { jsPDF } from 'jspdf';
import { marked } from 'marked';

const SYSTEM_PROMPT = `You are a document formatting expert. Format the knitting pattern into a well-structured, PDF-ready format with proper sections, headings, and layout instructions.

Required Sections:
1. Title and Pattern Information
2. Materials and Tools Needed
3. Skill Level and Time Required
4. Abbreviations Used
5. Pattern Instructions (clearly numbered)
6. Notes and Tips
7. Copyright Information`;

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
    const markdownContent = await makeCompletion(SYSTEM_PROMPT, userPrompt);

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
