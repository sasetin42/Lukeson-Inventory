export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  price: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  description: string;
  tags: string[];
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
