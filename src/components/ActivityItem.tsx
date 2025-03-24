
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

type ActivityStatus = 'completed' | 'in-progress' | 'created';

type ActivityItemProps = {
  title: string;
  time: string;
  status: ActivityStatus;
};

const getStatusStyles = (status: ActivityStatus): string => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'in-progress':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'created':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
};

const getStatusLabel = (status: ActivityStatus): string => {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'in-progress':
      return 'In Progress';
    case 'created':
      return 'Created';
    default:
      return 'Unknown';
  }
};

const ActivityItem = ({ title, time, status }: ActivityItemProps) => {
  return (
    <div className="flex items-center justify-between py-3 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-primary"></div>
        <span className="font-medium">{title}</span>
      </div>
      
      <div className="flex items-center gap-3">
        <span className={cn(
          'px-2 py-1 text-xs font-medium rounded-full',
          getStatusStyles(status)
        )}>
          {getStatusLabel(status)}
        </span>
        
        <div className="flex items-center text-muted-foreground text-sm">
          <Clock size={14} className="mr-1" />
          {time}
        </div>
      </div>
    </div>
  );
};

export default ActivityItem;
