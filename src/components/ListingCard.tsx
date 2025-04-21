
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tag, Clock } from 'lucide-react';

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
  const displayTags = tags.slice(0, 5);
  const remainingTags = tags.length - 5;

  return (
    <Card 
      onClick={() => onListingClick?.()}
      className="hover:shadow-md hover:border-primary/20 transition-all duration-300 cursor-pointer"
    >
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-2 line-clamp-1">{title}</h3>
        
        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <Clock className="w-4 h-4 mr-1" />
          {formatDistanceToNow(createdAt, { addSuffix: true })}
        </div>
        
        <p className="text-muted-foreground mb-4 line-clamp-2">{description}</p>
        
        <div className="flex flex-wrap gap-2">
          {displayTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1"
            >
              <Tag className="w-3 h-3" />
              {tag}
            </Badge>
          ))}
          {remainingTags > 0 && (
            <Badge variant="outline">+{remainingTags} more</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ListingCard;
