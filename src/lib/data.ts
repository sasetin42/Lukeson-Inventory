

import type { Product, Supplier, Invoice, Sales, InventoryKpi } from './types';
import { Box, DollarSign, Tag, AlertTriangle, XCircle, Star, Clock, Repeat } from 'lucide-react';

export const products: Product[] = [
  // This is now mock data and will not be used if Firestore is connected.
  {
    id: 'PROD001',
    productCode: 'PRO-2024-001',
    name: '240L 24v High-Density LED Striplight',
    sku: 'SL-240L-24V-WW',
    description: 'Bright warm-white LED striplight for professional installations. High density for smooth, dotless illumination.',
    supplier: 'LED Solutions Inc.',
    location: 'Aisle 1, Shelf A',
    stock: 150,
    reorderLevel: 50,
    imageUrl: 'https://placehold.co/400x400.png',
    fields: {
      ledQty: '240L',
      voltage: '24v',
      wattage: 18,
      meters: 5,
    },
    price: 1200.00,
    status: 'In Stock',
  }
];

export const suppliers: Supplier[] = [
  { id: 'SUP001', name: 'LED Solutions Inc.', contact: { name: 'Jane Doe', email: 'jane.doe@ledsolutions.com', phone: '123-456-7890' }, address: '123 Illumination Ave, Light City, LC 12345', contractTerms: 'Net 30', productsSupplied: 2 },
  { id: 'SUP002', name: 'Power Systems Ltd.', contact: { name: 'John Smith', email: 'john.smith@powersystems.com', phone: '234-567-8901' }, address: '456 Circuit Park, Volt Valley, VV 67890', contractTerms: 'Net 60', productsSupplied: 2 },
  { id: 'SUP003', name: 'Bright Ideas Lighting', contact: { name: 'Emily White', email: 'emily.white@brightideas.com', phone: '345-678-9012' }, address: '789 Edison Way, Spark Town, ST 54321', contractTerms: 'Payment on delivery', productsSupplied: 2 },
  { id: 'SUP004', name: 'AluExtrude Co.', contact: { name: 'Michael Brown', email: 'michael.brown@aluextrude.com', phone: '456-789-0123' }, address: '101 Metal Drive, Profile Plains, PP 10101', contractTerms: 'Net 45', productsSupplied: 2 },
];

export const invoices: Invoice[] = [
  { id: 'INV-2024-001', customerName: 'Alice Johnson', date: '2024-05-01', amount: 2400.00, status: 'Paid' },
  { id: 'INV-2024-002', customerName: 'Bob Williams', date: '2024-05-15', amount: 1800.00, status: 'Pending' },
  { id: 'INV-2024-003', customerName: 'Charlie Brown', date: '2024-04-10', amount: 900.50, status: 'Overdue' },
  { id: 'INV-2024-004', customerName: 'Diana Prince', date: '2024-05-20', amount: 1100.00, status: 'Paid' },
  { id: 'INV-2024-005', customerName: 'Ethan Hunt', date: '2024-05-22', amount: 700.00, status: 'Pending' },
];

export const sales: Sales[] = [
  { id: 'SALE001', productName: '240L 24v High-Density LED Striplight', customerName: 'Alice Johnson', date: '2024-05-28', quantity: 2, total: 2400.00 },
  { id: 'SALE002', productName: '24v 150W Slim Power Supply', customerName: 'Diana Prince', date: '2024-05-27', quantity: 1, total: 1800.00 },
  { id: 'SALE003', productName: 'Recessed LED Downlight 9W', customerName: 'Bob Williams', date: '2024-05-26', quantity: 3, total: 1350.00 },
  { id: 'SALE004', productName: 'Recessed Aluminium Profile 2m', customerName: 'Frank Martin', date: '2024-05-25', quantity: 10, total: 3500.00 },
  { id: 'SALE005', productName: '120L 12v Flexible LED Striplight', customerName: 'Grace Lee', date: '2024-05-24', quantity: 5, total: 4750.00 },
  { id: 'SALE006', productName: '240L 24v High-Density LED Striplight', customerName: 'Heidi Klum', date: '2024-05-23', quantity: 1, total: 1200.00 },
  { id: 'SALE007', productName: 'Surface Aluminium Profile 2m - Black', customerName: 'Ivan Drago', date: '2024-05-22', quantity: 4, total: 1600.00 },
];

export const inventoryKpis: InventoryKpi[] = [
  { title: 'Total Products', value: 0, icon: Box, subtext: 'Total Products', color: 'blue' },
  { title: 'Total Value', value: '₱0.0M', icon: DollarSign, subtext: 'Total Value', color: 'green' },
  { title: 'Categories', value: 1, icon: Tag, subtext: 'Categories', color: 'purple' },
  { title: 'Low Stock', value: 0, icon: AlertTriangle, subtext: 'Low Stock', color: 'yellow' },
  { title: 'Out of Stock', value: 0, icon: XCircle, subtext: 'Out of Stock', color: 'red' },
  { title: 'This Week', value: 0, icon: Star, subtext: 'Added This Week', color: 'indigo' },
  { title: 'Pending Orders', value: 2, icon: Clock, subtext: 'Pending Orders', color: 'orange' },
];
