"use client"

import React, { useEffect } from 'react';
import { disableConsole } from '@/utils/disableConsole';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    disableConsole();
  }, []);

  return (
    <div className="min-h-screen">
      <React.StrictMode>
        {children}
      </React.StrictMode>
    </div>
  );
} 