import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

type KpiCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: 'blue' | 'green' | 'yellow' | 'purple' | 'red' | 'indigo' | 'cyan' | 'orange' | 'pink' | 'teal';
  subtext?: string;
  tooltipText?: string;
} & React.HTMLAttributes<HTMLDivElement>;

const colorClasses = {
  blue: 'text-blue-500',
  green: 'text-green-500',
  yellow: 'text-yellow-500',
  purple: 'text-purple-500',
  red: 'text-red-500',
  indigo: 'text-indigo-500',
  cyan: 'text-cyan-500',
  orange: 'text-orange-500',
  pink: 'text-pink-500',
  teal: 'text-teal-500'
};

export default function KpiCard({ title, value, icon: Icon, trend, color = 'blue', subtext, tooltipText, className, ...props }: KpiCardProps) {
  const isPositive = trend && !trend.startsWith('-');
  const TrendIcon = isPositive ? ArrowUp : ArrowDown;
  
  return (
    <Card className={cn('border-0 shadow-sm', className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground whitespace-nowrap flex items-center gap-1">
            {title}
            {tooltipText && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{tooltipText}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </CardTitle>
        <Icon className={cn('h-5 w-5', colorClasses[color])} />
      </CardHeader>
      <CardContent>
        <div className={cn("text-3xl font-bold", color === 'yellow' ? 'text-yellow-600' : 'text-foreground')}>
          {value}
        </div>
        {trend && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <TrendIcon className={cn("h-4 w-4", isPositive ? 'text-green-500' : 'text-red-500')} />
            {trend}
          </p>
        )}
        {subtext && (
            <p className="text-xs text-muted-foreground">{subtext}</p>
        )}
      </CardContent>
    </Card>
  );
}
