import { Timestamp } from "firebase/firestore";

// Base Product Type
export type Product = {
  id: string;
  productCode?: string;
  name: string;
  sku?: string;
  category: "STRIPLIGHT" | "POWER SUPPLY" | "GENERAL LIGHTING" | "ALUMINIUM PROFILE";
  description?: string;
  supplier?: string;
  location?: string;
  stock: number;
  reorderLevel: number;
  imageUrl?: string;
  createdAt?: Timestamp;
  price?: number;
  status?: 'In Stock' | 'Low Stock' | 'Out of Stock';
  tags?: string[];
  unit?: string;
  barcode?: string;
  minStock?: number;
  maxStock?: number;
  initialStock?: number;
  image?: string;
  lastSoldDate?: string;
  // Category-specific fields
  fields?: StriplightFields | PowerSupplyFields | GeneralLightingFields | AluminiumProfileFields;
};

// Category-specific field types
export type StriplightFields = {
  ledQty: "240L" | "180L" | "120L" | "72L" | "60L";
  voltage: "220v" | "48v" | "24v" | "12v";
  wattage: number;
  meters: number;
};

export type PowerSupplyFields = {
  voltage: "220v" | "48v" | "24v" | "12v";
  wattage: number;
};

export type GeneralLightingFields = {};

export type AluminiumProfileFields = {
  size: string;
  color: string;
};


export type Supplier = {
  id: string;
  name:string;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  address: string;
  contractTerms: string;
  productsSupplied: number;
};

export type Invoice = {
  id: string;
  customerName: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
};

export type Sales = {
  id: string;
  productName: string;
  customerName: string;
  date: string;
  quantity: number;
  total: number;
};

export type InventoryKpi = {
    title: string;
    value: string | number;
    icon: any;
    subtext: string;
    color: 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'indigo' | 'cyan' | 'teal';
};

export type Category = {
    id: string;
    name: string;
    description?: string;
    parent?: string;
    color?: string;
    icon?: string;
    createdAt?: Timestamp;
};
