/**
 * Keyword Analysis Service
 * 
 * This service handles the logic for analyzing keywords based on product names and categories.
 * Uses google-trends-api to fetch real keyword data from Google Trends.
 */

import googleTrends from 'google-trends-api';
import axios from 'axios';

/**
 * Get keyword analysis for a product
 * @param {string} productName - The product name to analyze
 * @param {string} category - Optional category to refine analysis
 * @param {string} country - Target country (default: US)
 * @param {string} platform - Target platform (default: Etsy)
 * @returns {Object} Keyword analysis data
 */
export async function getKeywordAnalysis(productName, category = null, country = 'US', platform = 'Etsy') {
  const timestamp = new Date().toISOString();
  
  // Log the request details with standardized format
  console.log(`[KeywordService][${timestamp}] REQUEST: Analyzing keywords with parameters:`, {
    product_name: productName,
    category: category || 'N/A',
    country: country,
    platform: platform
  });
  
  try {
    // Generate keyword variations based on the product name and category
    const keywordVariations = generateKeywordVariations(productName, category);
    
    // Fetch real data from Google Trends for the main keyword
    console.log(`[KeywordService][${timestamp}] PROCESS: Fetching Google Trends data for product: "${productName}"`);
    
    // Get interest over time data for the main keyword
    const interestOverTimeData = await googleTrends.interestOverTime({
      keyword: productName,
      geo: country,
      hl: 'en-US',
      timezone: 0,
      time: 'today 12-m' // Last 12 months
    });
    
    // Parse the response
    const parsedData = JSON.parse(interestOverTimeData);
    const timelineData = parsedData.default.timelineData;
    
    // Calculate average interest (popularity) for the main keyword
    let totalInterest = 0;
    timelineData.forEach(point => {
      totalInterest += point.value[0];
    });
    const avgInterest = timelineData.length > 0 ? totalInterest / timelineData.length : 0;
    
    // Get related queries for competition data
    const relatedQueriesData = await googleTrends.relatedQueries({
      keyword: productName,
      geo: country,
      hl: 'en-US'
    });
    
    const parsedRelatedData = JSON.parse(relatedQueriesData);
    const relatedQueries = parsedRelatedData.default.rankedList[0]?.rankedKeyword || [];
    
    // Process the keyword variations with Google Trends data
    const processedKeywords = await processKeywordData(keywordVariations, avgInterest, relatedQueries);
    
    // Log success with standardized format
    console.log(`[KeywordService][${timestamp}] SUCCESS: Fetched and processed ${processedKeywords.length} keywords for "${productName}"`, {
      product_name: productName,
      category: category || 'N/A',
      country: country,
      platform: platform,
      keywords_count: processedKeywords.length,
      processing_time: `${(new Date() - new Date(timestamp))}ms`
    });
    
    return {
      query: {
        product_name: productName,
        category: category || 'general',
        geo: country,
        platform: platform,
        language: 'en-US'
      },
      timestamp: timestamp,
      keywords: processedKeywords,
      message: "Keyword analysis based on Google Trends data"
    };
  } catch (error) {
    // Log error with standardized format and detailed information
    console.error(`[KeywordService][${timestamp}] ERROR: Failed to fetch from Google Trends: ${error.message}`);
    console.error(`[KeywordService][${timestamp}] ERROR_DETAILS:`, {
      error_type: error.name,
      error_message: error.message,
      stack_first_line: error.stack?.split('\n')[0] || 'No stack trace',
      input_parameters: {
        product_name: productName,
        category: category || 'N/A',
        country: country,
        platform: platform
      }
    });
    
    // Fallback to placeholder data in case of API error
    console.log(`[KeywordService][${timestamp}] FALLBACK: Using generated placeholder data instead of API results`, {
      product_name: productName,
      category: category || 'N/A',
      country: country,
      platform: platform,
      reason: error.message
    });
    
    const fallbackKeywords = generatePlaceholderData(productName, category);
    
    return {
      query: {
        product_name: productName,
        category: category || 'general',
        geo: country,
        platform: platform
      },
      timestamp: timestamp,
      keywords: fallbackKeywords,
      message: "Fallback to placeholder data due to API error: " + error.message,
      error: true
    };
  }
}

/**
 * Generate keyword variations based on product name
 * @param {string} productName - The product name to analyze
 * @param {string} category - Optional category to refine suggestions
 * @returns {Array} Array of keyword variations
 */
function generateKeywordVariations(productName, category) {
  // Split the product name into words
  const words = productName.toLowerCase().split(/\s+/);
  
  // Generate variations of the product name
  const variations = [
    productName,
    ...words,
    `best ${productName}`,
    `${productName} online`,
    `${productName} shop`,
    `handmade ${productName}`
  ];
  
  // If category is provided, add category-specific variations
  if (category) {
    variations.push(
      `${category} ${productName}`,
      `${productName} for ${category}`,
      `${category} inspired ${productName}`
    );
  }
  
  // Return unique variations
  return [...new Set(variations)];
}

/**
 * Process keyword data with Google Trends information
 * @param {Array} keywords - Array of keyword strings
 * @param {number} baseInterest - Average interest for the main keyword
 * @param {Array} relatedQueries - Related queries from Google Trends
 * @returns {Array} Processed keyword data
 */
async function processKeywordData(keywords, baseInterest, relatedQueries) {
  // Process each keyword
  return keywords.map(keyword => {
    // Calculate a competition score based on related queries
    let competition = 0.5; // Default medium competition
    
    // Check if the keyword appears in related queries
    const relatedQuery = relatedQueries.find(q => 
      q.query.toLowerCase().includes(keyword.toLowerCase()) ||
      keyword.toLowerCase().includes(q.query.toLowerCase())
    );
    
    if (relatedQuery) {
      // Higher value means more competition
      competition = Math.min(relatedQuery.value / 100, 0.99);
    }
    
    // Calculate popularity based on the main keyword's interest
    // Adjust for variations (variations typically have lower volume)
    const popularityFactor = keyword === keywords[0] ? 1 : 0.7;
    const popularity = Math.round(baseInterest * popularityFactor);
    
    return {
      keyword: keyword,
      competition: parseFloat(competition.toFixed(2)),
      popularity: popularity,
      trend: determineTrend(popularity, competition)
    };
  });
}

/**
 * Determine trend direction based on popularity and competition
 * @param {number} popularity - Keyword popularity score
 * @param {number} competition - Keyword competition score
 * @returns {string} Trend direction
 */
function determineTrend(popularity, competition) {
  if (popularity > 70 && competition < 0.5) return 'increasing';
  if (popularity < 30 || competition > 0.8) return 'decreasing';
  return 'stable';
}

/**
 * Generate placeholder data as fallback
 * @param {string} productName - The product name to analyze
 * @param {string} category - Optional category to refine suggestions
 * @returns {Array} Array of keyword objects with placeholder data
 */
function generatePlaceholderData(productName, category) {
  const variations = generateKeywordVariations(productName, category);
  
  // Create placeholder data for each keyword
  return variations.map(keyword => ({
    keyword: keyword,
    competition: parseFloat((Math.random() * 0.8 + 0.1).toFixed(2)),
    popularity: Math.floor(Math.random() * 100),
    trend: ['increasing', 'stable', 'decreasing'][Math.floor(Math.random() * 3)]
  }));
}
