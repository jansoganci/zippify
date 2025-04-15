import * as listingModel from '../models/listingModel.js';

export async function saveListing(userId, listingData) {
  try {
    if (!listingData.title || !listingData.description || 
        !Array.isArray(listingData.tags) || !Array.isArray(listingData.alt_texts)) {
      throw new Error('Invalid listing data');
    }
    
    console.log("🧪 [listingService] Saving listing with data:", listingData);
    
    const result = await listingModel.saveListing(userId, listingData);
    console.log("✅ [listingService] Listing saved successfully with title:", listingData.title);
    
    return result;
  } catch (error) {
    console.error("❌ [listingService] Failed to save listing to DB. Reason:", error.message);
    throw error;
  }
}

export async function getListings(userId, page, limit) {
  try {
    const listings = await listingModel.getListingsByUserId(userId, page, limit);
    const total = await listingModel.getTotalListingsCount(userId);
    
    return {
      listings,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('[ListingService] Error getting listings:', error);
    throw error;
  }
}

export async function getListing(id, userId) {
  try {
    const listing = await listingModel.getListingById(id, userId);
    
    if (!listing) {
      throw new Error('Listing not found');
    }
    
    return listing;
  } catch (error) {
    console.error('[ListingService] Error getting listing:', error);
    throw error;
  }
}
