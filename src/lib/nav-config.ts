import { LayoutGrid, BarChart2, Package, Warehouse, AlertTriangle, Settings, FileText, ShoppingCart, PlusCircle, FileCog, Banknote, ShoppingBag, File, Users, Truck, Briefcase, FileCode, BarChart3, Users2, Shield, DatabaseBackup, LucideIcon } from 'lucide-react';

export interface NavLink {
  href: string;
  icon: LucideIcon;
  label: string;
  color: string;
}

export interface NavSubGroup {
  title: string;
  links: NavLink[];
}

export interface NavGroup {
  title: string;
  color: string;
  items: NavSubGroup[];
}

export const navGroups: NavGroup[] = [
  {
    title: 'CORE FEATURES',
    color: 'text-blue-500',
    items: [
      {
        title: 'Overview',
        links: [
          { href: '/', icon: LayoutGrid, label: 'Dashboard', color: 'text-sky-500' },
          { href: '/analytics', icon: BarChart2, label: 'Analytics', color: 'text-green-500' },
        ],
      },
      {
        title: 'Inventory',
        links: [
          { href: '/products', icon: Package, label: 'Products', color: 'text-blue-500' },
          { href: '/warehouses', icon: Warehouse, label: 'Warehouses', color: 'text-green-500' },
          { href: '/stock-alerts', icon: AlertTriangle, label: 'Stock Alerts', color: 'text-red-500' },
          { href: '/inventory-settings', icon: Settings, label: 'Settings', color: 'text-yellow-500' },
        ],
      },
      {
        title: 'Sales',
        links: [
          { href: '/quotations', icon: FileText, label: 'Quotations', color: 'text-purple-500' },
          { href: '/sales-orders', icon: ShoppingCart, label: 'Sales Orders', color: 'text-red-500' },
          { href: '/job-orders', icon: PlusCircle, label: 'Job Order', color: 'text-orange-500' },
          { href: '/invoices', icon: FileCog, label: 'Sales Invoices', color: 'text-yellow-500' },
          { href: '/payments', icon: Banknote, label: 'Payments', color: 'text-indigo-500' },
        ],
      },
      {
        title: 'Purchasing',
        links: [
          { href: '/purchase-orders', icon: ShoppingBag, label: 'Purchase Orders', color: 'text-blue-500' },
          { href: '/goods-receipts', icon: File, label: 'Goods Receipts', color: 'text-purple-500' },
        ],
      },
      {
        title: 'Contacts',
        links: [
          { href: '/customer', icon: Users, label: 'Customers', color: 'text-purple-500' },
          { href: '/suppliers', icon: Truck, label: 'Suppliers', color: 'text-green-500' },
        ],
      },
    ],
  },
  {
    title: 'FINANCE',
    color: 'text-green-500',
    items: [
      {
        title: 'Accounting',
        links: [
          { href: '/chart-of-accounts', icon: Briefcase, label: 'Chart of Accounts', color: 'text-sky-500' },
          { href: '/journals', icon: FileCode, label: 'Journal Entries', color: 'text-red-500' },
        ],
      },
      {
        title: 'Reports',
        links: [
          { href: '/reports', icon: BarChart3, label: 'System Reports', color: 'text-orange-500' },
        ],
      },
    ],
  },
  {
    title: 'SETTINGS',
    color: 'text-red-500',
    items: [
      {
        title: 'System Settings',
        links: [
          { href: '/settings', icon: Settings, label: 'General Settings', color: 'text-yellow-500' },
          { href: '/users-management', icon: Users2, label: 'Users & Roles', color: 'text-indigo-500' },
          { href: '/security', icon: Shield, label: 'System Security', color: 'text-pink-500' },
          { href: '/system-backup', icon: DatabaseBackup, label: 'System Backup', color: 'text-sky-500' },
        ],
      },
    ],
  },
];

export const getAllModules = (): string[] => {
  const modules: string[] = [];
  navGroups.forEach(group => {
    group.items.forEach(item => {
      modules.push(item.title);
      item.links.forEach(link => {
        modules.push(link.label);
      });
    });
  });
  return modules;
};

export const getFullAdminPermissions = (): { [key: string]: 'Full Access' } => {
  const permissions: { [key: string]: 'Full Access' } = {};
  getAllModules().forEach(mod => {
    permissions[mod] = 'Full Access';
  });
  return permissions;
};
