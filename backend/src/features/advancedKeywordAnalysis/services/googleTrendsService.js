/**
 * Google Trends Service
 * Provides advanced keyword analysis using Google Trends API with caching and rate limiting
 */
import googleTrends from 'google-trends-api-429-fix';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

/**
 * Initialize the database connection
 * @returns {Promise<sqlite3.Database>} Database connection
 */
async function getDb() {
  return open({
    filename: './db/zippify.db',
    driver: sqlite3.Database
  });
}

/**
 * User plan limits configuration
 */
const PLAN_LIMITS = {
  free: 10,
  premium: 100  // Premium same as pro
};

/**
 * Cache expiration time (24 hours in milliseconds)
 */
const CACHE_EXPIRATION_HOURS = 24;
const CACHE_EXPIRATION_MS = CACHE_EXPIRATION_HOURS * 60 * 60 * 1000;

/**
 * API timeout configuration (10 seconds)
 */
const API_TIMEOUT = 10000;

/**
 * Sleep function to add delays between Google Trends API requests
 * Helps prevent rate limiting and IP blocking by making requests more human-like
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate random delay between 2-3 seconds to mimic human behavior
 * @returns {number} Random delay in milliseconds
 */
function getRandomDelay() {
  return Math.floor(Math.random() * 1000) + 2000; // 2000-3000ms
}

/**
 * Get realistic browser User-Agent to avoid bot detection
 * @returns {string} Realistic Chrome User-Agent string
 */
function getBrowserUserAgent() {
  return "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
}

/**
 * Send critical error notification to Telegram
 * @param {string} errorMessage - Error message to send
 * @param {string} context - Context information (function name, keyword, etc.)
 */
async function sendTelegramAlert(errorMessage, context = '') {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
  
  // Skip if environment variables are not set
  if (!TELEGRAM_BOT_TOKEN || !CHAT_ID) {
    console.warn('[GoogleTrends] Telegram credentials not configured - skipping alert');
    return;
  }
  
  try {
    const message = `🚨 *Google Trends API Error*\n\n` +
                   `*Context:* ${context}\n` +
                   `*Error:* ${errorMessage}\n` +
                   `*Time:* ${new Date().toISOString()}\n` +
                   `*Server:* ${process.env.NODE_ENV || 'unknown'}`;

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    if (response.ok) {
      console.log(`[GoogleTrends] Telegram alert sent successfully for: ${context}`);
    } else {
      console.error(`[GoogleTrends] Failed to send Telegram alert: ${response.status}`);
    }
  } catch (telegramError) {
    console.error(`[GoogleTrends] Error sending Telegram notification:`, telegramError.message);
  }
}

/**
 * Request queue to manage rate limiting
 */
class RequestQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.activeRequests = 0;
    this.maxConcurrentRequests = 3;
  }

  async add(requestFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ requestFn, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.processing || this.activeRequests >= this.maxConcurrentRequests) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0 && this.activeRequests < this.maxConcurrentRequests) {
      const { requestFn, resolve, reject } = this.queue.shift();
      this.activeRequests++;

      requestFn()
        .then(resolve)
        .catch(reject)
        .finally(() => {
          this.activeRequests--;
          this.processQueue();
        });
    }

    this.processing = false;
  }
}

const requestQueue = new RequestQueue();

/**
 * Check if user has exceeded their daily quota
 * @param {number} userId - User ID
 * @param {string} userPlan - User's subscription plan
 * @returns {Promise<{allowed: boolean, currentUsage: number, limit: number}>}
 */
export async function checkUserQuota(userId, userPlan) {
  const db = await getDb();
  const today = new Date().toISOString().split('T')[0];
  const limit = PLAN_LIMITS[userPlan] || PLAN_LIMITS.free;

  try {
    const result = await db.get(
      'SELECT request_count FROM user_quota WHERE user_id = ? AND feature = ? AND date = ?',
      [userId, 'advanced_keywords', today]
    );

    const currentUsage = result ? result.request_count : 0;
    
    return {
      allowed: currentUsage < limit,
      currentUsage,
      limit
    };
  } catch (error) {
    console.error('[GoogleTrends] Error checking user quota:', error);
    return { allowed: false, currentUsage: 0, limit };
  } finally {
    await db.close();
  }
}

/**
 * Update user quota after successful request
 * @param {number} userId - User ID
 */
