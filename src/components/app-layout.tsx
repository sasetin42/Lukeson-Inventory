'use client';

import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const mainRef = useRef<HTMLElement>(null);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (mainRef.current) {
                setScrolled(mainRef.current.scrollTop > 5);
            }
        };

        const mainEl = mainRef.current;
        mainEl?.addEventListener('scroll', handleScroll);

        return () => {
            mainEl?.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        if (mainRef.current) {
            mainRef.current.scrollTop = 0;
            setScrolled(false);
        }
    }, [pathname]);

    return (
        <SidebarInset className="flex flex-col transition-all duration-300 ease-in-out">
            <header data-scrolled={scrolled} className="sticky top-0 z-10 flex h-auto items-center gap-4 border-b bg-background px-4 py-2 transition-all duration-300 sm:h-auto sm:border-0 md:px-6">
                <SidebarTrigger className="md:hidden" />
                <div className="flex-1" />
            </header>
            <main ref={mainRef} className="flex-1 overflow-auto p-4 pt-0 md:p-6 md:pt-0">
                {children}
            </main>
        </SidebarInset>
    );
}
