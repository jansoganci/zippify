
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type ProblemSolutionCardProps = {
  title: string;
  problem: string;
  solution: string;
  icon: LucideIcon;
  delay?: number;
};

export const ProblemSolutionCard = ({ 
  title, 
  problem, 
  solution, 
  icon: Icon,
  delay = 0 
}: ProblemSolutionCardProps) => {
  return (
    <Card className="h-full border-none shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all duration-200 hover:-translate-y-1 dark:bg-[#1E293B] dark:border dark:border-white/5 dark:hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
      <CardContent className="p-6 space-y-4">
        <div className="w-10 h-10 rounded-lg bg-[#E0E7FF] dark:bg-[#433C5A] flex items-center justify-center text-[#4338CA] dark:text-[#EDE9EB]">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-xl font-bold text-[#1F2937] dark:text-[#EDE9EB]">{title}</h3>
        <div className="space-y-3">
          <div className="flex items-start group">
            <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/20 mr-2 mt-1 flex items-center justify-center group-hover:scale-110 transition-transform">
              <X className="w-4 h-4 text-red-500 dark:text-[#EF4444]" />
            </div>
            <p className="text-[#4B5563] dark:text-[#9CA3AF] text-sm">{problem}</p>
          </div>
          <div className="flex items-start group">
            <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/20 mr-2 mt-1 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Check className="w-4 h-4 text-green-500 dark:text-[#10B981]" />
            </div>
            <p className="text-[#111827] dark:text-[#F9FAFB] text-sm">{solution}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

