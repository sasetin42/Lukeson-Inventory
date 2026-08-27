'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider, Sidebar, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, SidebarContent, SidebarSeparator } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Home, Package, FileText, Users, LogOut, Settings, LifeBuoy, BarChart3, List, FilePlus, FileMinus, Goal, Building, ChevronDown, LayoutGrid, BarChart2, ShoppingCart, ShoppingBag, FileCode, Warehouse, Truck, Users2, File, FileCog, Shield, DatabaseBackup, Banknote, Briefcase, PlusCircle, AlertTriangle, User, Loader2 } from 'lucide-react';
import { Logo } from '@/components/icons/logo';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/components/app-layout';
import UserProfileModal from '@/components/users/user-profile-modal';
import { useToast } from '@/hooks/use-toast';
import { AuthProvider, useAuth } from '@/context/auth-context';
import SupportModal from '@/components/support/support-modal';

import { navGroups } from '@/lib/nav-config';
import { NavigationProgress } from '@/components/ui/navigation-progress';

function AppContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, logout, firebaseUser, userRole, user, rolePermissions, profile, companyProfile } = useAuth();
  const { toast } = useToast();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
        await logout();
        toast({ title: "Logged Out", description: "You have been successfully logged out.", variant: 'success' });
    } catch (error) {
        toast({ title: "Logout Failed", description: "An error occurred during logout.", variant: 'destructive' });
    }
  };
  
  const normalizedPathname = pathname ? pathname.replace(/\/$/, '') || '/' : '/';
  const isAuthPage = normalizedPathname === '/login';
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground font-medium">Loading IMIS...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated && !isAuthPage) {
      return (
        <div className="flex items-center justify-center min-h-screen w-full bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
  }
  
  if (isAuthPage) {
      return (
        <div className="w-full min-h-screen">
          <NavigationProgress />
          {children}
        </div>
      );
  }

  const isAdmin = 
    userRole?.toLowerCase() === 'admin' || 
    userRole?.toLowerCase() === 'administrator' ||
    user?.role?.toLowerCase() === 'admin' || 
    user?.role?.toLowerCase() === 'administrator' ||
    firebaseUser?.email?.toLowerCase().includes('admin');

  const hasAccess = (module: string) => {
    if (isAdmin) return true;
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
        <NavigationProgress />
        <Sidebar>
          <SidebarHeader className="pt-4 pb-2 px-3">
            <div className="flex flex-col items-start text-left gap-2">
              {companyProfile.logo ? (
                  <Image src={companyProfile.logo} alt={companyProfile.name} width={72} height={72} style={{ width: 'auto', height: 'auto' }} className="max-h-16 max-w-16 object-contain rounded-md" data-ai-hint="logo" />
              ) : (
                  <Logo className="size-16 text-primary" />
              )}
              <div className="flex flex-col items-start">
                <h1 className="text-[12px] font-semibold tracking-tight text-foreground leading-tight">{companyProfile.name}</h1>
                <p className="text-[10px] font-semibold text-muted-foreground leading-tight mt-0.5">Inventory System</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 px-1 py-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40">
            <div className="flex flex-col gap-2 px-2 min-w-0">
                {filteredNavGroups.map((group, groupIndex) => (
                  <div key={group.title}>
                    {groupIndex > 0 && <SidebarSeparator className="my-2" />}
                    <h3 className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-1.5 ${group.color || 'text-muted-foreground'}`}>{group.title}</h3>
                    {group.items.map((item) => (
                        <div key={item.title}>
                            <div className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 w-full">
                                <span className="text-[12px] font-semibold">{item.title}</span>
                            </div>
                            <div>
                                <SidebarMenu className="ml-3.5 border-l border-gray-200 dark:border-gray-700 py-0.5">
                                {item.links.map((link) => {
                                    const isActive = pathname === link.href;
                                    return (
                                      <SidebarMenuItem key={link.label}>
                                        <SidebarMenuButton asChild isActive={isActive} className={isActive ? 'bg-primary/10 text-primary font-medium text-[12px]' : 'text-[12px] font-medium'}>
                                            <Link href={link.href} prefetch={false}>
                                              <link.icon className={isActive ? 'text-primary' : link.color} />
                                              <span className="font-medium leading-[16px] text-[12px]">{link.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                      </SidebarMenuItem>
                                    );
                                })}
                                </SidebarMenu>
                            </div>
                        </div>
                    ))}
                  </div>
                ))}
            </div>
          </SidebarContent>
          <SidebarFooter className="mt-auto">
            <SidebarSeparator className="mb-2" />
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="justify-start w-full gap-2 px-2 py-1.5 h-auto text-left items-center rounded-lg">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarImage src={profile.avatar} alt={profile.name} data-ai-hint="user avatar" />
                    <AvatarFallback className="text-xs">{firebaseUser?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="text-left min-w-0 flex-1 overflow-hidden">
                    <p className="text-xs font-semibold text-foreground leading-none truncate">{profile.name}</p>
                    <p className="text-[11px] text-muted-foreground leading-none truncate mt-1" title={firebaseUser?.email || ''}>{firebaseUser?.email}</p>
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
                  <Link href="/settings" prefetch={false}>
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
            <div className="px-2 mt-2 flex justify-center">
              <a href="https://sasewebsolutions.com/" target="_blank" rel="noopener noreferrer">
                <Button
                  className="text-xs h-auto px-3 py-1.5"
                  style={{
                    background: 'linear-gradient(to right, #10A3D8, #054B8C)',
                    color: '#FFFFFF'
                  }}
                >
                  Develop by: SaSe Web Solutions
                </Button>
              </a>
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

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DynamicFaviconAndTitle />
      <AppContent>{children}</AppContent>
      <Toaster />
    </AuthProvider>
  );
}
