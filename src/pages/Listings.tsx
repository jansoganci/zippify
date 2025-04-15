
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ListingCard from '@/components/ListingCard';
import { api } from '@/services/api/apiClient';

interface RawListing {
  id: string;
  title: string;
  createdAt: string;
  description: string;
  tags: string[];
}

interface Listing {
  id: string;
  title: string;
  createdAt: Date;
  description: string;
  tags: string[];
}

const Listings = () => {
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        // Fetch listings from API
        const response = await api.getListings('current');
        
        // Extract listings from response
        let listings: RawListing[] = [];
        
        if (response && typeof response === 'object') {
          if ('data' in response && response.data && typeof response.data === 'object') {
            if ('listings' in response.data && Array.isArray(response.data.listings)) {
              listings = response.data.listings;
            }
          }
        }
        
        if (import.meta.env.DEV) {
          console.log(`[Listings] Fetched ${listings.length} items`);
        }
        // Transform listings with proper date handling
        const transformedListings = listings.map((listing) => {
          let createdAt: Date;
          
          // Handle missing or invalid createdAt
          if (!listing.createdAt || listing.createdAt === 'undefined') {
            // Only log in development, not in production
            if (import.meta.env.DEV) {
              console.warn(`[Listings] Missing createdAt for listing ${listing.id}`);
            }
            createdAt = new Date();
          } else {
            try {
              createdAt = new Date(listing.createdAt);
              // Validate date
              if (isNaN(createdAt.getTime())) {
                createdAt = new Date();
              }
            } catch {
              createdAt = new Date();
            }
          }
          
          return {
            ...listing,
            createdAt
          };
        });
        
        setListings(transformedListings);
      } catch (error) {
        // Always log errors in development, but only critical errors in production
        if (import.meta.env.DEV) {
          console.error('[Listings] Error fetching:', error);
        } else if (error instanceof Error) {
          console.error('[Listings] Failed to load listings');
        }
      }
    };

    fetchListings();
  }, []);

  // No need for additional state logging here

  return (
    <DashboardLayout>
      <div className="py-8">
        <h1 className="text-3xl font-bold mb-6">My Listings</h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              id={listing.id}
              title={listing.title}
              createdAt={listing.createdAt}
              description={listing.description}
              tags={listing.tags}
//              onClick={() => console.log('Clicked listing:', listing.id)}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Listings;