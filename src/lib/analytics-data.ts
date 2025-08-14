import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";

export const analyticsKpiData = [
    {
      title: "Total Revenue",
      value: "₱328,000",
      icon: DollarSign,
      trend: "+15.2% from last month",
      color: "green"
    },
    {
      title: "Units Sold",
      value: "4,890",
      icon: Package,
      trend: "+8.1% from last month",
      color: "blue"
    },
    {
      title: "Avg Order Value",
      value: "₱67.12",
      icon: ShoppingCart,
      trend: "-2.3% from last month",
      color: "purple"
    },
    {
      title: "Inventory Turnover",
      value: "6.8x",
      icon: TrendingUp,
      trend: "+12.5% from last month",
      color: "yellow"
    },
  ];

export const revenueProfitChartData = [
    { month: "Jan", revenue: 45000, profit: 10000 },
    { month: "Feb", revenue: 48000, profit: 12000 },
    { month: "Mar", revenue: 52000, profit: 15000 },
    { month: "Apr", revenue: 49000, profit: 13000 },
    { month: "May", revenue: 55000, profit: 16000 },
    { month: "Jun", revenue: 60000, profit: 18000 },
    { month: "Jul", revenue: 62000, profit: 19000 },
    { month: "Aug", revenue: 58000, profit: 17000 },
    { month: "Sep", revenue: 65000, profit: 20000 },
    { month: "Oct", revenue: 68000, profit: 21000 },
    { month: "Nov", revenue: 70000, profit: 22000 },
    { month: "Dec", revenue: 75000, profit: 24000 },
];
