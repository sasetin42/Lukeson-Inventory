
'use client';
import { Package, DollarSign, AlertTriangle, XCircle } from 'lucide-react';
import KpiCard from '@/components/kpi-card';
import { Product } from '@/lib/types';
import Link from 'next/link';

interface InventoryOverviewProps {
    products: Product[];
}

export default function InventoryOverview({ products }: InventoryOverviewProps) {
  const totalProducts = products.length;
  const outOfStock = products.filter(p => p.stock === 0).length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= p.reOrderLevel).length;
  const totalValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
  
  const addedLastMonth = products.filter(p => {
    if (!p.createdAt) return false;
    const createdAtDate = (p.createdAt as any).toDate ? (p.createdAt as any).toDate() : new Date(p.createdAt as string);
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    return createdAtDate > lastMonth;
  }).length;

  const cardData = [
    { 
      title: 'Total Products', 
      value: totalProducts,
      icon: Package, 
      trend: `+${addedLastMonth} from last month`,
      color: 'blue' as const,
      tooltipText: 'Total number of unique products in your inventory.',
      href: '/products'
    },
    { 
      title: 'Total Value (est.)', 
      value: `₱${(totalValue / 1000000).toFixed(2)}M`, 
      icon: DollarSign, 
      trend: '+8% from last week',
      color: 'green' as const,
      tooltipText: 'Estimated total value of all items in stock.',
      href: '/analytics'
    },
    { 
      title: 'Low Stock', 
      value: lowStock, 
      icon: AlertTriangle, 
      trend: `Critical items needing attention`,
      color: 'yellow' as const,
      tooltipText: 'Products that have fallen below their re-order level.',
      href: '/products'
    },
    { 
        title: 'Out of Stock', 
        value: outOfStock, 
        icon: XCircle, 
        trend: 'Items unavailable for sale',
        color: 'red' as const,
        tooltipText: 'Products with zero stock available.',
        href: '/products'
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cardData.map((card, index) => (
        <Link href={card.href} key={card.title}>
            <KpiCard
                title={card.title}
                value={card.value}
                icon={card.icon}
                trend={card.trend}
                color={card.color}
                tooltipText={card.tooltipText}
                style={{ animationDelay: `${index * 100}ms` }}
                className="fade-in-up hover:bg-muted/50 transition-colors"
            />
        </Link>
      ))}
    </div>
  );
}
