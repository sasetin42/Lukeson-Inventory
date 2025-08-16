
'use client';
import { Package, DollarSign, AlertTriangle, XCircle } from 'lucide-react';
import KpiCard from '@/components/kpi-card';
import { products } from '@/lib/products-data';

export default function InventoryOverview() {
  const totalProducts = products.length;
  const outOfStock = products.filter(p => p.stock === 0).length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= p.reOrderLevel).length;
  const totalValue = products.reduce((acc, p) => acc + (p.cost * p.stock), 0);
  
  const cardData = [
    { 
      title: 'Total Products', 
      value: totalProducts,
      icon: Package, 
      trend: `+${products.filter(p => new Date(p.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length} from last month`,
      color: 'blue' as const,
      tooltipText: 'Total number of unique products in your inventory.'
    },
    { 
      title: 'Total Value (est.)', 
      value: `₱${(totalValue / 1000000).toFixed(2)}M`, 
      icon: DollarSign, 
      trend: '+8% from last week',
      color: 'green' as const,
      tooltipText: 'Estimated total value of all items in stock.'
    },
    { 
      title: 'Low Stock', 
      value: lowStock, 
      icon: AlertTriangle, 
      trend: `Critical items needing attention`,
      color: 'yellow' as const,
      tooltipText: 'Products that have fallen below their re-order level.'
    },
    { 
        title: 'Out of Stock', 
        value: outOfStock, 
        icon: XCircle, 
        trend: 'Items unavailable for sale',
        color: 'red' as const,
        tooltipText: 'Products with zero stock available.'
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cardData.map((card, index) => (
        <KpiCard
          key={card.title}
          title={card.title}
          value={card.value}
          icon={card.icon}
          trend={card.trend}
          color={card.color}
          tooltipText={card.tooltipText}
          style={{ animationDelay: `${index * 100}ms` }}
          className="fade-in-up"
        />
      ))}
    </div>
  );
}
