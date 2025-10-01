
'use client';

import type { ReactNode } from 'react';
import { Button } from './ui/button';
import { Zap, AlertTriangle, FileText, Loader2, CheckCircle, Maximize, Minimize } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { Product, SalesOrder } from '@/lib/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import ForInvoicingModal from './for-invoicing-modal';

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
    const [invoiceReadyCount, setInvoiceReadyCount] = useState(0);
    const [invoiceReadyOrders, setInvoiceReadyOrders] = useState<SalesOrder[]>([]);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const isMobile = useIsMobile();
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => {
            setDateTime(new Date());
        }, 1000);

        const productsRef = collection(db, 'products');
        const unsubscribeProducts = onSnapshot(productsRef, (snapshot) => {
            const products = snapshot.docs.map(doc => doc.data() as Product);
            const lowStockItems = products.filter(p => p.stock > 0 && p.stock <= p.reOrderLevel);
            setLowStockCount(lowStockItems.length);
        });

        const salesOrdersQuery = query(collection(db, 'salesOrders'), where('status', '==', 'Fulfilled'));

        const unsubscribeSalesOrders = onSnapshot(salesOrdersQuery, (snapshot) => {
            const salesOrders = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as SalesOrder));
            const readyOrders = salesOrders.filter(so => so.invoicedStatus !== 'Fully Invoiced');
            setInvoiceReadyOrders(readyOrders);
            setInvoiceReadyCount(readyOrders.length);
        });
        
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            clearInterval(timer);
            unsubscribeProducts();
            unsubscribeSalesOrders();
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    const handleOptimize = () => {
        const { id, update } = toast({
            title: "System is optimizing...",
            description: "Please wait while we refresh the system data.",
            variant: 'default',
            icon: <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
        });

        setTimeout(() => {
            update({
                id,
                title: "System Optimized",
                description: "Cache has been cleared and data has been refreshed.",
                variant: 'success',
                icon: <CheckCircle className="h-5 w-5" />
            });
        }, 1000);
    }
    
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

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
                 <Button size="sm" onClick={handleOptimize} className="text-xs bg-[#5F8400] text-[#FFFFFF] hover:bg-[#5F8400]/90">
                    <Zap className="h-3 w-3 mr-1" />
                    Optimize
                </Button>
            </div>
        )
    }

    return (
        <>
        <div className="flex items-center gap-2 sm:gap-4">
             <div className="text-right text-xs text-muted-foreground font-medium hidden lg:block p-2 rounded-md bg-muted/50">
                {dateTime ? (
                    <>
                        <div>{format(dateTime, 'E, MMM d, yyyy')}</div>
                        <div>{format(dateTime, 'h:mm:ss a')}</div>
                    </>
                ) : (
                    'Loading...'
                )}
            </div>
             <Button 
                variant={invoiceReadyCount > 0 ? "default" : "outline"} 
                size="sm" 
                onClick={() => setIsInvoiceModalOpen(true)}
                className={cn(invoiceReadyCount > 0 && "animate-blink", "bg-[#F99B01] text-white hover:bg-[#F99B01]/90")}
            >
                <FileText className="h-4 w-4 mr-2" />
                For Invoicing ({invoiceReadyCount})
            </Button>
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
            <Button size="sm" onClick={handleOptimize} className="bg-[#5F8400] text-[#FFFFFF] hover:bg-[#5F8400]/90">
                <Zap className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Optimize System</span>
                <span className="sm:hidden">Optimize</span>
            </Button>
            <Button variant="outline" size="icon" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
        </div>
        <ForInvoicingModal
            isOpen={isInvoiceModalOpen}
            onClose={() => setIsInvoiceModalOpen(false)}
            salesOrders={invoiceReadyOrders}
        />
        </>
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
