
'use client';
import KpiCard from "@/components/kpi-card";
import type { Product } from "@/lib/types";
import { Box, DollarSign, Tag, AlertTriangle, XCircle, Star, Clock } from 'lucide-react';

export default function InventoryKpiCards({ products }: { products: Product[] }) {
  const totalProducts = products.length;
  // Note: Total value calculation will be complex due to different fields.
  // This is a simplified placeholder.
  const totalValue = 0; 
  const categories = new Set(products.map(p => p.category)).size;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= p.reorderLevel).length;
  const outOfStock = products.filter(p => p.stock <= 0).length;
  
  // This week calculation - assuming products don't have a created date
  // For now, we will keep it as a static value.
  const addedThisWeek = 0; 
  const pendingOrders = 0; // Static for now

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) {
      return `₱${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
      return `₱${(value / 1_000).toFixed(1)}K`;
    }
    return `₱${value.toFixed(2)}`;
  }
  
  const inventoryKpis = [
    { title: 'Total Products', value: totalProducts, icon: Box, subtext: 'Total Products', color: 'blue' },
    { title: 'Total Value', value: 'N/A', icon: DollarSign, subtext: 'Total Value', color: 'green' },
    { title: 'Categories', value: categories, icon: Tag, subtext: 'Categories', color: 'purple' },
    { title: 'Low Stock', value: lowStock, icon: AlertTriangle, subtext: 'Low Stock', color: 'yellow' },
    { title: 'Out of Stock', value: outOfStock, icon: XCircle, subtext: 'Out of Stock', color: 'red' },
    { title: 'This Week', value: addedThisWeek, icon: Star, subtext: 'Added This Week', color: 'indigo' },
    { title: 'Pending Orders', value: pendingOrders, icon: Clock, subtext: 'Pending Orders', color: 'orange' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
      {inventoryKpis.map((kpi, index) => (
        <KpiCard
          key={kpi.title}
          title={kpi.title}
          value={kpi.value}
          icon={kpi.icon}
          color={kpi.color as any}
          subtext={kpi.subtext}
          style={{ animationDelay: `${index * 100}ms` }}
          className="fade-in-up"
        />
      ))}
    </div>
  );
}
