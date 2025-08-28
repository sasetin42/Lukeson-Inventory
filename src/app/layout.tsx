
'use client';
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Home, Package, FileText, Users, LogOut, Settings, LifeBuoy, BarChart3, List, FilePlus, FileMinus, Goal, Building, ChevronDown, LayoutGrid, BarChart2, ShoppingCart, ShoppingBag, FileCode, Warehouse, Truck, Users2, File, FileCog, Shield, DatabaseBackup, Banknote, Briefcase, PlusCircle, AlertTriangle, User, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/icons/logo';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, SidebarContent, SidebarSeparator } from '@/components/ui/sidebar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/components/app-layout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import UserProfileModal from '@/components/users/user-profile-modal';
import { useToast } from '@/hooks/use-toast';
import { AuthProvider, useAuth } from '@/context/auth-context';
import SupportModal from '@/components/support/support-modal';
import Image from 'next/image';


// export const metadata: Metadata = {
//   title: 'IMIS Pro - All-in-One Business Management',
//   description: 'A comprehensive, all-in-one business management system tailored for businesses in the Philippines.',
// };

export const navGroups = [
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

function AppContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, logout, firebaseUser, userRole, rolePermissions, profile, companyProfile, loadingScreenSettings } = useAuth();
  const { toast } = useToast();
  const [openAccordion, setOpenAccordion] = useState(['Overview', 'Inventory', 'Sales']);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const pathname = usePathname();

  const handleAccordionChange = (value: string[]) => {
      const alwaysOpen = ['Overview', 'Inventory', 'Sales'];
      let newOpenState = [...value];

      for (const item of alwaysOpen) {
        if (!newOpenState.includes(item)) {
          newOpenState.push(item);
        }
      }
      
      const changedItem = value.find(item => !openAccordion.includes(item)) || openAccordion.find(item => !value.includes(item));

      if (changedItem && !alwaysOpen.includes(changedItem)) {
        newOpenState = newOpenState.filter(item => alwaysOpen.includes(item) || item === changedItem);
      }
      
      setOpenAccordion(newOpenState);
  }
  
  const handleLogout = async () => {
    try {
        await logout();
        toast({ title: "Logged Out", description: "You have been successfully logged out.", variant: 'success' });
    } catch (error) {
        toast({ title: "Logout Failed", description: "An error occurred during logout.", variant: 'destructive' });
    }
  };
  
  if (isLoading) {
    const { logo, text, backgroundColor } = loadingScreenSettings;
    return (
        <div 
            className="flex h-screen w-full flex-col items-center justify-center gap-4 transition-colors duration-500" 
            style={{ backgroundColor: backgroundColor || 'hsl(var(--background))' }}
        >
            {logo && <Image src={logo} alt="Loading Logo" width={120} height={120} className="animate-pulse" data-ai-hint="logo"/>}
            <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p className="text-lg font-semibold">{text || 'Loading...'}</p>
            </div>
        </div>
    );
  }
  
  if (!isAuthenticated && pathname !== '/login') {
      return null;
  }
  
  if (pathname === '/login') {
      return <>{children}</>;
  }

  const hasAccess = (module: string) => {
    if (!rolePermissions) return false;
    const permission = rolePermissions[module];
    return permission === 'Full Access' || permission === 'Read-only';
  };

  const filteredNavGroups = navGroups.map(group => ({
      ...group,
      items: group.items.map(item => ({
          ...item,
          links: item.links.filter(link => hasAccess(link.label))
      })).filter(item => item.links.length > 0)
  })).filter(group => group.items.length > 0);

  return (
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-3">
              {companyProfile.logo ? (
                  <Image src={companyProfile.logo} alt={companyProfile.name} width={56} height={56} className="rounded-md" data-ai-hint="logo" />
              ) : (
                  <Logo className="size-14 text-primary" />
              )}
              <div className="flex flex-col">
                <h1 className="text-company-name font-bold tracking-tight text-foreground">{companyProfile.name}</h1>
                <p className="text-sm text-muted-foreground">Inventory System</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="[&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            <div className="flex flex-col gap-2 px-2">
              <Accordion 
                type="multiple"
                className="w-full" 
                value={openAccordion} 
                onValueChange={handleAccordionChange}
              >
                {filteredNavGroups.map((group, groupIndex) => (
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
                    <AvatarImage src={profile.avatar} alt={profile.name} data-ai-hint="user avatar" />
                    <AvatarFallback>{firebaseUser?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">{profile.name}</p>
                    <p className="text-xs text-muted-foreground">{firebaseUser?.email}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsProfileModalOpen(true)}>
                    <User className="mr-2 h-4 w-4 text-purple-500" />
                    <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4 text-blue-500" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsSupportModalOpen(true)}>
                  <LifeBuoy className="mr-2 h-4 w-4 text-yellow-500" />
                  <span>Support</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4 text-red-500" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="px-2 mt-2">
              <Button
                className="w-full text-xs"
                style={{
                  background: 'linear-gradient(to right, #42BBFF, #6C47B5)',
                  color: '#FFFFFF'
                }}
              >
                Develop by: SaSe App Solutions
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <AppLayout>
          {children}
        </AppLayout>
        <UserProfileModal 
          isOpen={isProfileModalOpen} 
          onClose={() => setIsProfileModalOpen(false)} 
        />
        <SupportModal
          isOpen={isSupportModalOpen}
          onClose={() => setIsSupportModalOpen(false)}
        />
      </SidebarProvider>
  );
}

function DynamicFaviconAndTitle() {
    const { companyProfile } = useAuth();
    
    useEffect(() => {
        if (companyProfile.siteIcon) {
            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = companyProfile.siteIcon;
        }

        if(companyProfile.siteTitle) {
            document.title = companyProfile.siteTitle;
        } else {
            document.title = 'IMIS Pro - All-in-One Business Management';
        }
    }, [companyProfile.siteIcon, companyProfile.siteTitle]);

    return null;
}

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
        <title>IMIS Pro - All-in-One Business Management</title>
        <meta name="description" content="A comprehensive, all-in-one business management system tailored for businesses in the Philippines." />
      </head>
      <body className="font-body antialiased h-full bg-background transition-colors duration-300" suppressHydrationWarning={true}>
        <AuthProvider>
            <DynamicFaviconAndTitle />
            <AppContent>{children}</AppContent>
            <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
