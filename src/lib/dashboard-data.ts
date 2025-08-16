
import type { TopSellingItem, SlowMovingItem } from './types';

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
