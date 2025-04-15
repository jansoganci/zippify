
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/DashboardLayout';
import { Tag, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '@/services/api/apiClient';

interface Listing {
  id: string;
  title: string;
  createdAt: Date;
  description: string;
  tags: string[];
  altTexts?: string[];
  originalPrompt?: string;
}

const ListingDetailPage = () => {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) {
        setError('Listing ID not found');
        setLoading(false);
        return;
      }

      try {
        // Use type assertion to handle the API client method
        const response = await (api as any).getListing(id);
        
        if (import.meta.env.DEV) {
          console.log(`[ListingDetail] Response for listing ${id}:`, {
            hasData: !!response?.data,
            hasListing: !!response?.data?.listing
          });
        }
        
        if (response?.data?.listing) {
          // Convert createdAt string to Date object
          const listingData = response.data.listing;
          
          if (import.meta.env.DEV) {
            console.log('[ListingDetail] Raw listing data:', {
              hasAltTexts: 'alt_texts' in listingData,
              hasOriginalPrompt: 'original_prompt' in listingData,
              altTextsType: listingData.alt_texts ? typeof listingData.alt_texts : 'undefined',
              isAltTextsArray: Array.isArray(listingData.alt_texts)
            });
          }
          
          const createdAt = listingData.created_at ? new Date(listingData.created_at) : new Date();
          
          // Ensure valid date
          const validCreatedAt = !isNaN(createdAt.getTime()) ? createdAt : new Date();
          
          // Transform snake_case to camelCase for frontend use
          setListing({
            id: listingData.id,
            title: listingData.title,
            description: listingData.description,
            createdAt: validCreatedAt,
            // Ensure tags is an array
            tags: Array.isArray(listingData.tags) ? listingData.tags : [],
            // Transform alt_texts (snake_case) to altTexts (camelCase)
            altTexts: Array.isArray(listingData.alt_texts) ? listingData.alt_texts : [],
            // Transform original_prompt (snake_case) to originalPrompt (camelCase)
            originalPrompt: listingData.original_prompt || ''
          });
        } else {
          setError('Listing not found');
        }
      } catch (err) {
        setError('Failed to load listing details');
        console.error('Error fetching listing:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  return (
    <DashboardLayout>
      <div className="py-8 px-4 max-w-4xl mx-auto">
        <div className="mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        
        {error && (
          <Card className="bg-destructive/10 border-destructive">
            <CardContent className="p-6">
              <p className="text-destructive font-medium">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => navigate('/listings')}
              >
                Return to Listings
              </Button>
            </CardContent>
          </Card>
        )}
        
        {!loading && !error && listing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{listing.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Created on {format(listing.createdAt, 'MMMM d, yyyy')}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Description Section */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">{listing.description}</p>
            </div>
            
            {/* Tags Section */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {listing.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Alt Texts Section */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Alt Texts</h2>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                {listing.altTexts.map((text, index) => (
                  <li key={index}>{text}</li>
                ))}
              </ul>
            </div>
            
            {/* Original Prompt Section */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Original Prompt</h2>
              <Card className="bg-muted">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">{listing.originalPrompt}</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ListingDetailPage;