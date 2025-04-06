'use client';

import { useEffect } from 'react';
import { disableConsole } from '@/utils/disableConsole';
import GoogleAnalytics from './GoogleAnalytics';

export default function GoogleAnalyticsWrapper() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      disableConsole();
    }
  }, []);

  if (typeof window === 'undefined') {
    return null;
  }

  return process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? (
    <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
  ) : null;
} 