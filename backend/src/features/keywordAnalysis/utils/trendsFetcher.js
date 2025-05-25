import googleTrends from "google-trends-api";

// basit in‑memory cache
const cache = {};

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
    console.warn('[TrendsFetcher] Telegram credentials not configured - skipping alert');
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
      console.log(`[TrendsFetcher] Telegram alert sent successfully for: ${context}`);
    } else {
      console.error(`[TrendsFetcher] Failed to send Telegram alert: ${response.status}`);
    }
  } catch (telegramError) {
    console.error(`[TrendsFetcher] Error sending Telegram notification:`, telegramError.message);
  }
}

/**
 * getTrends(keyword, geo = "US") → { popularity, relatedQueries[] }
 * - 3 retry (1 s → 2 s → 4 s)
 * - 24 saat cache
 */
export async function getTrends(keyword, geo = "US") {
  const key = `${keyword}_${geo}`;
  const now = Date.now();

  if (cache[key]?.expiresAt > now) return cache[key].data;

  const RETRIES = 3;
  let err;
  for (let i = 0; i < RETRIES; i++) {
    try {
      const [interest] = await googleTrends.interestOverTime({
        keyword,
        geo,
        hl: "en-US",
        timezone: 0,
        granularTimeResolution: true,
        headers: {
          'User-Agent': getBrowserUserAgent()
        }
      });
      const popularity =
        interest.timelineData?.at(-1)?.value?.[0] ?? null;

      // Wait before making second API call to prevent rate limiting
      const delay = getRandomDelay();
      console.log(`[TrendsFetcher] Waiting ${delay}ms before fetching related queries for "${keyword}"...`);
      await sleep(delay);

      const [related] = await googleTrends.relatedQueries({
        keyword,
        geo,
        hl: "en-US",
        headers: {
          'User-Agent': getBrowserUserAgent()
        }
      });
      const relatedQueries =
        related.default?.rankedList?.[0]?.rankedKeyword?.map((k) => ({
          query: k.query,
          value: k.value,
        })) ?? [];

      const data = { popularity, relatedQueries };
      cache[key] = { data, expiresAt: now + 24 * 60 * 60 * 1000 };
      return data;
    } catch (e) {
      err = e;
      console.warn(`Google Trends API retry ${i+1}/${RETRIES} failed: ${e.message}`);
      await new Promise((r) => setTimeout(r, 1000 * 2 ** i));
    }
  }
  
  // Tüm denemeler başarısız olursa, boş bir sonuç yerine temel veriler döndürelim
  console.error(`All ${RETRIES} attempts to Google Trends API failed. Using fallback data.`);
  
  // Send Telegram alert for total failure after all retries
  await sendTelegramAlert(
    `All ${RETRIES} retry attempts failed. Last error: ${err?.message || 'Unknown error'}`,
    `getTrends - Keyword: "${keyword}", Geo: "${geo}"`
  );
  
  return {
    popularity: 50,
    relatedQueries: [
      { query: `${keyword} online`, value: 70 },
      { query: `best ${keyword}`, value: 60 },
      { query: `handmade ${keyword}`, value: 50 }
    ]
  };
}
