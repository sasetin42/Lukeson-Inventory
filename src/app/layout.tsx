import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Home, Package, FileText, Users, LogOut, Settings, LifeBuoy, BarChart3, List, FilePlus, FileMinus, Goal, Building, ChevronDown, LayoutGrid, BarChart2, ShoppingCart, ShoppingBag, FileCode, Warehouse, Truck, Users2, File, FileCog, Shield, DatabaseBackup } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/icons/logo';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, SidebarContent, SidebarSeparator } from '@/components/ui/sidebar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/components/app-layout';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';


export const metadata: Metadata = {
  title: 'ARKSHEETS - All-in-One Business Management',
  description: 'A comprehensive, all-in-one business management system tailored for businesses in the Philippines.',
};

const navGroups = [
  {
    title: 'CORE FEATURES',
    items: [
      {
        title: 'Overview Management',
        links: [
          { href: '/', icon: LayoutGrid, label: 'Dashboard', color: 'text-sky-500' },
          { href: '/analytics', icon: BarChart2, label: 'Analytics', color: 'text-green-500' },
        ],
      },
      {
        title: 'Inventory Management',
        links: [
          { href: '/inventory', icon: Package, label: 'Product', color: 'text-blue-500' },
          { href: '/category', icon: List, label: 'Category', color: 'text-orange-500' },
          { href: '/variations', icon: FileText, label: 'Variations', color: 'text-purple-500' },
        ],
      },
      {
        title: 'Product Catalog',
        links: [
          { href: '/item-master-list', icon: List, label: 'Item Master List', color: 'text-red-500' },
          { href: '/sku-management', icon: FileText, label: 'SKU Management', color: 'text-yellow-500' },
          { href: '/barcode-qr-code', icon: BarChart3, label: 'Barcode / QR Code', color: 'text-indigo-500' },
        ],
      },
      {
        title: 'Warehousing',
        links: [
          { href: '/inbound-operations', icon: FilePlus, label: 'Inbound Operations', color: 'text-pink-500' },
          { href: '/outbound-operations', icon: FileMinus, label: 'Outbound Operations', color: 'text-sky-500' },
          { href: '/bin-rack-locations', icon: Warehouse, label: 'Bin / Rack Locations', color: 'text-green-500' },
          { href: '/warehouse-map', icon: Building, label: 'Warehouse Map', color: 'text-blue-500' },
          { href: '/replenishment-planning', icon: Goal, label: 'Replenishment Planning', color: 'text-orange-500' },
        ],
      },
    ],
  },
  {
    title: 'OPERATIONS',
    items: [
      {
        title: 'Sales and CRM',
        links: [
            { href: '/customer', icon: Users, label: 'Customer', color: 'text-purple-500' },
            { href: '/sales-orders', icon: ShoppingCart, label: 'Sales Orders', color: 'text-red-500' },
            { href: '/invoicing', icon: FileText, label: 'Invoicing', color: 'text-yellow-500' },
            { href: '/payments', icon: FilePlus, label: 'Payments', color: 'text-indigo-500' },
            { href: '/invoice-templates', icon: FileCog, label: 'Invoice Templates', color: 'text-pink-500' },
            { href: '/sales-reports', icon: BarChart3, label: 'Reports & Analytics', color: 'text-sky-500' },
        ],
      },
      {
        title: 'Procurement',
        links: [
            { href: '/suppliers', icon: Truck, label: 'Supplier', color: 'text-green-500' },
            { href: '/purchase-requests', icon: ShoppingBag, label: 'Purchase Requests', color: 'text-blue-500' },
            { href: '/purchase-orders', icon: ShoppingCart, label: 'Purchase Orders', color: 'text-orange-500' },
            { href: '/goods-receipts', icon: File, label: 'Goods Receipts', color: 'text-purple-500' },
            { href: '/procurement-reports', icon: BarChart3, label: 'Reports', color: 'text-red-500' },
        ],
      },
    ],
  },
  {
    title: 'SETTINGS',
    items: [
      {
        title: 'System Settings',
        links: [
            { href: '/settings', icon: Settings, label: 'General Settings', color: 'text-yellow-500' },
            { href: '/users-management', icon: Users2, label: 'Users Management', color: 'text-indigo-500' },
            { href: '/security', icon: Shield, label: 'Security', color: 'text-pink-500' },
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased h-full bg-background transition-colors duration-300">
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader>
              <div className="flex items-center gap-2">
                <Logo className="size-8 text-primary" />
                <span className="text-lg font-semibold text-foreground">ARKSHEETS</span>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <div className="flex flex-col gap-2 px-2">
                {navGroups.map((group) => (
                  <div key={group.title}>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-2">{group.title}</h3>
                    {group.items.map((item) => (
                      <Collapsible key={item.title} defaultOpen className="w-full">
                        <CollapsibleTrigger className="w-full">
                            <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 w-full">
                                <span className="text-sm font-medium">{item.title}</span>
                                <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                            </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenu className="ml-4 border-l border-gray-200 dark:border-gray-700 py-1">
                            {item.links.map((link) => (
                              <SidebarMenuItem key={link.label}>
                                <SidebarMenuButton asChild>
                                  <Link href={link.href}>
                                    <link.icon className={link.color} />
                                    <span>{link.label}</span>
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            ))}
                          </SidebarMenu>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                ))}
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
                      <p className="text-xs text-muted-foreground">admin@stockpilot.com</p>
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
