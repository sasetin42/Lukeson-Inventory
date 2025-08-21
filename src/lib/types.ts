
import type { LucideIcon } from "lucide-react";

// Main Company Information
export type Company = {
    id: string;
    name: string;
    tin?: string;
    address?: string;
    phone?: string;
    email?: string;
    logoUrl?: string;
    timezone: string; // e.g., 'Asia/Manila'
    currency: string; // e.g., 'PHP'
    currencySymbol: string; // e.g., '₱'
    taxDefault: number; // e.g., 0.12 for 12%
};

// User and Role Management
export type User = {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Inventory Manager' | 'Sales' | 'Purchasing' | 'Finance' | 'Auditor';
    status: 'active' | 'inactive';
    lastLoginAt?: string | Date;
    createdAt: string | Date;
};

// Contacts
export type Customer = {
    id: string;
    name: string;
    tin?: string;
    billingAddress: string;
    shippingAddress?: string;
    termsDays: number;
    creditLimit: number;
    balance: number;
};

export type Supplier = {
    id: string;
    name: string;
    contact: {
        name: string;
        email: string;
        phone: string;
    };
    address: string;
    contractTerms: string;
};

// Inventory and Warehousing
export type Warehouse = {
    id: string;
    name: string;
    code: string;
    address: string;
    isPrimary: boolean;
};

export type ItemCategory = {
    id: string;
    name: string;
    description?: string;
    productImage?: string;
    parentId?: string;
    createdAt: string | Date;
};

export type Stock = {
    id: string; // Composite key: `${itemId}_${warehouseId}`
    itemId: string;
    warehouseId: string;
    onHand: number;
    committed: number;
    ordered: number;
};

// Transaction Line Item (used across multiple documents)
export type DocumentLine = {
    id: string;
    itemId: string;
    description: string;
    quantity: number;
    uom: string;
    unitPrice: number;
    discount?: number; // as a percentage
    taxRate: number;
    total: number;
};


// Sales Documents
export type Quotation = {
    id: string; // QTN-YYYY-XXXX
    customerId: string;
    qtnDate: string | Date;
    expiryDate: string | Date;
    status: 'Draft' | 'Sent' | 'Accepted' | 'Expired';
    totalAmount: number;
    lines: DocumentLine[];
};

export type SalesOrder = {
    id: string; // SO-YYYY-XXXX
    customerId: string;
    orderDate: string | Date;
    status: 'Draft' | 'Confirmed' | 'Fulfilled' | 'Invoiced' | 'Cancelled';
    totalAmount: number;
    lines: DocumentLine[];
};

export type SalesInvoice = {
    id:string; // INV-YYYY-XXXX
    salesOrderId: string;
    invoiceDate: string | Date;
    dueDate: string | Date;
    status: 'Draft' | 'Posted' | 'Paid' | 'Overdue';
    totalAmount: number;
    paidAmount: number;
    balance: number;
    lines: DocumentLine[];
};

export type Payment = {
    id: string;
    invoiceId: string;
    paymentDate: string | Date;
    amount: number;
    paymentMethod: string;
};


// Purchasing Documents
export type PurchaseOrder = {
    id: string; // PO-YYYY-XXXX
    supplierId: string;
    orderDate: string | Date;
    expectedDeliveryDate: string | Date;
    status: 'Draft' | 'Sent' | 'Confirmed' | 'Partially Received' | 'Received' | 'Billed' | 'Cancelled';
    totalAmount: number;
    lines: DocumentLine[];
};

export type GoodsReceipt = {
    id: string; // GRN-YYYY-XXXX
    purchaseOrderId: string;
    receiptDate: string | Date;
    warehouseId: string;
    lines: {
        id: string;
        itemId: string;
        orderedQty: number;
        receivedQty: number;
    }[];
};

export type Bill = {
    id: string;
    goodsReceiptId: string;
    billDate: string | Date;
    dueDate: string | Date;
    status: 'Draft' | 'Posted' | 'Paid' | 'Overdue';
    totalAmount: number;
    paidAmount: number;
    balance: number;
    lines: DocumentLine[];
};

export type SupplierPayment = {
    id: string;
    billId: string;
    paymentDate: string | Date;
    amount: number;
    paymentMethod: string;
};


// Stock Movement & Returns
export type StockMovement = {
    id: string;
    moveDate: string | Date;
    type: 'Transfer' | 'Adjustment-In' | 'Adjustment-Out';
    fromWarehouseId?: string;
    toWarehouseId?: string;
    itemId: string;
    quantity: number;
    reason: string;
};

export type Return = {
    id: string; // RA-YYYY-XXXX
    type: 'Sales Return' | 'Purchase Return';
    documentId: string; // SalesInvoiceId or GoodsReceiptId
    returnDate: string | Date;
    status: 'Pending' | 'Approved' | 'Rejected';
    lines: {
        id: string;
        itemId: string;
        quantity: number;
        reason: string;
    }[];
};

// Dashboard Types
export type TopSellingItem = {
    id: string;
    name: string;
    productImage?: string;
    unitsSold: number;
    revenue: number;
};

export type SlowMovingItem = {
    id: string;
    name: string;
    productImage?: string;
    daysInStock: number;
    stock: number;
};

export type QuickStat = {
    label: string;
    value: string | number;
};

export type LowStockAlert = {
    id: string;
    name: string;
    sku: string;
    stock: number;
    reOrderLevel: number;
};

// DEPRECATED / MOCK TYPES
export type Invoice = {
  id: string;
  customerName: string;
  date: string | Date;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
};

export type Sales = {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  date: string | Date;
  quantity: number;
  total: number;
};

export type ProductKpi = {
    title: string;
    value: string | number;
    icon: LucideIcon;
    subtext: string;
    color: 'blue' | 'green' | 'yellow' | 'purple' | 'red' | 'indigo' | 'cyan' | 'orange' | 'pink' | 'teal';
};

export type Product = {
    id: string;
    productCode?: string;
    category: string;
    productImage?: string | null;
    name: string;
    sku: string;
    description: string;
    ledQty: number;
    voltage: number;
    wattage: number;
    meters: number;
    supplier: string;
    location: string;
    stock: number;
    price: number;
    reOrderLevel: number;
    createdAt: string | Date;
    modifiedAt?: string | Date;
    status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Discontinued';
    suppliers?: Supplier[];
    uom: string;
    expiryDateTracking: boolean;
};
