import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";

const baseData = {
  totalRevenue: 328000,
  unitsSold: 4890,
  avgOrderValue: 67.12,
  inventoryTurnover: 6.8,
};

// Function to get dynamically generated data based on date range
export const getAnalyticsKpiData = (days: number) => {
    const factor = days / 30; // Scale data based on a 30-day baseline
    return [
        {
          title: "Total Revenue",
          value: `₱${(baseData.totalRevenue * factor).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
          icon: DollarSign,
          trend: `+${(15.2 * factor).toFixed(1)}% from last period`,
          color: "green"
        },
        {
          title: "Units Sold",
          value: (baseData.unitsSold * factor).toLocaleString(undefined, { maximumFractionDigits: 0 }),
          icon: Package,
          trend: `+${(8.1 * factor).toFixed(1)}% from last period`,
          color: "blue"
        },
        {
          title: "Avg Order Value",
          value: `₱${(baseData.avgOrderValue * (1 + (factor - 1) * 0.1)).toFixed(2)}`, // Less volatile
          icon: ShoppingCart,
          trend: `${(factor > 1 ? '+' : '')}${( -2.3 * factor).toFixed(1)}% from last period`,
          color: "purple"
        },
        {
          title: "Inventory Turnover",
          value: `${(baseData.inventoryTurnover * factor).toFixed(1)}x`,
          icon: TrendingUp,
          trend: `+${(12.5 * factor).toFixed(1)}% from last period`,
          color: "yellow"
        },
    ];
}


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
