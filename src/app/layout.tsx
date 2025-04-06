import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import React from 'react';
import { disableConsole } from '@/utils/disableConsole';

const inter = Inter({ subsets: ['latin'] });

// Disable console in production
if (typeof window !== 'undefined') {
  disableConsole();
}

export const metadata: Metadata = {
  title: 'GeoGenius India',
  description: 'Test your knowledge of Indian cities in this engaging geography game',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-white text-gray-900`}>
        <div className="min-h-screen">
          <React.StrictMode>
            {children}
          </React.StrictMode>
        </div>
      </body>
    </html>
  );
} 