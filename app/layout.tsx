import type { ReactNode } from 'react';

import localFont from 'next/font/local';

import { QueryProvider } from '@/shared/providers/query-provider';

import type { Metadata } from 'next';

import '@/styles/globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Valuego',
  description: 'Valuego frontend',
};

const pretendard = localFont({
  src: '../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2',
  variable: '--font-pretendard',
  display: 'swap',
});

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body className="bg-gray-0 flex min-h-screen flex-col text-gray-900 antialiased">
        <QueryProvider>
          <main className="flex-1">{children}</main>
        </QueryProvider>
      </body>
    </html>
  );
};

export default RootLayout;
