
import type { Product, Supplier, Invoice, Sales, InventoryKpi } from './types';
import { Box, DollarSign, Tag, AlertTriangle, XCircle, Star, Clock, Repeat } from 'lucide-react';

export const products: Product[] = [
  // Striplights
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
  },
  {
    id: 'PROD002',
    productCode: 'PRO-2024-002',
    name: '120L 12v Flexible LED Striplight',
    sku: 'SL-120L-12V-RGB',
    description: 'Versatile RGB flexible LED strip for accent lighting. Comes with an adhesive backing for easy installation.',
    supplier: 'LED Solutions Inc.',
    location: 'Aisle 1, Shelf B',
    stock: 80,
    reorderLevel: 30,
    imageUrl: 'https://placehold.co/400x400.png',
    fields: {
      ledQty: '120L',
      voltage: '12v',
      wattage: 14.4,
      meters: 5,
    },
    price: 950.00,
    status: 'In Stock',
  },
  // Power Supplies
  {
    id: 'PROD003',
    productCode: 'PRO-2024-003',
    name: '24v 150W Slim Power Supply',
    sku: 'PS-24V-150W-SL',
    description: 'Slim and compact 150W power supply for 24v LED systems. Fanless design for silent operation.',
    supplier: 'Power Systems Ltd.',
    location: 'Aisle 2, Shelf A',
    stock: 45,
    reorderLevel: 20,
    imageUrl: 'https://placehold.co/400x400.png',
    fields: {
      voltage: '24v',
      wattage: 150,
    },
    price: 1800.00,
    status: 'Low Stock',
  },
  {
    id: 'PROD004',
    productCode: 'PRO-2024-004',
    name: '12v 60W Waterproof Power Supply',
    sku: 'PS-12V-60W-WP',
    description: 'IP67 rated waterproof power supply suitable for outdoor and bathroom installations.',
    supplier: 'Power Systems Ltd.',
    location: 'Aisle 2, Shelf A',
    stock: 60,
    reorderLevel: 25,
    imageUrl: 'https://placehold.co/400x400.png',
    fields: {
      voltage: '12v',
      wattage: 60,
    },
    price: 1100.00,
    status: 'In Stock',
  },
  // General Lighting
  {
    id: 'PROD005',
    productCode: 'PRO-2024-005',
    name: 'Recessed LED Downlight 9W',
    sku: 'GL-DL-9W-CW',
    description: 'Modern cool-white recessed LED downlight. Energy efficient with a sleek, minimalist design.',
    supplier: 'Bright Ideas Lighting',
    location: 'Aisle 3, Shelf C',
    stock: 200,
    reorderLevel: 75,
    imageUrl: 'https://placehold.co/400x400.png',
    fields: {},
    price: 450.00,
    status: 'In Stock',
  },
  {
    id: 'PROD006',
    productCode: 'PRO-2024-006',
    name: 'Surface Mounted Ceiling Light 18W',
    sku: 'GL-CL-18W-WW',
    description: '18W warm-white surface-mounted ceiling light. Provides wide and even light distribution.',
    supplier: 'Bright Ideas Lighting',
    location: 'Aisle 3, Shelf D',
    stock: 0,
    reorderLevel: 60,
    imageUrl: 'https://placehold.co/400x400.png',
    fields: {},
    price: 750.00,
    status: 'Out of Stock',
  },
  // Aluminium Profiles
  {
    id: 'PROD007',
    productCode: 'PRO-2024-007',
    name: 'Recessed Aluminium Profile 2m',
    sku: 'AP-REC-2M-SL',
    description: '2-meter recessed aluminium profile for a clean, flush installation of LED strips. Includes diffuser.',
    supplier: 'AluExtrude Co.',
    location: 'Warehouse Bay 1',
    stock: 300,
    reorderLevel: 100,
    imageUrl: 'https://placehold.co/400x400.png',
    fields: {
      size: '2 meters',
      color: '#C0C0C0', // Silver
    },
    price: 350.00,
    status: 'In Stock',
  },
  {
    id: 'PROD008',
    productCode: 'PRO-2024-008',
    name: 'Surface Aluminium Profile 2m - Black',
    sku: 'AP-SUR-2M-BK',
    description: '2-meter surface-mounted aluminium profile in a matte black finish. Ideal for modern designs.',
    supplier: 'AluExtrude Co.',
    location: 'Warehouse Bay 2',
    stock: 150,
    reorderLevel: 50,
    imageUrl: 'https://placehold.co/400x400.png',
    fields: {
      size: '2 meters',
      color: '#000000', // Black
    },
    price: 400.00,
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
