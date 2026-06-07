import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/app/globals.css';
import { Analytics } from '@codeswayam/analytics';
import { Providers } from '@/app/providers/providers';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Auraflow',
  description: 'Social Media Management SaaS',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <Analytics
          gtmId={process.env.NEXT_PUBLIC_GTM_ID}
          ga4Id={process.env.NEXT_PUBLIC_GA4_ID}
          metaPixelId={process.env.NEXT_PUBLIC_META_PIXEL_ID}
          appName="auraflow"
        />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}