import express from 'express';
import * as listingService from '../services/listingService.js';
import verifyToken from '../../../../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  const userId = req.user.id;
  console.log("📥 [listings] Fetching listings for user:", userId);
  
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await listingService.getListings(userId, page, limit);
    console.log("📤 [listings] Found:", result.listings.length, "items for user:", userId);
    return res.json({ data: result });
  } catch (error) {
    console.error("❌ [listings] Failed to fetch listings:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  const listingId = req.params.id;
  const userId = req.user.id;
  
  console.log(`📥 [listings] Fetching listing id: ${listingId} for user: ${userId}`);
  
  try {
    // Ensure listingId is properly formatted
    const listing = await listingService.getListing(listingId, userId);
    
    if (!listing) {
      console.log(`❌ [listings] Listing not found: id=${listingId}, user=${userId}`);
      return res.status(404).json({ 
        error: 'Listing not found',
        message: `No listing found with id: ${listingId}`
      });
    }
    
    console.log(`📤 [listings] Found listing: ${listing.title} (id: ${listingId})`);
    return res.json({ 
      data: { 
        listing: listing 
      }
    });
  } catch (error) {
    console.error(`❌ [listings] Error fetching listing ${listingId}:`, error.message);
    if (error.message === 'Listing not found') {
      return res.status(404).json({ error: 'Listing not found' });
    }
    return res.status(500).json({ error: error.message });
  }
});

export default router;
