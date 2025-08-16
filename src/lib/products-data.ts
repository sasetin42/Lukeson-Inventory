
import { Box, DollarSign, AlertTriangle, XCircle, Star, Clock } from "lucide-react";
import type { ProductKpi, Product } from "./types";

export const productKpis: ProductKpi[] = [
    {
        title: "Total Products",
        value: 8,
        icon: Box,
        subtext: "Total Products",
        color: "blue"
    },
    {
        title: "Total Value",
        value: "N/A",
        icon: DollarSign,
        subtext: "Total Value",
        color: "green"
    },
    {
        title: "Low Stock",
        value: 0,
        icon: AlertTriangle,
        subtext: "Low Stock",
        color: "yellow"
    },
    {
        title: "Out of Stock",
        value: 1,
        icon: XCircle,
        subtext: "Out of Stock",
        color: "red"
    },
    {
        title: "This Week",
        value: 0,
        icon: Star,
        subtext: "Added This Week",
        color: "purple"
    },
    {
        title: "Pending Orders",
        value: 0,
        icon: Clock,
        subtext: "Pending Orders",
        color: "orange"
    }
];

export const products: Product[] = [
    {
        id: "PROD001",
        name: "240L 24v High-Density LED Striplight",
        imageUrl: "https://placehold.co/48x48.png",
        stock: 150,
        status: "In Stock"
    },
    {
        id: "PROD002",
        name: "120L 12v Flexible LED Striplight",
        imageUrl: "https://placehold.co/48x48.png",
        stock: 80,
        status: "In Stock"
    }
];
