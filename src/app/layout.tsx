import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from '@/components/client-layout';

export const metadata: Metadata = {
  title: 'IMIS Pro - All-in-One Business Management',
  description: 'Inventory & Business Management System',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="font-body antialiased h-full bg-background transition-colors duration-300" suppressHydrationWarning={true}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
