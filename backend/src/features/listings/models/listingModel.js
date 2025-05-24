import dbPromise from '../../../../db.js';

// Utility function to clean markdown syntax from AI responses
function cleanMarkdown(text) {
  if (!text || typeof text !== 'string') return text;
  return text
    .replace(/\*\*/g, '') // Remove **bold**
    .replace(/\*/g, '')   // Remove *italic*
    .replace(/✨/g, '')   // Remove sparkle emojis
    .replace(/✔/g, '•')  // Replace checkmarks with bullets
    .replace(/🌟/g, '')  // Remove star emojis
    .replace(/💡/g, '')  // Remove bulb emojis
    .replace(/🎨/g, '')  // Remove palette emojis
    .replace(/🛍️/g, '') // Remove shopping emojis
    .replace(/☀️/g, '') // Remove sun emojis
    .replace(/😎/g, '') // Remove sunglasses emojis
    .replace(/🧶/g, '') // Remove yarn emojis
    .replace(/💕/g, '') // Remove heart emojis
    .replace(/🛒/g, '') // Remove cart emojis
    .replace(/💖/g, '') // Remove sparkling heart emojis
    .trim();
}

// Clean array of strings (for alt_texts)
function cleanMarkdownArray(arr) {
  if (!Array.isArray(arr)) return arr;
  return arr.map(item => cleanMarkdown(item));
}

export async function saveListing(userId, listingData) {
  const db = await dbPromise;
  
  // Clean all text fields before saving
  const cleanTitle = cleanMarkdown(listingData.title);
  const cleanDescription = cleanMarkdown(listingData.description);
  const cleanAltTexts = cleanMarkdownArray(listingData.alt_texts);
  
  // Debug logs to verify cleanup is working
  console.log('🧹 [CLEANUP DEBUG] Original title:', listingData.title);
  console.log('🧹 [CLEANUP DEBUG] Clean title:', cleanTitle);
  console.log('🧹 [CLEANUP DEBUG] Original description length:', listingData.description?.length);
  console.log('🧹 [CLEANUP DEBUG] Clean description length:', cleanDescription?.length);
  
  const tags = JSON.stringify(listingData.tags);
  const altTexts = JSON.stringify(cleanAltTexts);
  
  const result = await db.run(
    `INSERT INTO listings 
     (user_id, title, description, tags, alt_texts, original_prompt, platform, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    [
      userId,
      cleanTitle,
      cleanDescription,
      tags,
      altTexts,
      listingData.original_prompt,
      listingData.platform || 'etsy'
    ]
  );
  
  // Return the newly created listing ID
  return result.lastID;
}

export async function getListingsByUserId(userId, page = 1, limit = 10) {
  const db = await dbPromise;
  const offset = (page - 1) * limit;
  
  const listings = await db.all(
    `SELECT * FROM listings 
     WHERE user_id = ? 
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );
  
  return listings.map(listing => ({
    ...listing,
    tags: JSON.parse(listing.tags),
    alt_texts: JSON.parse(listing.alt_texts)
  }));
}

export async function getListingById(id, userId) {
  const db = await dbPromise;
  
  const listing = await db.get(
    `SELECT * FROM listings 
     WHERE id = ? AND user_id = ?`,
    [id, userId]
  );
  
  if (!listing) return null;
  
  return {
    ...listing,
    tags: JSON.parse(listing.tags),
    alt_texts: JSON.parse(listing.alt_texts)
  };
}

export async function getTotalListingsCount(userId) {
  const db = await dbPromise;
  
  const result = await db.get(
    `SELECT COUNT(*) as count FROM listings WHERE user_id = ?`,
    [userId]
  );
  
  return result.count;
}
