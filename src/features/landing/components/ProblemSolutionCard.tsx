
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
    <Card className="h-full border-none shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-xl transition-all duration-300 hover:-translate-y-2 dark:bg-[#1E293B] dark:border dark:border-white/5 dark:hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] bg-gradient-to-b from-white to-gray-50/80 dark:from-[#1E293B] dark:to-[#1E293B]/90 overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-in-out origin-left"></div>
      <CardContent className="p-8 space-y-5">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/40 dark:from-primary/30 dark:to-primary/10 flex items-center justify-center text-primary shadow-sm">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-[#1F2937] dark:text-[#EDE9EB] group-hover:text-primary transition-colors duration-300">{title}</h3>
        <div className="space-y-4">
          <div className="flex items-start group/item">
            <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/20 mr-3 mt-0.5 flex items-center justify-center group-hover/item:scale-110 group-hover:bg-red-200 dark:group-hover:bg-red-900/30 transition-all duration-300 shadow-sm">
              <X className="w-4 h-4 text-red-500 dark:text-[#EF4444]" />
            </div>
            <p className="text-[#4B5563] dark:text-[#9CA3AF] text-base leading-relaxed">{problem}</p>
          </div>
          <div className="flex items-start group/item pt-1">
            <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/20 mr-3 mt-0.5 flex items-center justify-center group-hover/item:scale-110 group-hover:bg-green-200 dark:group-hover:bg-green-900/30 transition-all duration-300 shadow-sm">
              <Check className="w-4 h-4 text-green-500 dark:text-[#10B981]" />
            </div>
            <p className="text-[#111827] dark:text-[#F9FAFB] text-base font-medium leading-relaxed">{solution}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

