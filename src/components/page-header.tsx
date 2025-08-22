
'use client';

import type { ReactNode } from 'react';
import { Button } from './ui/button';
import { Zap, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { db } from '@/lib/firebase';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { Product } from '@/lib/types';
import Link from 'next/link';

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

    return (
        <div className="flex items-center gap-4">
            {lowStockCount > 0 && (
                <Button variant="destructive" size="sm" asChild className="animate-blink">
                    <Link href="/stock-alerts">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Stock Alert ({lowStockCount})
                    </Link>
                </Button>
            )}
            <div className="text-sm text-muted-foreground font-medium hidden md:block">
                {mounted && dateTime ? format(dateTime, 'E, MMM d, yyyy, h:mm:ss a') : 'Loading...'}
            </div>
            <Button variant="outline" size="sm" onClick={handleOptimize}>
                <Zap className="h-4 w-4 mr-2" />
                Optimize System
            </Button>
        </div>
    )
}


export default function PageHeader({ title, description, icon, actions }: PageHeaderProps) {
  return (
    <div className="space-y-2 sticky top-0 bg-background z-10 -mx-4 px-4 md:-mx-6 md:px-6 border-b">
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-4">
          {icon && <div className="[&>svg]:size-8 [&>svg]:transition-all [&>svg]:duration-300 header-[data-scrolled=true]_[&>svg]:size-6">{icon}</div>}
          <div className="grid gap-0">
            <h1 className="text-xl font-bold tracking-tight leading-[26px] transition-all duration-300 header-[data-scrolled=true]_&]:text-lg">{title}</h1>
            {description && <p className="text-muted-foreground text-[13px] leading-[18px] transition-all duration-300 header-[data-scrolled=true]_&]:text-xs header-[data-scrolled=true]_&]:hidden">{description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-4">
            <HeaderActions />
            {actions && <div className="transition-all duration-300 header-[data-scrolled=true]_&]:scale-90 header-[data-scrolled=true]_&]:-translate-y-px">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