export async function updateUserQuota(userId) {
  const db = await getDb();
  const today = new Date().toISOString().split('T')[0];

  try {
    const existing = await db.get(
      'SELECT id, request_count FROM user_quota WHERE user_id = ? AND feature = ? AND date = ?',
      [userId, 'advanced_keywords', today]
    );

    if (existing) {
      await db.run(
        'UPDATE user_quota SET request_count = request_count + 1 WHERE id = ?',
        [existing.id]
      );
    } else {
      await db.run(
        'INSERT INTO user_quota (user_id, feature, date, request_count) VALUES (?, ?, ?, 1)',
        [userId, 'advanced_keywords', today]
      );
    }

    console.log(`[GoogleTrends] Updated quota for user ${userId}`);
  } catch (error) {
    console.error('[GoogleTrends] Error updating user quota:', error);
  } finally {
    await db.close();
  }
}

/**
 * Get cached trend data for a keyword
 * @param {string} keyword - The keyword to search for
 * @returns {Promise<Object|null>} Cached data or null if not found/expired
 */
export async function getCachedTrendData(keyword) {
  const db = await getDb();
  
  try {
    const cached = await db.get(
      'SELECT * FROM google_trends_cache WHERE keyword = ? AND expires_at > datetime("now")',
      [keyword.toLowerCase()]
    );

    if (cached) {
      console.log(`[GoogleTrends] Cache hit for keyword: ${keyword}`);
      return {
        trendData: JSON.parse(cached.trend_data),
        relatedQueries: cached.related_queries ? JSON.parse(cached.related_queries) : null,
        relatedTopics: cached.related_topics ? JSON.parse(cached.related_topics) : null,
        geographicData: cached.geographic_data ? JSON.parse(cached.geographic_data) : null,
        fromCache: true
      };
    }

    console.log(`[GoogleTrends] Cache miss for keyword: ${keyword}`);
    return null;
  } catch (error) {
    console.error('[GoogleTrends] Error reading cache:', error);
    return null;
  } finally {
    await db.close();
  }
}

/**
 * Cache trend data for a keyword
 * @param {string} keyword - The keyword
 * @param {Object} data - The trend data to cache
 */
