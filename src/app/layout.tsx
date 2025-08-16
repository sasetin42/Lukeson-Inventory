
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Home, Package, FileText, Users, LogOut, Settings, LifeBuoy, BarChart3, List, FilePlus, FileMinus, Goal, Building, ChevronDown, LayoutGrid, BarChart2, ShoppingCart, ShoppingBag, FileCode, Warehouse, Truck, Users2, File, FileCog, Shield, DatabaseBackup, Banknote, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/icons/logo';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, SidebarContent, SidebarSeparator } from '@/components/ui/sidebar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/components/app-layout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


export const metadata: Metadata = {
  title: 'IMIS Pro - All-in-One Business Management',
  description: 'A comprehensive, all-in-one business management system tailored for businesses in the Philippines.',
};

const navGroups = [
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
          { href: '/category', icon: LayoutGrid, label: 'Category', color: 'text-red-500' },
          { href: '/warehouses', icon: Warehouse, label: 'Warehouses', color: 'text-green-500' },
          { href: '/inventory-settings', icon: Settings, label: 'Settings', color: 'text-yellow-500' },
        ],
      },
      {
        title: 'Sales',
        links: [
            { href: '/quotations', icon: FileText, label: 'Quotations', color: 'text-purple-500' },
            { href: '/sales-orders', icon: ShoppingCart, label: 'Sales Orders', color: 'text-red-500' },
            { href: '/invoices', icon: FileCog, label: 'Sales Invoices', color: 'text-yellow-500' },
            { href: '/payments', icon: Banknote, label: 'Payments', color: 'text-indigo-500' },
        ],
      },
      {
        title: 'Purchasing',
        links: [
            { href: '/purchase-requests', icon: ShoppingBag, label: 'Purchase Orders', color: 'text-blue-500' },
            { href: '/goods-receipts', icon: File, label: 'Goods Receipts', color: 'text-purple-500' },
            { href: '/bills', icon: FilePlus, label: 'Bills', color: 'text-pink-500' },
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
            { href: '/reports/ar-aging', icon: BarChart3, label: 'AR/AP Aging', color: 'text-yellow-500' },
            { href: '/reports/inventory-valuation', icon: BarChart3, label: 'Inventory Valuation', color: 'text-indigo-500' },
            { href: '/reports/pnl', icon: BarChart3, label: 'Profit & Loss', color: 'text-pink-500' },
            { href: '/reports/balance-sheet', icon: BarChart3, label: 'Balance Sheet', color: 'text-sky-500' },
            { href: '/reports/sales-by-customer', icon: BarChart3, label: 'Sales by Customer', color: 'text-green-500' },
            { href: '/reports/sales-by-item', icon: BarChart3, label: 'Sales by Item', color: 'text-blue-500' },
            { href: '/reports/purchase-analysis', icon: BarChart3, label: 'Purchase Analysis', color: 'text-purple-500' },
            { href: '/reports/audit-trail', icon: BarChart3, label: 'Audit Trail', color: 'text-red-500' },
            { href: '/reports/cash-flow-statement', icon: BarChart3, label: 'Cash Flow Statement', color: 'text-orange-500' },
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
            { href: '/security', icon: Shield, label: 'Audit Trail', color: 'text-pink-500' },
            { href: '/system-backup', icon: DatabaseBackup, label: 'System Backup', color: 'text-sky-500' },
        ],
      },
    ],
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Maven+Pro:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased h-full bg-background transition-colors duration-300" suppressHydrationWarning={true}>
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader>
              <div className="flex items-center gap-3">
                <Logo className="size-9 text-primary" />
                <div className="flex flex-col">
                  <h1 className="text-xl font-bold tracking-tight text-foreground">IMIS Pro</h1>
                  <p className="text-sm text-muted-foreground">Workspace</p>
                </div>
              </div>
            </SidebarHeader>
            <SidebarContent className="[&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
              <div className="flex flex-col gap-2 px-2">
                <Accordion type="multiple" defaultValue={['Overview', 'Inventory', 'Sales', 'Purchasing', 'Contacts', 'Reports']} className="w-full">
                  {navGroups.map((group, groupIndex) => (
                    <div key={group.title}>
                      {groupIndex > 0 && <SidebarSeparator className="my-2" />}
                      <h3 className={`text-sm font-semibold uppercase tracking-wider px-2 py-2 ${group.color || 'text-muted-foreground'}`}>{group.title}</h3>
                      {group.items.map((item) => (
                          <AccordionItem value={item.title} key={item.title}>
                            <AccordionTrigger>
                              <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 w-full">
                                  <span className="text-[14px] font-bold">{item.title}</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <SidebarMenu className="ml-4 border-l border-gray-200 dark:border-gray-700 py-1">
                                {item.links.map((link) => (
                                  <SidebarMenuItem key={link.label}>
                                    <SidebarMenuButton asChild>
                                      <Link href={link.href}>
                                        <link.icon className={link.color} />
                                        <span className="font-normal leading-[18px] text-[14px]">{link.label}</span>
                                      </Link>
                                    </SidebarMenuButton>
                                  </SidebarMenuItem>
                                ))}
                              </SidebarMenu>
                            </AccordionContent>
                          </AccordionItem>
                      ))}
                    </div>
                  ))}
                </Accordion>
              </div>
            </SidebarContent>
            <SidebarFooter className="mt-auto">
              <SidebarSeparator className="mb-2" />
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="justify-start w-full gap-2 p-2 h-auto">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://placehold.co/40x40.png" alt="Admin" data-ai-hint="user avatar" />
                      <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">Admin</p>
                      <p className="text-xs text-muted-foreground">admin@imis-pro.com</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <LifeBuoy className="mr-2 h-4 w-4" />
                    <span>Support</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarFooter>
          </Sidebar>
          <AppLayout>
            {children}
          </AppLayout>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
