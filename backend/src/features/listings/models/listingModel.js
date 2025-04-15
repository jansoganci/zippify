import dbPromise from '../../../../db.js';

export async function saveListing(userId, listingData) {
  const db = await dbPromise;
  
  const tags = JSON.stringify(listingData.tags);
  const altTexts = JSON.stringify(listingData.alt_texts);
  
  // Create an ISO timestamp for the created_at field
  const createdAt = new Date().toISOString();
  
  const result = await db.run(
    `INSERT INTO listings 
     (user_id, title, description, tags, alt_texts, original_prompt, platform, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      listingData.title,
      listingData.description,
      tags,
      altTexts,
      listingData.original_prompt,
      listingData.platform || 'etsy',
      createdAt
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
