
import { Product, Sales, Invoice, Supplier, User, ItemCategory } from './types';

// This file can be used for seeding the database if empty, or for local testing.
// The main application fetches data from Cloud Firestore.

export const categories: ItemCategory[] = [
    { id: 'cat-1', name: 'STRIPLIGHT', description: 'Various types of LED striplights.', createdAt: new Date() },
    { id: 'cat-2', name: 'POWER SUPPLY', description: 'Power supplies for LED lighting.', createdAt: new Date() },
    { id: 'cat-3', name: 'GENERAL LIGHTING', description: 'General purpose lighting fixtures.', createdAt: new Date() },
    { id: 'cat-4', name: 'ALUMINIUM PROFILE', description: 'Aluminium profiles for LED strips.', createdAt: new Date() },
];

export const products: Product[] = [
    {
        id: "PROD-2024-001",
        productCode: "PROD-2024-001",
        name: "High-Density LED Striplight 240L",
        category: "STRIPLIGHT",
        sku: "LED-HD-240-24",
        description: "High-density flexible LED striplight with 240 LEDs per meter. Provides bright, even illumination.",
        price: 150.00,
        stock: 120,
        reOrderLevel: 20,
        supplier: "LED Innovations Inc.",
        status: "In Stock",
        createdAt: new Date("2024-05-01T10:00:00Z"),
        modifiedAt: new Date("2024-05-20T14:30:00Z"),
        productImage: "https://placehold.co/300x300.png",
        uom: "roll",
        expiryDateTracking: false,
        ledQty: 240,
        voltage: 24,
        wattage: 19.2,
        meters: 5,
        location: "Warehouse A, Shelf 1"
    },
];

export const sales: Sales[] = [
    { id: "SALE-001", productId: "PROD-2024-001", productName: "High-Density LED Striplight 240L", customerName: "John Doe", date: new Date("2024-05-20"), quantity: 5, total: 750.00 },
];

export const invoices: Invoice[] = [
  { id: "INV-2024-001", customerName: "John Doe", date: new Date("2024-05-20"), amount: 750.00, status: 'Paid' },
];

export const suppliers: Supplier[] = [
    {
        id: "SUP-001",
        name: "LED Innovations Inc.",
        contact: { name: "Mark Reyes", email: "mark.reyes@ledinnovations.com", phone: "0917-123-4567" },
        address: "123 Tech Drive, Silicon Valley, Cyberzone",
        contractTerms: "Net 30"
    },
];

export const users: User[] = [
    {
        id: "USR-001",
        name: "Admin User",
        email: "admin@example.com",
        role: "Admin",
        status: "active",
        lastLoginAt: new Date("2024-05-23T10:00:00Z"),
        createdAt: new Date("2024-01-01T10:00:00Z")
    },
];
