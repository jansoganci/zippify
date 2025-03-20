import { makeCompletion } from './apiClient.js';

const SYSTEM_PROMPT = `You are an Etsy listing optimization expert. Create SEO-optimized listings that follow Etsy's best practices for titles, tags, and descriptions.

Required Format:
Title: [The optimized title]

Description:
[The full description with sections]

Tags:
[Comma-separated list of SEO-optimized tags]

Materials:
[List of required materials]

Price:
[Suggested price in USD]`;

/**
 * Helper function to parse the AI-generated listing into structured data
 * 
 * @param {string} listing - Raw listing text from AI
 * @returns {Object} Structured listing data
 */
const parseListing = (listing) => {
  try {
    // If listing is already an object (e.g., from mock data), validate and return it
    if (typeof listing === 'object' && listing !== null) {
      const { title, description, tags } = listing;
      if (title && description && Array.isArray(tags)) {
        return {
          ...listing,
          metadata: {
            timestamp: new Date().toISOString(),
            step: 'etsy_listing'
          }
        };
      }
    }

    // If listing is a string, parse it
    if (typeof listing === 'string') {
      const result = {
        title: '',
        description: '',
        tags: [],
        price: null,
        materials: [],
        metadata: {
          timestamp: new Date().toISOString(),
          step: 'etsy_listing'
        }
      };

      const sections = listing.split('\n\n');
      sections.forEach(section => {
        if (section.startsWith('Title:')) {
          result.title = section.replace('Title:', '').trim();
        } else if (section.startsWith('Description:')) {
          result.description = section.replace('Description:', '').trim();
        } else if (section.startsWith('Tags:')) {
          result.tags = section
            .replace('Tags:', '')
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);
        } else if (section.startsWith('Materials:')) {
          result.materials = section
            .replace('Materials:', '')
            .split('\n')
            .map(material => material.trim())
            .filter(material => material.length > 0);
        } else if (section.startsWith('Price:')) {
          const priceMatch = section.match(/\$\d+(\.\d{2})?/);
          if (priceMatch) {
            result.price = parseFloat(priceMatch[0].replace('$', ''));
          }
        }
      });

      return result;
    }

    throw new Error('Invalid listing format');
  } catch (error) {
    console.error('Listing Parse Error:', error.message);
    return {
      error: 'Failed to parse listing',
      raw: listing
    };
  }
};

/**
 * Step 3: Creates an Etsy-optimized listing from the pattern
 * 
 * @param {Object} input - Input from previous step
 * @param {string} input.pdfContent - The PDF-formatted content
 * @param {Object} options - Additional options
 * @param {string} options.title - Optional title override
 * @param {string[]} options.tags - Optional tags to include
 * @returns {Promise<Object>} - Etsy listing content or error
 */
export const generateEtsyListing = async (input, options = {}) => {
  try {
    const pattern = input?.optimizedPattern || input?.pdfContent;
    if (!pattern) {
      throw new Error('Pattern content is required');
    }

    const userPrompt = `Create an Etsy listing for this knitting pattern:

Title: ${options.title || 'Knitting Pattern'}

Pattern:
${pattern}

Additional Tags: ${options.tags?.join(', ') || ''}`;

    const listing = await makeCompletion(SYSTEM_PROMPT, userPrompt);
    const parsedListing = parseListing(listing);

    return {
      success: true,
      ...parsedListing
    };

  } catch (error) {
    console.error('Etsy Listing Generation Error:', error.message);
    return {
      success: false,
      title: options?.title || "Error",
      description: 'An error occurred while generating the listing.',
      error: error.message
    };
  }
};
