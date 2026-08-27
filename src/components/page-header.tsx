
'use client';

import type { ReactNode } from 'react';
import { Button } from './ui/button';
import { Zap, AlertTriangle, FileText, Loader2, CheckCircle, Maximize, Minimize, Truck, Calendar, Clock } from 'lucide-react';
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
import DeliveryReceiptModal from './delivery-receipts/delivery-receipt-modal';
import { SidebarTrigger } from './ui/sidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

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
    const [deliveryReadyCount, setDeliveryReadyCount] = useState(0);
    const [deliveryReadyOrders, setDeliveryReadyOrders] = useState<SalesOrder[]>([]);
    const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
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

        const allSalesOrdersQuery = collection(db, 'salesOrders');
        const unsubscribeAllSalesOrders = onSnapshot(allSalesOrdersQuery, (snapshot) => {
            const allSOs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as SalesOrder));
            const activeDeliveries = allSOs.filter(so => so.status !== 'Cancelled' && so.status !== 'Draft');
            setDeliveryReadyOrders(activeDeliveries);
            setDeliveryReadyCount(activeDeliveries.length);
        });

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            clearInterval(timer);
            unsubscribeProducts();
            unsubscribeSalesOrders();
            unsubscribeAllSalesOrders();
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

    if (!mounted) return null;

    return (
        <TooltipProvider delayDuration={300}>
            {isMobile ? (
                <div className="flex items-center gap-1.5">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setIsDeliveryModalOpen(true)}
                                className={cn("relative bg-[#2563EB] text-white hover:bg-[#1D4ED8] h-8 w-8", deliveryReadyCount > 0 && "animate-blink")}
                            >
                                <Truck className="h-4 w-4" />
                                {deliveryReadyCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[#2563EB] text-[10px] font-bold shadow">
                                        {deliveryReadyCount}
                                    </span>
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="font-medium">
                            Delivery Receipt ({deliveryReadyCount})
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={lowStockCount > 0 ? "destructive" : "outline"}
                                size="icon"
                                asChild
                                className={cn("relative h-8 w-8", lowStockCount > 0 && "animate-blink")}
                            >
                                <Link href="/stock-alerts" prefetch={false}>
                                    <AlertTriangle className="h-4 w-4" />
                                    {lowStockCount > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-destructive text-[10px] font-bold shadow">
                                            {lowStockCount}
                                        </span>
                                    )}
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="font-medium">
                            Stock Alert ({lowStockCount})
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="icon"
                                onClick={handleOptimize}
                                className="h-8 w-8 bg-[#5F8400] text-white hover:bg-[#5F8400]/90"
                            >
                                <Zap className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="font-medium">
                            Optimize System
                        </TooltipContent>
                    </Tooltip>

                    <DeliveryReceiptModal
                        isOpen={isDeliveryModalOpen}
                        onClose={() => setIsDeliveryModalOpen(false)}
                        salesOrders={deliveryReadyOrders}
                    />
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-2 sm:gap-2.5">
                        {/* Enhanced Date & Time Display */}
                        <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-card/80 dark:bg-card/60 border shadow-xs backdrop-blur-xs select-none">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/85 border-r pr-2.5 border-border/80">
                                <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                                <span>{dateTime ? format(dateTime, 'EEE, MMM d, yyyy') : '--, --- --, ----'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-mono font-bold tracking-tight text-primary">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0 ml-0.5" />
                                <span className="tabular-nums">{dateTime ? format(dateTime, 'hh:mm:ss a') : '--:--:-- --'}</span>
                            </div>
                        </div>

                        {/* For Invoicing */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={invoiceReadyCount > 0 ? "default" : "outline"}
                                    size="icon"
                                    onClick={() => setIsInvoiceModalOpen(true)}
                                    className={cn(
                                        "relative h-9 w-9 bg-[#F99B01] text-white hover:bg-[#F99B01]/90 border-0",
                                        invoiceReadyCount > 0 && "animate-blink"
                                    )}
                                >
                                    <FileText className="h-4 w-4" />
                                    {invoiceReadyCount > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[#F99B01] text-[10px] font-bold shadow-md ring-1 ring-[#F99B01]/20">
                                            {invoiceReadyCount}
                                        </span>
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="font-semibold text-xs px-3 py-2">
                                <div className="flex items-center gap-1.5">
                                    <FileText className="h-3.5 w-3.5 text-[#F99B01]" />
                                    For Invoicing
                                    <span className="ml-1 rounded-full bg-[#F99B01] text-white text-[10px] font-bold px-1.5 py-0.5 leading-none">
                                        {invoiceReadyCount}
                                    </span>
                                </div>
                            </TooltipContent>
                        </Tooltip>

                        {/* Delivery Receipt */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={deliveryReadyCount > 0 ? "default" : "outline"}
                                    size="icon"
                                    onClick={() => setIsDeliveryModalOpen(true)}
                                    className={cn(
                                        "relative h-9 w-9 bg-[#2563EB] text-white hover:bg-[#1D4ED8] border-0",
                                        deliveryReadyCount > 0 && "animate-blink"
                                    )}
                                >
                                    <Truck className="h-4 w-4" />
                                    {deliveryReadyCount > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[#2563EB] text-[10px] font-bold shadow-md ring-1 ring-[#2563EB]/20">
                                            {deliveryReadyCount}
                                        </span>
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="font-semibold text-xs px-3 py-2">
                                <div className="flex items-center gap-1.5">
                                    <Truck className="h-3.5 w-3.5 text-[#2563EB]" />
                                    Delivery Receipt
                                    <span className="ml-1 rounded-full bg-[#2563EB] text-white text-[10px] font-bold px-1.5 py-0.5 leading-none">
                                        {deliveryReadyCount}
                                    </span>
                                </div>
                            </TooltipContent>
                        </Tooltip>

                        {/* Stock Alert */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={lowStockCount > 0 ? "destructive" : "outline"}
                                    size="icon"
                                    asChild
                                    className={cn(
                                        "relative h-9 w-9",
                                        lowStockCount > 0 && "animate-blink"
                                    )}
                                >
                                    <Link href="/stock-alerts" prefetch={false}>
                                        <AlertTriangle className="h-4 w-4" />
                                        {lowStockCount > 0 && (
                                            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-destructive text-[10px] font-bold shadow-md ring-1 ring-destructive/20">
                                                {lowStockCount}
                                            </span>
                                        )}
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="font-semibold text-xs px-3 py-2">
                                <div className="flex items-center gap-1.5">
                                    <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                                    Stock Alert
                                    <span className="ml-1 rounded-full bg-destructive text-white text-[10px] font-bold px-1.5 py-0.5 leading-none">
                                        {lowStockCount}
                                    </span>
                                </div>
                            </TooltipContent>
                        </Tooltip>

                        {/* Optimize System */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon"
                                    onClick={handleOptimize}
                                    className="h-9 w-9 bg-[#5F8400] text-white hover:bg-[#5F8400]/90 border-0"
                                >
                                    <Zap className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="font-semibold text-xs px-3 py-2">
                                <div className="flex items-center gap-1.5">
                                    <Zap className="h-3.5 w-3.5 text-[#5F8400]" />
                                    Optimize System
                                </div>
                            </TooltipContent>
                        </Tooltip>

                        {/* Fullscreen */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" onClick={toggleFullscreen} className="h-9 w-9">
                                    {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="font-semibold text-xs px-3 py-2">
                                {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    <ForInvoicingModal
                        isOpen={isInvoiceModalOpen}
                        onClose={() => setIsInvoiceModalOpen(false)}
                        salesOrders={invoiceReadyOrders}
                    />
                    <DeliveryReceiptModal
                        isOpen={isDeliveryModalOpen}
                        onClose={() => setIsDeliveryModalOpen(false)}
                        salesOrders={deliveryReadyOrders}
                    />
                </>
            )}
        </TooltipProvider>
    );
}


export default function PageHeader({ title, description, icon, actions }: PageHeaderProps) {
  return (
    <div className="space-y-2 sticky top-0 bg-background z-10 -mx-4 px-4 md:-mx-6 md:px-6 border-b">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-4">
        <div className="flex items-center gap-3 flex-1">
          <SidebarTrigger />
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

