import type { Product, Supplier, Invoice, Sales, InventoryKpi } from './types';
import { Box, DollarSign, Tag, AlertTriangle, XCircle, Star, Clock, Repeat } from 'lucide-react';

export const products: Product[] = [
  { id: 'PROD001', name: 'Smart T-Shirt', sku: 'SKU-TS-001', category: 'Apparel', stock: 150, price: 25.00, status: 'In Stock', description: 'A comfortable and stylish t-shirt made from 100% organic cotton. Features a modern fit and a unique, minimalist design on the front. Available in multiple colors and sizes.', tags: ['cotton', 't-shirt', 'apparel', 'casual'], supplier: 'Global Textiles Inc.', unit: 'Pieces', barcode: '1234567890123', minStock: 50, maxStock: 200, initialStock: 150, image: 'https://placehold.co/40x40.png' },
  { id: 'PROD002', name: 'Ergonomic Mouse', sku: 'SKU-EM-002', category: 'Electronics', stock: 45, price: 75.50, status: 'Low Stock', description: 'A wireless ergonomic mouse designed for comfort during long hours of use. It features customizable buttons, adjustable DPI, and a long-lasting rechargeable battery.', tags: ['mouse', 'ergonomic', 'wireless', 'electronics'], supplier: 'Gadget Masters', unit: 'Pieces', barcode: '2345678901234', minStock: 20, maxStock: 100, initialStock: 45, image: 'https://placehold.co/40x40.png' },
  { id: 'PROD003', name: 'Insulated Water Bottle', sku: 'SKU-WB-003', category: 'Accessories', stock: 200, price: 30.00, status: 'In Stock', description: 'A 32oz stainless steel insulated water bottle that keeps drinks cold for 24 hours or hot for 12 hours. BPA-free and leak-proof lid.', tags: ['water bottle', 'insulated', 'stainless steel'], supplier: 'Eco-Friendly Wares', unit: 'Pieces', barcode: '3456789012345', minStock: 100, maxStock: 300, initialStock: 200, image: 'https://placehold.co/40x40.png' },
  { id: 'PROD004', name: 'Leather-bound Journal', sku: 'SKU-JN-004', category: 'Stationery', stock: 0, price: 22.00, status: 'Out of Stock', description: 'A classic leather-bound journal with 200 lined pages of high-quality, acid-free paper. Perfect for writing, sketching, or note-taking.', tags: ['journal', 'leather', 'notebook', 'stationery'], supplier: 'Eco-Friendly Wares', unit: 'Pieces', barcode: '4567890123456', minStock: 25, maxStock: 100, initialStock: 0, image: 'https://placehold.co/40x40.png' },
  { id: 'PROD005', name: 'Wireless Headphones', sku: 'SKU-HP-005', category: 'Electronics', stock: 80, price: 120.00, status: 'In Stock', description: 'Over-ear wireless headphones with active noise cancellation, a 30-hour battery life, and crystal-clear audio quality. Includes a carrying case.', tags: ['headphones', 'wireless', 'ANC', 'audio'], supplier: 'Gadget Masters', unit: 'Pieces', barcode: '5678901234567', minStock: 30, maxStock: 150, initialStock: 80, image: 'https://placehold.co/40x40.png' },
];

export const suppliers: Supplier[] = [
  { id: 'SUP001', name: 'Global Textiles Inc.', contact: { name: 'Jane Doe', email: 'jane.doe@globaltextiles.com', phone: '123-456-7890' }, address: '123 Textile Ave, Fabric City, FC 12345', contractTerms: 'Net 30', productsSupplied: 5 },
  { id: 'SUP002', name: 'Gadget Masters', contact: { name: 'John Smith', email: 'john.smith@gadgetmasters.com', phone: '234-567-8901' }, address: '456 Tech Park, Silicon Valley, SV 67890', contractTerms: 'Net 60', productsSupplied: 12 },
  { id: 'SUP003', name: 'Eco-Friendly Wares', contact: { name: 'Emily White', email: 'emily.white@ecowares.com', phone: '345-678-9012' }, address: '789 Green Way, Eco Town, ET 54321', contractTerms: 'Payment on delivery', productsSupplied: 8 },
];

export const invoices: Invoice[] = [
  { id: 'INV-2024-001', customerName: 'Alice Johnson', date: '2024-05-01', amount: 250.75, status: 'Paid' },
  { id: 'INV-2024-002', customerName: 'Bob Williams', date: '2024-05-15', amount: 150.00, status: 'Pending' },
  { id: 'INV-2024-003', customerName: 'Charlie Brown', date: '2024-04-10', amount: 500.25, status: 'Overdue' },
  { id: 'INV-2024-004', customerName: 'Diana Prince', date: '2024-05-20', amount: 80.50, status: 'Paid' },
  { id: 'INV-2024-005', customerName: 'Ethan Hunt', date: '2024-05-22', amount: 320.00, status: 'Pending' },
];

export const sales: Sales[] = [
  { id: 'SALE001', productName: 'Smart T-Shirt', customerName: 'Alice Johnson', date: '2024-05-28', quantity: 2, total: 50.00 },
  { id: 'SALE002', productName: 'Ergonomic Mouse', customerName: 'Diana Prince', date: '2024-05-27', quantity: 1, total: 75.50 },
  { id: 'SALE003', productName: 'Insulated Water Bottle', customerName: 'Bob Williams', date: '2024-05-26', quantity: 3, total: 90.00 },
  { id: 'SALE004', productName: 'Wireless Headphones', customerName: 'Frank Martin', date: '2024-05-25', quantity: 1, total: 120.00 },
  { id: 'SALE005', productName: 'Smart T-Shirt', customerName: 'Grace Lee', date: '2024-05-24', quantity: 5, total: 125.00 },
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
