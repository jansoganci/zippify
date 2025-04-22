import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tag, Clock, ArrowRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ListingCardProps {
  id: string;
  title: string;
  createdAt: Date;
  description: string;
  tags: string[];
  onListingClick?: () => void;
}

const ListingCard = ({
  id,
  title,
  createdAt,
  description,
  tags,
  onListingClick,
}: ListingCardProps) => {
  const navigate = useNavigate();
  const displayTags = tags.slice(0, 3);
  const remainingTags = tags.length - 3;
  
  const handleClick = () => {
    if (onListingClick) {
      onListingClick();
    } else {
      navigate(`/listings/${id}`);
    }
  };

  // Format date for better display
  const formattedDate = formatDistanceToNow(createdAt, { addSuffix: true });
  
  return (
    <Card 
      className="overflow-hidden group hover:shadow-lg dark:hover:shadow-primary/10 transition-all duration-300 border-muted/40 dark:border-muted/20 h-full flex flex-col"
    >
      {/* Card header with gradient accent */}
      <div className="h-2 bg-gradient-to-r from-primary to-primary/60 dark:from-primary dark:to-primary/40"></div>
      
      <CardContent className="p-5 flex-1 flex flex-col">
        {/* Date badge */}
        <div className="flex justify-between items-center mb-3">
          <Badge variant="outline" className="flex items-center gap-1 px-2 py-1 text-xs font-normal text-muted-foreground border-muted/30 dark:border-muted/10">
            <Calendar className="w-3 h-3" />
            {formattedDate}
          </Badge>
        </div>
        
        {/* Title with hover effect */}
        <h3 className="text-lg font-semibold mb-3 line-clamp-1 group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        {/* Description with proper spacing */}
        <p className="text-muted-foreground mb-4 line-clamp-2 text-sm">
          {description}
        </p>
        
        {/* Tags with improved styling */}
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {displayTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1 text-xs py-1 px-2 bg-secondary/50 dark:bg-secondary/30"
            >
              <Tag className="w-3 h-3" />
              {tag}
            </Badge>
          ))}
          {remainingTags > 0 && (
            <Badge 
              variant="outline" 
              className="text-xs py-1 px-2 border-muted/30 dark:border-muted/10"
            >
              +{remainingTags} more
            </Badge>
          )}
        </div>
      </CardContent>
      
      {/* Card Footer with View Details button */}
      <CardFooter className="px-5 py-3 bg-muted/5 dark:bg-muted/10 border-t border-muted/10 dark:border-muted/20">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-between hover:bg-background dark:hover:bg-background/10 text-sm font-medium"
          onClick={handleClick}
        >
          View Details
          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ListingCard;
