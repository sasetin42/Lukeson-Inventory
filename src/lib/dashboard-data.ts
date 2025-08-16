
import type { TopSellingItem, SlowMovingItem, QuickStat, LowStockAlert } from './types';

export const topSellingItems: TopSellingItem[] = [
    {
        id: "PROD001",
        name: "240L 24v High-Density LED Striplight",
        imageUrl: "https://placehold.co/40x40.png",
        unitsSold: 1250,
        revenue: 1500000,
    },
    {
        id: "PROD002",
        name: "120L 12v Flexible LED Striplight",
        imageUrl: "https://placehold.co/40x40.png",
        unitsSold: 980,
        revenue: 931000,
    },
    {
        id: "PROD003",
        name: "Recessed LED Downlight 9W",
        imageUrl: "https://placehold.co/40x40.png",
        unitsSold: 750,
        revenue: 337500,
    }
];

export const slowMovingItems: SlowMovingItem[] = [
    {
        id: "PROD004",
        name: "RGB LED Controller with Remote",
        imageUrl: "https://placehold.co/40x40.png",
        daysInStock: 128,
        stock: 45,
    },
    {
        id: "PROD005",
        name: "Outdoor LED Floodlight 50W",
        imageUrl: "https://placehold.co/40x40.png",
        daysInStock: 95,
        stock: 30,
    },
    {
        id: "PROD006",
        name: "Pendant Light Fixture - Copper",
        imageUrl: "https://placehold.co/40x40.png",
        daysInStock: 82,
        stock: 15,
    }
];

export const quickStats: QuickStat[] = [
    { label: "New Customers", value: "12" },
    { label: "Pending Orders", value: "5" },
    { label: "Open Invoices", value: "8" },
    { label: "Fulfilled Orders", value: "128" },
];

export const lowStockAlerts: LowStockAlert[] = [
    { id: "PROD007", name: "24v 150W Slim Power Supply", sku: "PS-24-150-SL", stock: 8, reOrderLevel: 10 },
    { id: "PROD008", name: "Recessed Aluminium Profile 2m", sku: "AP-R-2M", stock: 12, reOrderLevel: 20 },
    { id: "PROD009", name: "Surface Aluminium Profile 2m - Black", sku: "AP-S-2M-BLK", stock: 5, reOrderLevel: 10 },
];
