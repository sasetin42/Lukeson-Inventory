
import { Plus, Repeat, ShoppingCart, Bell, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type ActionCardProps = {
  title: string;
  description: string;
  href: string;
  icon: 'plus' | 'repeat' | 'cart' | 'alert';
  color?: 'blue' | 'green' | 'purple' | 'red';
};

const iconMap = {
  plus: Plus,
  repeat: Repeat,
  cart: ShoppingCart,
  alert: Bell,
};

const colorClasses = {
  blue: {
    background: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/50 dark:hover:bg-blue-900',
    icon: 'text-blue-500',
  },
  green: {
    background: 'bg-green-50 hover:bg-green-100 dark:bg-green-900/50 dark:hover:bg-green-900',
    icon: 'text-green-500',
  },
  purple: {
    background: 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/50 dark:hover:bg-purple-900',
    icon: 'text-purple-500',
  },
    red: {
    background: 'bg-red-50 hover:bg-red-100 dark:bg-red-900/50 dark:hover:bg-red-900',
    icon: 'text-red-500',
  },
};


export default function ActionCard({ title, description, href, icon, color = 'blue' }: ActionCardProps) {
  const Icon = iconMap[icon];
  const classes = colorClasses[color];

  return (
    <Card className={cn("transition-all", classes.background)}>
        <Link href={href} className="block h-full">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-base font-bold">{title}</CardTitle>
                        <CardDescription className="text-sm">{description}</CardDescription>
                    </div>
                    <div className={cn("p-2 rounded-full", classes.icon, 'bg-white')}>
                        <Icon className="h-5 w-5" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center text-sm font-semibold text-primary">
                    <Zap className="h-4 w-4 mr-2" />
                    Click to {title.split(' ')[0].toLowerCase()}
                </div>
            </CardContent>
        </Link>
    </Card>
  );
}
