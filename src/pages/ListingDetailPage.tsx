import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/DashboardLayout';
import { Tag, ArrowLeft, Loader2, Calendar, Copy, Check, FileText, Hash, Image, MessageSquare } from 'lucide-react';
import { log, error } from '../utils/logger';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '@/services/api/apiClient';
import { toast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';

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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedSection, setCopiedSection] = React.useState<string | null>(null);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    toast({
      title: "Copied to clipboard",
      description: `${section} has been copied to your clipboard.`,
    });
    
    setTimeout(() => setCopiedSection(null), 2000);
  };

  useEffect(() => {

    const fetchListing = async () => {
      if (!id) {
        setErrorMsg('Listing ID not found');
        setLoading(false);
        return;
      }

      try {
        // Use type assertion to handle the API client method
        const response = await (api as any).getListing(id);
        
        if (import.meta.env.DEV) {
          log(`[ListingDetail] Response for listing ${id}:`, {
            hasData: !!response?.data,
            hasListing: !!response?.data?.listing
          });
        }
        
        if (response?.data?.listing) {
          // Convert createdAt string to Date object
          const listingData = response.data.listing;
          
          if (import.meta.env.DEV) {
            log('[ListingDetail] Raw listing data:', {
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
          setErrorMsg('Listing not found');
        }
      } catch (err) {
        setErrorMsg('Failed to load listing details');
        error('Error fetching listing:', err);
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
        
        {errorMsg && (
          <Card className="bg-destructive/10 border-destructive">
            <CardContent className="p-6">
              <p className="text-destructive font-medium">{errorMsg}</p>
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
        
        {!loading && !errorMsg && listing && (
        <div className="space-y-6">
          {/* Title Card */}
          <Card className="overflow-hidden border-l-4 border-l-primary">
            <CardContent className="p-0">
              <div className="flex items-start justify-between p-6 bg-muted/20">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="flex items-center gap-1 px-2 py-1 text-xs font-normal text-muted-foreground border-muted/30 dark:border-muted/10">
                      <Calendar className="w-3 h-3" />
                      {format(listing.createdAt, 'MMMM d, yyyy')}
                    </Badge>
                  </div>
                  <h1 className="text-2xl font-bold text-foreground">{listing.title}</h1>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => copyToClipboard(listing.title, 'Title')}
                  className="mt-1"
                >
                  {copiedSection === 'Title' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Description Card */}
          <Card className="overflow-hidden border-l-4 border-l-primary/80">
            <CardContent className="p-0">
              <div className="flex items-start justify-between p-4 bg-muted/20">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => copyToClipboard(listing.description, 'Description')}
                >
                  {copiedSection === 'Description' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="h-[1px] w-full bg-border" />
              <div className="p-5">
                <p className="text-foreground whitespace-pre-wrap">{listing.description}</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Tags Card */}
          <Card className="overflow-hidden border-l-4 border-l-primary/60">
            <CardContent className="p-0">
              <div className="flex items-start justify-between p-4 bg-muted/20">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium text-muted-foreground">Tags</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => copyToClipboard(listing.tags.join(', '), 'Tags')}
                >
                  {copiedSection === 'Tags' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="h-[1px] w-full bg-border" />
              <div className="p-5">
                <div className="flex flex-wrap gap-2">
                  {listing.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center gap-1 text-xs py-1 px-2 bg-secondary/50 dark:bg-secondary/30"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Alt Texts Card */}
          <Card className="overflow-hidden border-l-4 border-l-primary/40">
            <CardContent className="p-0">
              <div className="flex items-start justify-between p-4 bg-muted/20">
                <div className="flex items-center gap-2">
                  <Image className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium text-muted-foreground">Alt Texts for Images</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => copyToClipboard(listing.altTexts.join('\n\n'), 'Alt Texts')}
                >
                  {copiedSection === 'Alt Texts' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="h-[1px] w-full bg-border" />
              <div className="p-5">
                <ul className="space-y-3">
                  {listing.altTexts.map((text, index) => (
                    <li key={index} className="pl-4 border-l-2 border-muted">
                      <span className="text-xs font-medium text-muted-foreground block mb-1">Image {index + 1}</span>
                      <p className="text-foreground">{text}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
          
          {/* Original Prompt Card */}
          <Card className="overflow-hidden border-l-4 border-l-primary/20">
            <CardContent className="p-0">
              <div className="flex items-start justify-between p-4 bg-muted/20">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium text-muted-foreground">Original Prompt</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => copyToClipboard(listing.originalPrompt, 'Original Prompt')}
                >
                  {copiedSection === 'Original Prompt' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="h-[1px] w-full bg-border" />
              <div className="p-5 bg-muted/5">
                <p className="text-foreground whitespace-pre-wrap">{listing.originalPrompt}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ListingDetailPage;