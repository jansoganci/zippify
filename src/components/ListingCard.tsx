import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, ArrowRight } from 'lucide-react';

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
      className="overflow-hidden group hover:shadow-lg dark:hover:shadow-primary/10 transition-all duration-300 border-muted/40 dark:border-muted/20 h-full flex flex-col cursor-pointer"
      onClick={handleClick}
    >
      <CardContent className="p-6 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="text-base font-semibold line-clamp-2 group-hover:text-primary transition-colors mb-4">
          {title}
        </h3>
        
        {/* Description with better spacing */}
        <p className="text-muted-foreground mb-4 line-clamp-2 text-sm leading-relaxed">
          {description}
        </p>
        
        {/* Tags with horizontal layout - improved for modern look */}
        <div className="flex flex-wrap gap-2 mb-3">
          {displayTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs py-1.5 px-3 bg-secondary/60 dark:bg-secondary/40 hover:bg-secondary/80 transition-colors border-0"
            >
              {tag}
            </Badge>
          ))}
          {remainingTags > 0 && (
            <Badge 
              variant="outline" 
              className="text-xs py-1.5 px-3 border-muted/40 dark:border-muted/20 text-muted-foreground"
            >
              +{remainingTags} more
            </Badge>
          )}
        </div>
        
        {/* Date - small and subtle */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground/70 mt-auto">
          <Clock className="w-3 h-3" />
          {formattedDate}
        </div>
      </CardContent>
      
      {/* Footer with subtle action indicator */}
      <CardFooter className="px-6 py-4 bg-muted/3 dark:bg-muted/5 border-t-2 border-primary/20 dark:border-primary/30">
        <div className="w-full flex items-center justify-between text-sm text-muted-foreground group-hover:text-foreground transition-colors">
          <span className="font-medium">View Details</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </CardFooter>
    </Card>
  );
};

export default ListingCard;
