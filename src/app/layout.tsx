import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import GoogleAnalyticsWrapper from '@/components/GoogleAnalyticsWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GeoGenius India - Test Your Knowledge of Indian Cities',
  description: 'A fun and interactive game to test your knowledge of Indian cities. Guess cities based on images and hints, learn about different places in India, and improve your geographical knowledge.',
  keywords: 'India, cities, geography, game, quiz, education, learning, Indian cities, landmarks, culture',
  authors: [{ name: 'Parth Panchal' }],
  creator: 'Parth Panchal',
  publisher: 'GeoGenius India',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://geogenius-india.vercel.app',
    title: 'GeoGenius India - Test Your Knowledge of Indian Cities',
    description: 'A fun and interactive game to test your knowledge of Indian cities. Guess cities based on images and hints, learn about different places in India, and improve your geographical knowledge.',
    siteName: 'GeoGenius India',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'GeoGenius India - Indian Cities Quiz Game',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GeoGenius India - Test Your Knowledge of Indian Cities',
    description: 'A fun and interactive game to test your knowledge of Indian cities. Guess cities based on images and hints, learn about different places in India, and improve your geographical knowledge.',
    images: ['/og-image.jpg'],
    creator: '@parthpanchal',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: '#ffffff',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        {children}
        <GoogleAnalyticsWrapper />
      </body>
    </html>
  );
} 