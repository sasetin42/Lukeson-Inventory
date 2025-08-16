
'use client';

import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Package, PlusCircle, Upload, Download, DollarSign, AlertTriangle, XCircle, Star, Clock } from "lucide-react";
import KpiCard from "@/components/kpi-card";
import { products } from "@/lib/products-data";
import ActionCard from "@/components/action-card";
import ProductList from "@/components/products/product-list";

export default function ProductsPage() {
    const totalProducts = products.length;
    const totalValue = products.reduce((acc, p) => acc + (p.cost * p.stock), 0);
    const lowStock = products.filter(p => p.status === 'Low Stock').length;
    const outOfStock = products.filter(p => p.status === 'Out of Stock').length;
    
    // Mock data for added this week and pending orders for now
    const addedThisWeek = products.filter(p => {
        const productDate = new Date(p.createdAt);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return productDate > sevenDaysAgo;
    }).length;

    const productKpis = [
        { title: "Total Products", value: totalProducts, icon: Box, subtext: "Total unique items", color: "blue" as const },
        { title: "Total Value", value: `₱${totalValue.toLocaleString()}`, icon: DollarSign, subtext: "Value of all stock", color: "green" as const },
        { title: "Low Stock", value: lowStock, icon: AlertTriangle, subtext: "Items needing reorder", color: "yellow" as const },
        { title: "Out of Stock", value: outOfStock, icon: XCircle, subtext: "Items unavailable", color: "red" as const },
        { title: "Added This Week", value: addedThisWeek, icon: Star, subtext: "New products onboarded", color: "purple" as const },
        { title: "Pending Orders", value: 0, icon: Clock, subtext: "Awaiting fulfillment", color: "orange" as const }
    ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Products Overview"
        description="Complete inventory management with clickable widgets and analytics"
        icon={<Package className="h-6 w-6" />}
        actions={
          <div className="flex items-center gap-2">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Button>
            <Button variant="ghost">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button variant="ghost">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        }
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {productKpis.map((kpi) => (
          <KpiCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            subtext={kpi.subtext}
            color={kpi.color}
          />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <ActionCard 
            title="Add Product" 
            description="Create new inventory item" 
            icon="plus"
            href="#"
            color="blue"
        />
        <ActionCard 
            title="Adjust Stock" 
            description="Modify inventory levels" 
            icon="repeat"
            href="#"
            color="green"
        />
        <ActionCard 
            title="Create PO" 
            description="New purchase order" 
            icon="cart"
            href="#"
            color="purple"
        />
        <ActionCard 
            title="Stock Alerts" 
            description={`${lowStock} active alerts`} 
            icon="alert"
            href="#"
            color="red"
        />
      </div>
      <ProductList />
    </div>
  );
}