export async function cacheTrendData(keyword, data) {
  const db = await getDb();
  const expiresAt = new Date(Date.now() + CACHE_EXPIRATION_MS).toISOString();

  try {
    await db.run(
      `INSERT OR REPLACE INTO google_trends_cache 
       (keyword, trend_data, related_queries, related_topics, geographic_data, expires_at) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        keyword.toLowerCase(),
        JSON.stringify(data.trendData),
        data.relatedQueries ? JSON.stringify(data.relatedQueries) : null,
        data.relatedTopics ? JSON.stringify(data.relatedTopics) : null,
        data.geographicData ? JSON.stringify(data.geographicData) : null,
        expiresAt
      ]
    );

    console.log(`[GoogleTrends] Cached data for keyword: ${keyword}`);
  } catch (error) {
    console.error('[GoogleTrends] Error caching data:', error);
  } finally {
    await db.close();
  }
}

/**
 * Clean up expired cache entries
 */
export async function cleanupExpiredCache() {
  const db = await getDb();

  try {
    const result = await db.run(
      'DELETE FROM google_trends_cache WHERE expires_at < datetime("now")'
    );
    
    if (result.changes > 0) {
      console.log(`[GoogleTrends] Cleaned up ${result.changes} expired cache entries`);
    }
  } catch (error) {
    console.error('[GoogleTrends] Error cleaning up cache:', error);
  } finally {
    await db.close();
  }
}

/**
 * Fetch trend data with better error handling and retry logic
 * @param {string} keyword - The keyword to search for
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Trend data
 */
async function fetchTrendDataWithTimeout(keyword, options = {}) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('API request timeout')), API_TIMEOUT);
  });

  const requestPromise = requestQueue.add(async () => {
    try {
      console.log(`[GoogleTrends] Starting API request for keyword: ${keyword}`);
      
      // Interest over time (main trend data)
      const interestOverTime = await googleTrends.interestOverTime({
        keyword,
        startTime: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // Last year
        geo: options.geo || 'US',
        headers: {
          'User-Agent': getBrowserUserAgent()
        }
      });

      // Check if response is valid JSON or HTML error
      let parsedTrends;
      try {
        parsedTrends = JSON.parse(interestOverTime);
      } catch (parseError) {
        console.error(`[GoogleTrends] Invalid response format for ${keyword}:`, parseError.message);
        
        // Check if it's an HTML response (indicates blocking/captcha)
        if (interestOverTime.includes('<html') || interestOverTime.includes('<!DOCTYPE')) {
          throw new Error('Google Trends API returned HTML (possible blocking/captcha). Try again later.');
        }
        
        throw new Error(`Invalid API response format: ${parseError.message}`);
      }

      // Validate that we have valid trend data
      if (!parsedTrends || !parsedTrends.default || !parsedTrends.default.timelineData) {
        console.warn(`[GoogleTrends] No valid trend data for keyword: ${keyword}`);
        // Return minimal valid structure for fallback
        return {
          trendData: {
            default: {
              term: keyword,
              timelineData: [
                {
                  formattedTime: new Date().toISOString().split('T')[0],
                  value: [1],
                  formattedAxisTime: 'Current'
                }
              ]
            }
          },
          relatedQueries: null,
          relatedTopics: null
        };
      }

      // Wait before making next API call to prevent rate limiting
      console.log(`[GoogleTrends] Waiting ${getRandomDelay()}ms before fetching related queries...`);
      await sleep(getRandomDelay());

      // Related queries - with fallback
      let relatedQueries = null;
      try {
        const queriesResponse = await googleTrends.relatedQueries({
          keyword,
          geo: options.geo || 'US',
          headers: {
            'User-Agent': getBrowserUserAgent()
          }
        });
        
        try {
          relatedQueries = JSON.parse(queriesResponse);
        } catch (parseError) {
          console.warn(`[GoogleTrends] Could not parse related queries for ${keyword}:`, parseError.message);
        }
      } catch (error) {
        console.warn(`[GoogleTrends] Could not fetch related queries for ${keyword}:`, error.message);
      }

      // Wait before making final API call to prevent rate limiting
      console.log(`[GoogleTrends] Waiting ${getRandomDelay()}ms before fetching related topics...`);
      await sleep(getRandomDelay());

      // Related topics - with fallback
      let relatedTopics = null;
      try {
        const topicsResponse = await googleTrends.relatedTopics({
          keyword,
          geo: options.geo || 'US',
          headers: {
            'User-Agent': getBrowserUserAgent()
          }
        });
        
        try {
          relatedTopics = JSON.parse(topicsResponse);
        } catch (parseError) {
          console.warn(`[GoogleTrends] Could not parse related topics for ${keyword}:`, parseError.message);
        }
      } catch (error) {
        console.warn(`[GoogleTrends] Could not fetch related topics for ${keyword}:`, error.message);
      }

      console.log(`[GoogleTrends] Successfully fetched data for keyword: ${keyword}`);
      
      return {
        trendData: parsedTrends,
        relatedQueries,
        relatedTopics
      };
      
    } catch (error) {
      console.error(`[GoogleTrends] API request failed for ${keyword}:`, error.message);
      
      // Send Telegram alert for critical Google Trends API failures
      await sendTelegramAlert(
        error.message,
        `fetchTrendDataWithTimeout - Keyword: "${keyword}"`
      );
      
      throw error;
    }
  });

  return Promise.race([requestPromise, timeoutPromise]);
}

/**
 * Process and normalize trend data
 * @param {Object} rawData - Raw data from Google Trends API
 * @param {string} originalKeyword - Original keyword entered by user (fallback)
 * @returns {Object} Processed trend data
 */
function processTrendData(rawData, originalKeyword = null) {
  if (!rawData.trendData || !rawData.trendData.default || !rawData.trendData.default.timelineData) {
    throw new Error('Invalid trend data format');
  }

  const timelineData = rawData.trendData.default.timelineData;
  
  // Extract and normalize trend points
  const trendPoints = timelineData.map(point => ({
    date: point.formattedTime,
    value: point.value[0] || 0,
    formattedDate: point.formattedAxisTime
  }));

  // Calculate basic statistics
  const values = trendPoints.map(p => p.value).filter(v => v > 0);
  const avgValue = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const maxValue = Math.max(...values, 0);
  const minValue = Math.min(...values, 0);

  // Extract related queries if available
  const topQueries = [];
  const risingQueries = [];

  if (rawData.relatedQueries && rawData.relatedQueries.default) {
    const queriesData = rawData.relatedQueries.default;
    
    if (queriesData.rankedList) {
      queriesData.rankedList.forEach(list => {
        if (list.rankedKeyword) {
          list.rankedKeyword.forEach(query => {
            if (list.rankedKeyword === queriesData.rankedList[0].rankedKeyword) {
              topQueries.push({
                query: query.query,
                value: query.value
              });
            } else {
              risingQueries.push({
                query: query.query,
                value: query.value
              });
            }
          });
        }
      });
    }
  }

  return {
    keyword: rawData.trendData.default.term || originalKeyword || 'Unknown',
    timelineData: trendPoints,
    statistics: {
      averageInterest: Math.round(avgValue),
      maxInterest: maxValue,
      minInterest: minValue,
      totalDataPoints: trendPoints.length,
      trend: avgValue > 50 ? 'rising' : avgValue > 20 ? 'stable' : 'declining'
    },
    relatedQueries: {
      top: topQueries.slice(0, 10),
      rising: risingQueries.slice(0, 10)
    },
    estimatedSearchVolume: calculateEstimatedVolume(avgValue),
    competitionLevel: calculateCompetitionLevel(topQueries.length, risingQueries.length, avgValue),
    lastUpdated: new Date().toISOString(),
    fromCache: rawData.fromCache || false
  };
}

/**
 * Calculate estimated search volume based on trend value
 * @param {number} trendValue - Google Trends value (0-100)
 * @returns {string} Estimated volume range
 */
function calculateEstimatedVolume(trendValue) {
  if (trendValue >= 80) return '1M+ searches/month';
  if (trendValue >= 60) return '500K-1M searches/month';
  if (trendValue >= 40) return '100K-500K searches/month';
  if (trendValue >= 20) return '10K-100K searches/month';
  if (trendValue >= 10) return '1K-10K searches/month';
  return '<1K searches/month';
}

/**
 * Calculate competition level based on related queries and average interest
 * @param {number} topQueriesCount - Number of top related queries
 * @param {number} risingQueriesCount - Number of rising related queries
 * @param {number} avgInterest - Average interest score (0-100)
 * @returns {string} Competition level
 */
function calculateCompetitionLevel(topQueriesCount, risingQueriesCount, avgInterest) {
  const totalQueries = topQueriesCount + risingQueriesCount;
  
  // If we have enough related queries data, use that primarily
  if (totalQueries >= 15) return 'High';
  if (totalQueries >= 8) return 'Medium';
  if (totalQueries >= 3) return 'Low';
  
  // If related queries are missing or insufficient, use average interest as fallback
  // High interest keywords are typically more competitive
  if (avgInterest >= 70) return 'High';
  if (avgInterest >= 50) return 'Medium';
  if (avgInterest >= 25) return 'Low';
  return 'Very Low';
}

/**
 * Main function to get advanced keyword analysis
 * @param {string} keyword - The keyword to analyze
 * @param {number} userId - User ID for quota checking
 * @param {string} userPlan - User's subscription plan
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Advanced keyword analysis
 */
export async function getAdvancedKeywordAnalysis(keyword, userId, userPlan, options = {}) {
  // Input validation
  if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
    throw new Error('Invalid keyword provided');
  }

  if (!userId || !userPlan) {
    throw new Error('User ID and plan are required');
  }

  const cleanKeyword = keyword.trim().toLowerCase();
  
  if (cleanKeyword.length > 100) {
    throw new Error('Keyword is too long (max 100 characters)');
  }

  // Check user quota
  const quotaCheck = await checkUserQuota(userId, userPlan);
  if (!quotaCheck.allowed) {
    throw new Error(`Daily quota exceeded. You have used ${quotaCheck.currentUsage}/${quotaCheck.limit} requests today.`);
  }

  try {
    // Check cache first
    let cachedData = await getCachedTrendData(cleanKeyword);
    
    if (cachedData) {
      return processTrendData(cachedData, cleanKeyword);
    }

    // Fetch from Google Trends API
    console.log(`[GoogleTrends] Fetching data for keyword: ${cleanKeyword}`);
    const rawData = await fetchTrendDataWithTimeout(cleanKeyword, options);

    // Cache the result
    await cacheTrendData(cleanKeyword, rawData);

    // Update user quota
    await updateUserQuota(userId);

    // Process and return the data
    return processTrendData(rawData, cleanKeyword);

  } catch (error) {
    console.error(`[GoogleTrends] Error analyzing keyword "${cleanKeyword}":`, error);
    
    // Send Telegram alert for critical errors (but not for quota/blocking issues)
    if (!error.message.includes('quota') && !error.message.includes('Daily quota exceeded')) {
      await sendTelegramAlert(
        error.message,
        `getAdvancedKeywordAnalysis - Keyword: "${cleanKeyword}", User: ${userId}`
      );
    }
    
    // Handle Google Trends API blocking/captcha (HTML response)
    if (error.message.includes('HTML') || error.message.includes('blocking') || error.message.includes('captcha')) {
      // Return fallback data instead of failing
      console.warn(`[GoogleTrends] API blocked, returning fallback data for: ${cleanKeyword}`);
      return createFallbackData(cleanKeyword);
    }
    
    // Provide specific error messages
    if (error.message.includes('timeout')) {
      throw new Error('Request timeout - Google Trends API is taking too long to respond');
    }
    
    if (error.message.includes('quota')) {
      throw error; // Re-throw quota errors as-is
    }
    
    if (error.message.includes('429')) {
      throw new Error('Rate limit exceeded - please try again later');
    }
    
    if (error.message.includes('Invalid API response format')) {
      // Return fallback data for parsing errors too
      console.warn(`[GoogleTrends] Invalid response format, returning fallback data for: ${cleanKeyword}`);
      return createFallbackData(cleanKeyword);
    }

    throw new Error(`Failed to analyze keyword: ${error.message}`);
  }
}

/**
 * Create fallback data when Google Trends API fails
 * @param {string} keyword - The keyword
 * @returns {Object} Fallback analysis data
 */
function createFallbackData(keyword) {
  const currentDate = new Date().toISOString().split('T')[0];
  
  return {
    keyword,
    timelineData: [
      {
        date: currentDate,
        value: 50, // Moderate baseline value
        formattedDate: 'Current'
      }
    ],
    statistics: {
      averageInterest: 50,
      maxInterest: 50,
      minInterest: 50,
      totalDataPoints: 1,
      trend: 'stable'
    },
    relatedQueries: {
      top: [],
      rising: []
    },
    estimatedSearchVolume: '10K-100K searches/month',
    competitionLevel: 'Medium',
    lastUpdated: new Date().toISOString(),
    fromCache: false,
    isFallback: true,
    fallbackReason: 'Google Trends API temporarily unavailable'
  };
}

/**
 * Get multiple keywords analysis (batch processing)
 * @param {string[]} keywords - Array of keywords to analyze
 * @param {number} userId - User ID
 * @param {string} userPlan - User's subscription plan
 * @param {Object} options - Additional options
 * @returns {Promise<Object[]>} Array of keyword analyses
 */
export async function getBatchKeywordAnalysis(keywords, userId, userPlan, options = {}) {
  if (!Array.isArray(keywords) || keywords.length === 0) {
    throw new Error('Invalid keywords array provided');
  }

  if (keywords.length > 10) {
    throw new Error('Maximum 10 keywords allowed per batch request');
  }

  // Check if user has enough quota for all keywords
  const quotaCheck = await checkUserQuota(userId, userPlan);
  if (quotaCheck.currentUsage + keywords.length > quotaCheck.limit) {
    throw new Error(`Not enough quota for batch request. You need ${keywords.length} requests but only have ${quotaCheck.limit - quotaCheck.currentUsage} remaining today.`);
  }

  const results = [];
  const errors = [];

  for (let i = 0; i < keywords.length; i++) {
    const keyword = keywords[i];
    
    // Add delay between batch requests to prevent rate limiting (except for first request)
    if (i > 0) {
      const delay = getRandomDelay();
      console.log(`[GoogleTrends] Batch processing - waiting ${delay}ms before analyzing "${keyword}"...`);
      await sleep(delay);
    }
    
    try {
      const analysis = await getAdvancedKeywordAnalysis(keyword, userId, userPlan, options);
      results.push(analysis);
    } catch (error) {
      errors.push({
        keyword,
        error: error.message
      });
    }
  }

  return {
    successful: results,
    errors,
    totalRequested: keywords.length,
    totalSuccessful: results.length,
    totalErrors: errors.length
  };
}

// Schedule cleanup every hour
setInterval(cleanupExpiredCache, 60 * 60 * 1000);

console.log('[GoogleTrends] Service initialized with cache cleanup scheduled every hour'); 