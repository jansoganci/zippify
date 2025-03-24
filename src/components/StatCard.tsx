
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type StatCardProps = {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  className?: string;
};

const StatCard = ({ title, value, icon, trend, className }: StatCardProps) => {
  return (
    <div className={cn("stat-card", className)}>
      <div className="flex justify-between items-start">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className="p-2 rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center">
          <span className={cn(
            "text-xs font-medium mr-1",
            trend.positive ? "text-green-600" : "text-red-600"
          )}>
            {trend.positive ? "+" : ""}{trend.value}%
          </span>
          <span className="text-xs text-muted-foreground">{trend.label}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
