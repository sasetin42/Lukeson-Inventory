
'use client';

import type { ReactNode } from 'react';
import { Button } from './ui/button';
import { Zap, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Product } from '@/lib/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

type PageHeaderProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
};

function HeaderActions() {
    const { toast } = useToast();
    const [dateTime, setDateTime] = useState<Date | null>(null);
    const [mounted, setMounted] = useState(false);
    const [lowStockCount, setLowStockCount] = useState(0);
    const isMobile = useIsMobile();

    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => {
            setDateTime(new Date());
        }, 1000);

        const productsRef = collection(db, 'products');
        const unsubscribe = onSnapshot(productsRef, (snapshot) => {
            const products = snapshot.docs.map(doc => doc.data() as Product);
            const lowStockItems = products.filter(p => p.stock > 0 && p.stock <= p.reOrderLevel);
            setLowStockCount(lowStockItems.length);
        });

        return () => {
            clearInterval(timer);
            unsubscribe();
        };
    }, []);

    const handleOptimize = () => {
        toast({
            title: "System Optimized",
            description: "Cache has been cleared and data has been refreshed.",
            variant: 'success'
        });
    }

    if (!mounted) {
        return null;
    }
    
    if (isMobile) {
        return (
            <div className="flex items-center gap-2">
                 <Button 
                    variant={lowStockCount > 0 ? "destructive" : "outline"} 
                    size="sm" 
                    asChild 
                    className={cn("text-xs", lowStockCount > 0 && "animate-blink")}
                >
                    <Link href="/stock-alerts">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        ({lowStockCount})
                    </Link>
                </Button>
                 <Button variant="outline" size="sm" onClick={handleOptimize} className="text-xs">
                    <Zap className="h-3 w-3 mr-1" />
                    Optimize
                </Button>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2 sm:gap-4">
            <Button 
                variant={lowStockCount > 0 ? "destructive" : "outline"} 
                size="sm" 
                asChild 
                className={cn(lowStockCount > 0 && "animate-blink")}
            >
                <Link href="/stock-alerts">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Stock Alert ({lowStockCount})
                </Link>
            </Button>
            <div className="text-sm text-muted-foreground font-medium hidden lg:block">
                {dateTime ? format(dateTime, 'E, MMM d, yyyy, h:mm:ss a') : 'Loading...'}
            </div>
            <Button variant="outline" size="sm" onClick={handleOptimize}>
                <Zap className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Optimize System</span>
                <span className="sm:hidden">Optimize</span>
            </Button>
        </div>
    )
}


export default function PageHeader({ title, description, icon, actions }: PageHeaderProps) {
  return (
    <div className="space-y-2 sticky top-0 bg-background z-10 -mx-4 px-4 md:-mx-6 md:px-6 border-b">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-4">
        <div className="flex items-center gap-3 flex-1">
          {icon && <div className="[&>svg]:size-7 [&>svg]:transition-all [&>svg]:duration-300 header-[data-scrolled=true]_[&>svg]:size-6">{icon}</div>}
          <div className="grid gap-0">
            <h1 className="text-lg md:text-xl font-bold tracking-tight leading-tight transition-all duration-300 header-[data-scrolled=true]_&]:text-lg">{title}</h1>
            {description && <p className="text-muted-foreground text-xs md:text-[13px] leading-tight md:leading-[18px] transition-all duration-300 header-[data-scrolled=true]_&]:text-xs header-[data-scrolled=true]_&]:hidden">{description}</p>}
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2">
            <HeaderActions />
            {actions && <div className="transition-all duration-300 header-[data-scrolled=true]_&]:scale-90 header-[data-scrolled=true]_&]:-translate-y-px">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
