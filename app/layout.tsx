import type { ReactNode } from 'react';

import localFont from 'next/font/local';

import { QueryProvider } from '@/shared/providers/query-provider';

import type { Metadata, Viewport } from 'next';

import '@/styles/globals.css';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: '가치가자',
  description: '수고까지 나누는 우정여행',
  applicationName: '가치가자',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '가치가자',
  },
  formatDetection: {
    telephone: false,
  },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/brand/logo-gachigaja.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/brand/logo-gachigaja.svg' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#3366ff',
};

const pretendard = localFont({
  src: '../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2',
  variable: '--font-pretendard',
  display: 'swap',
});

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body className="bg-gray-0 flex min-h-dvh flex-col text-gray-900 antialiased">
        <QueryProvider>
          <main className="flex-1">{children}</main>
        </QueryProvider>
      </body>
    </html>
  );
};

export default RootLayout;
