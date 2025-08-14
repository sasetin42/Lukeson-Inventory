import { products, suppliers, invoices } from '@/lib/data';
import { Package, ShoppingCart, AlertTriangle, DollarSign, ArrowUp } from 'lucide-react';
import KpiCard from '@/components/kpi-card';

export default function OverviewCards() {
  const totalProducts = products.length;
  const lowStockItems = products.filter(p => p.status === 'Low Stock').length;
  const activeOrders = invoices.filter(i => i.status === 'Pending').length;
  const monthlyRevenue = invoices.filter(i => i.status === 'Paid').reduce((acc, i) => acc + i.amount, 0);

  const cardData = [
    { 
      title: 'Total Products', 
      value: totalProducts, 
      icon: Package, 
      trend: '+12% from last month',
      color: 'blue'
    },
    { 
      title: 'Active Orders', 
      value: activeOrders, 
      icon: ShoppingCart, 
      trend: '+8% from last week',
      color: 'green'
    },
    { 
      title: 'Low Stock Alerts', 
      value: lowStockItems, 
      icon: AlertTriangle, 
      trend: '3 new this week',
      color: 'yellow'
    },
    { 
      title: 'Monthly Revenue', 
      value: `$${monthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      icon: DollarSign, 
      trend: '+15% from last month',
      color: 'purple'
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
          color={card.color as any}
          style={{ animationDelay: `${index * 100}ms` }}
          className="fade-in-up"
        />
      ))}
    </div>
  );
}
