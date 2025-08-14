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

export const metadata: Metadata = {
  title: 'ARKSHEETS - All-in-One Business Management',
  description: 'A comprehensive, all-in-one business management system tailored for businesses in the Philippines.',
};

const navItems = [
  { href: '/', icon: Home, label: 'Dashboard' },
  { href: '/inventory', icon: Package, label: 'Product Service Listing' },
  { href: '/stock-in', icon: FilePlus, label: 'Stock In Log (Add)' },
  { href: '/sales', icon: BarChart3, label: 'Sales Listing' },
  { href: '/invoices', icon: FileText, label: 'Invoice Generator' },
  { href: '/expenses', icon: FileMinus, label: 'Expense Listing' },
  { href: '/suppliers', icon: Users, label: 'Supplies Inventory' },
  { href: '/sales-report', icon: BarChart3, label: 'Sales Report' },
  { href: '/expense-report', icon: FileMinus, label: 'Expense Report' },
  { href: '/goals', icon: Goal, label: 'Target Goals' },
  { href: '/financial-statement', icon: Building, label: 'Financial Statement' },
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
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild>
                      <Link href={item.href}>
                        <item.icon />
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
          <SidebarInset className="flex flex-col transition-all duration-300 ease-in-out">
            <header className="sticky top-0 z-10 flex h-14 items-center gap-4 bg-transparent px-4 md:px-6">
              <SidebarTrigger className="md:hidden" />
              <div className="flex-1">
                 <h1 className="text-2xl font-bold">Lukeson Company IMS</h1>
              </div>
               <Link href="/settings">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
                </Button>
              </Link>
            </header>
            <main className="flex-1 overflow-auto p-4 md:p-6">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
