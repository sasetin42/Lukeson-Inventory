import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { cn } from '@/lib/utils';
import { ArrowUp } from 'lucide-react';

type KpiCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend: string;
  color: 'blue' | 'green' | 'yellow' | 'purple';
} & React.HTMLAttributes<HTMLDivElement>;

const colorClasses = {
  blue: 'border-l-blue-500 text-blue-500',
  green: 'border-l-green-500 text-green-500',
  yellow: 'border-l-yellow-500 text-yellow-500',
  purple: 'border-l-purple-500 text-purple-500',
};

const iconColorClasses = {
  blue: 'text-blue-500',
  green: 'text-green-500',
  yellow: 'text-yellow-500',
  purple: 'text-purple-500',
}

export default function KpiCard({ title, value, icon: Icon, trend, color, className, ...props }: KpiCardProps) {
  return (
    <Card className={cn('border-l-4', colorClasses[color], className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={cn('h-5 w-5', iconColorClasses[color])} />
      </CardHeader>
      <CardContent>
        <div className={cn("text-3xl font-bold", color === 'yellow' ? 'text-yellow-600' : 'text-foreground')}>
          {value}
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <ArrowUp className={cn("h-4 w-4", trend.startsWith('+') ? 'text-green-500' : 'text-red-500')} />
          {trend}
        </p>
      </CardContent>
    </Card>
  );
}
