
import { Box, DollarSign, AlertTriangle, XCircle, Star, Clock } from "lucide-react";
import type { ProductKpi, Product } from "./types";

export const productKpis: ProductKpi[] = [
    {
        title: "Total Products",
        value: 10,
        icon: Box,
        subtext: "Total unique items",
        color: "blue"
    },
    {
        title: "Total Value",
        value: "₱1,059,250",
        icon: DollarSign,
        subtext: "Value of all stock",
        color: "green"
    },
    {
        title: "Low Stock",
        value: 3,
        icon: AlertTriangle,
        subtext: "Items needing reorder",
        color: "yellow"
    },
    {
        title: "Out of Stock",
        value: 1,
        icon: XCircle,
        subtext: "Items unavailable",
        color: "red"
    },
    {
        title: "Added This Week",
        value: 2,
        icon: Star,
        subtext: "New products onboarded",
        color: "purple"
    },
    {
        title: "Pending Orders",
        value: 0,
        icon: Clock,
        subtext: "Awaiting fulfillment",
        color: "orange"
    }
];

export const products: Product[] = [
    {
        id: "PROD001",
        sku: "LED-HD-240-24",
        name: "240L 24v High-Density LED Striplight",
        imageUrl: "https://placehold.co/48x48.png",
        stock: 150,
        cost: 800,
        reOrderLevel: 20,
        createdAt: "2024-01-15T10:00:00Z",
        status: "In Stock"
    },
    {
        id: "PROD002",
        sku: "LED-FLEX-120-12",
        name: "120L 12v Flexible LED Striplight",
        imageUrl: "https://placehold.co/48x48.png",
        stock: 80,
        cost: 650,
        reOrderLevel: 30,
        createdAt: "2024-01-20T10:00:00Z",
        status: "In Stock"
    },
    {
        id: "PROD003",
        sku: "LED-DL-R-9W",
        name: "Recessed LED Downlight 9W",
        imageUrl: "https://placehold.co/48x48.png",
        stock: 75,
        cost: 300,
        reOrderLevel: 25,
        createdAt: "2024-02-10T10:00:00Z",
        status: "In Stock"
    },
    {
        id: "PROD004",
        sku: "CTRL-RGB-REM",
        name: "RGB LED Controller with Remote",
        imageUrl: "https://placehold.co/48x48.png",
        stock: 45,
        cost: 500,
        reOrderLevel: 10,
        createdAt: "2023-11-05T10:00:00Z",
        status: "In Stock"
    },
    {
        id: "PROD005",
        sku: "LED-FL-50W",
        name: "Outdoor LED Floodlight 50W",
        imageUrl: "https://placehold.co/48x48.png",
        stock: 30,
        cost: 1200,
        reOrderLevel: 15,
        createdAt: "2023-12-01T10:00:00Z",
        status: "In Stock"
    },
    {
        id: "PROD006",
        sku: "PL-COP-E27",
        name: "Pendant Light Fixture - Copper",
        imageUrl: "https://placehold.co/48x48.png",
        stock: 15,
        cost: 1500,
        reOrderLevel: 5,
        createdAt: "2024-01-05T10:00:00Z",
        status: "In Stock"
    },
    {
        id: "PROD007",
        sku: "PS-24-150-SL",
        name: "24v 150W Slim Power Supply",
        imageUrl: "https://placehold.co/48x48.png",
        stock: 8,
        cost: 1500,
        reOrderLevel: 10,
        createdAt: "2024-03-01T10:00:00Z",
        status: "Low Stock"
    },
    {
        id: "PROD008",
        sku: "AP-R-2M",
        name: "Recessed Aluminium Profile 2m",
        imageUrl: "https://placehold.co/48x48.png",
        stock: 12,
        cost: 250,
        reOrderLevel: 20,
        createdAt: "2024-02-15T10:00:00Z",
        status: "Low Stock"
    },
    {
        id: "PROD009",
        sku: "AP-S-2M-BLK",
        name: "Surface Aluminium Profile 2m - Black",
        imageUrl: "https://placehold.co/48x48.png",
        stock: 5,
        cost: 300,
        reOrderLevel: 10,
        createdAt: "2024-04-01T10:00:00Z",
        status: "Low Stock"
    },
    {
        id: "PROD010",
        sku: "LED-Panel-6060",
        name: "60x60 LED Panel Light",
        imageUrl: "https://placehold.co/48x48.png",
        stock: 0,
        cost: 1800,
        reOrderLevel: 10,
        createdAt: "2024-03-10T10:00:00Z",
        status: "Out of Stock"
    }
];
