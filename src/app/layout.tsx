import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Home, Package, FileText, Users, LogOut, Settings, LifeBuoy, BarChart3, List, FilePlus, FileMinus, Goal, Building } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/icons/logo';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, SidebarContent, SidebarSeparator } from '@/components/ui/sidebar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/components/app-layout';

export const metadata: Metadata = {
  title: 'ARKSHEETS - All-in-One Business Management',
  description: 'A comprehensive, all-in-one business management system tailored for businesses in the Philippines.',
};

const navItems = [
  { href: '/', icon: Home, label: 'Dashboard', color: 'text-sky-500' },
  { href: '/inventory', icon: Package, label: 'Product Service Listing', color: 'text-green-500' },
  { href: '/stock-in', icon: FilePlus, label: 'Stock In Log (Add)', color: 'text-blue-500' },
  { href: '/sales', icon: BarChart3, label: 'Sales Listing', color: 'text-orange-500' },
  { href: '/invoices', icon: FileText, label: 'Invoice Generator', color: 'text-purple-500' },
  { href: '/expenses', icon: FileMinus, label: 'Expense Listing', color: 'text-red-500' },
  { href: '/suppliers', icon: Users, label: 'Supplies Inventory', color: 'text-yellow-500' },
  { href: '/sales-report', icon: BarChart3, label: 'Sales Report', color: 'text-orange-500' },
  { href: '/expense-report', icon: FileMinus, label: 'Expense Report', color: 'text-red-500' },
  { href: '/goals', icon: Goal, label: 'Target Goals', color: 'text-indigo-500' },
  { href: '/financial-statement', icon: Building, label: 'Financial Statement', color: 'text-pink-500' },
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
              <SidebarMenu className="p-4">
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild>
                      <Link href={item.href}>
                        <item.icon className={item.color} />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
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
